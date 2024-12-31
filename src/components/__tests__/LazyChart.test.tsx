import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import LazyChart from '../LazyChart';
import { Chart as ChartJS } from 'chart.js/auto';

// Mock de ChartJS
vi.mock('chart.js/auto', () => ({
  Chart: vi.fn().mockImplementation(() => ({
    destroy: vi.fn(),
    update: vi.fn(),
  })),
}));

describe('LazyChart', () => {
  const mockData = {
    labels: ['A', 'B', 'C'],
    datasets: [
      {
        data: [1, 2, 3],
        backgroundColor: ['red', 'blue', 'green'],
      },
    ],
  };

  const mockOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería renderizar el componente de carga inicialmente', () => {
    render(<LazyChart type="pie" data={mockData} />);
    expect(screen.getByText('Cargando gráfico...')).toBeInTheDocument();
  });

  it('debería inicializar el gráfico correctamente', async () => {
    const { container } = render(
      <LazyChart type="pie" data={mockData} options={mockOptions} />
    );

    await waitFor(() => {
      expect(ChartJS).toHaveBeenCalledWith(
        expect.any(HTMLCanvasElement),
        {
          type: 'pie',
          data: mockData,
          options: expect.objectContaining({
            responsive: true,
            ...mockOptions,
          }),
        }
      );
    });

    expect(container.querySelector('canvas')).toBeInTheDocument();
  });

  it('debería manejar errores de inicialización', async () => {
    (ChartJS as any).mockImplementationOnce(() => {
      throw new Error('Error al inicializar el gráfico');
    });

    render(<LazyChart type="pie" data={mockData} />);

    await waitFor(() => {
      expect(screen.getByText('Error al cargar el gráfico')).toBeInTheDocument();
    });
  });

  it('debería actualizar el gráfico cuando cambian los datos', async () => {
    const newData = {
      labels: ['D', 'E', 'F'],
      datasets: [
        {
          data: [4, 5, 6],
          backgroundColor: ['yellow', 'purple', 'orange'],
        },
      ],
    };

    const { rerender } = render(<LazyChart type="pie" data={mockData} />);

    await waitFor(() => {
      expect(ChartJS).toHaveBeenCalled();
    });

    rerender(<LazyChart type="pie" data={newData} />);

    await waitFor(() => {
      const chartInstance = (ChartJS as any).mock.results[0].value;
      expect(chartInstance.data).toEqual(newData);
      expect(chartInstance.update).toHaveBeenCalled();
    });
  });

  it('debería destruir el gráfico al desmontar', async () => {
    const { unmount } = render(<LazyChart type="pie" data={mockData} />);

    await waitFor(() => {
      expect(ChartJS).toHaveBeenCalled();
    });

    unmount();

    const chartInstance = (ChartJS as any).mock.results[0].value;
    expect(chartInstance.destroy).toHaveBeenCalled();
  });

  it('debería aplicar clases CSS personalizadas', () => {
    const className = 'custom-chart';
    const { container } = render(
      <LazyChart type="pie" data={mockData} className={className} />
    );

    expect(container.firstChild).toHaveClass(className);
  });

  it('debería aplicar estilos personalizados', () => {
    const style = { width: '500px', height: '300px' };
    const { container } = render(
      <LazyChart type="pie" data={mockData} style={style} />
    );

    const chartContainer = container.firstChild as HTMLElement;
    expect(chartContainer.style.width).toBe(style.width);
    expect(chartContainer.style.height).toBe(style.height);
  });
}); 