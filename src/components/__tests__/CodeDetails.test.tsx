import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CodeDetails } from '../CodeDetails';

describe('CodeDetails', () => {
  const mockCode = {
    code: 'TEST123',
    prizeId: 1,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas en el futuro
    isUsed: false,
  };

  const mockUsedCode = {
    ...mockCode,
    isUsed: true,
    usedAt: new Date().toISOString(),
    usedBy: 'user123',
  };

  const mockExpiredCode = {
    ...mockCode,
    expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 24 horas en el pasado
  };

  it('renders code details correctly', () => {
    render(<CodeDetails code={mockCode} />);

    expect(screen.getByText(`Código: ${mockCode.code}`)).toBeInTheDocument();
    expect(screen.getByText(`Premio ID: ${mockCode.prizeId}`)).toBeInTheDocument();
    expect(screen.getByText('Válido')).toBeInTheDocument();
  });

  it('shows used status and user details when code is used', () => {
    render(<CodeDetails code={mockUsedCode} />);

    expect(screen.getByText('Usado')).toBeInTheDocument();
    expect(screen.getByText('user123')).toBeInTheDocument();
    expect(screen.queryByText('Usar Código')).not.toBeInTheDocument();
  });

  it('shows expired status for expired codes', () => {
    render(<CodeDetails code={mockExpiredCode} />);

    expect(screen.getByText('Expirado')).toBeInTheDocument();
    expect(screen.queryByText('Usar Código')).not.toBeInTheDocument();
  });

  it('calls onUseCode when use button is clicked', async () => {
    const onUseCode = vi.fn();
    render(<CodeDetails code={mockCode} onUseCode={onUseCode} />);

    const useButton = screen.getByText('Usar Código');
    await fireEvent.click(useButton);

    expect(onUseCode).toHaveBeenCalledWith(mockCode.code);
  });

  it('does not show use button when onUseCode is not provided', () => {
    render(<CodeDetails code={mockCode} />);

    expect(screen.queryByText('Usar Código')).not.toBeInTheDocument();
  });

  it('formats dates correctly', () => {
    render(<CodeDetails code={mockUsedCode} />);

    // Verifica que las fechas se muestren en formato español
    expect(screen.getByText(/\d{1,2} de [a-z]+ de \d{4}/i)).toBeInTheDocument();
  });

  it('shows remaining time for valid codes', () => {
    render(<CodeDetails code={mockCode} />);

    // Verifica que se muestre el tiempo restante
    expect(screen.getByText(/en \d{1,2} horas/i)).toBeInTheDocument();
  });

  it('handles missing optional fields gracefully', () => {
    const codeWithoutOptionals = {
      ...mockCode,
      isUsed: true,
    };

    render(<CodeDetails code={codeWithoutOptionals} />);

    expect(screen.queryByText('Usado por:')).not.toBeInTheDocument();
    expect(screen.queryByText('Usado el:')).not.toBeInTheDocument();
  });
});
