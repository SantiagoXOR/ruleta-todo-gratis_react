import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from '../Button';

describe('Button', () => {
  it('renderiza correctamente', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('aplica la variante correcta', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-primary');

    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-secondary');

    rerender(<Button variant="outline">Outline</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-outline');

    rerender(<Button variant="text">Text</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-text');
  });

  it('aplica el tamaño correcto', () => {
    const { rerender } = render(<Button size="small">Small</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-small');

    rerender(<Button size="medium">Medium</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-medium');

    rerender(<Button size="large">Large</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-large');
  });

  it('maneja el estado de carga', () => {
    render(<Button loading>Loading</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('btn-loading');
    expect(button).toBeDisabled();
    expect(button.querySelector('.btn-spinner')).toBeInTheDocument();
  });

  it('maneja el estado deshabilitado', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('btn-disabled');
  });

  it('maneja iconos', () => {
    const icon = <span data-testid="icon">icon</span>;
    
    const { rerender } = render(
      <Button icon={icon} iconPosition="left">
        With Icon
      </Button>
    );
    
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByRole('button').firstChild).toContainElement(screen.getByTestId('icon'));

    rerender(
      <Button icon={icon} iconPosition="right">
        With Icon
      </Button>
    );
    
    expect(screen.getByRole('button').lastChild).toContainElement(screen.getByTestId('icon'));
  });

  it('maneja el ancho completo', () => {
    render(<Button fullWidth>Full Width</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-full-width');
  });

  it('muestra tooltip', () => {
    render(
      <Button tooltip="Helpful tip" tooltipPosition="top">
        With Tooltip
      </Button>
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('data-tooltip', 'Helpful tip');
    expect(button).toHaveAttribute('data-tooltip-position', 'top');
  });

  it('llama al onClick cuando se hace clic', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('no llama al onClick cuando está deshabilitado', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick} disabled>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('no llama al onClick cuando está cargando', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick} loading>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('maneja eventos de teclado', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Press me</Button>);
    
    const button = screen.getByRole('button');
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(button, { key: ' ' });
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it('pasa props adicionales al elemento button', () => {
    render(
      <Button data-testid="custom-button" aria-label="Custom Button">
        Custom Props
      </Button>
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('data-testid', 'custom-button');
    expect(button).toHaveAttribute('aria-label', 'Custom Button');
  });

  it('acepta una ref', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button ref={ref}>With Ref</Button>);
    
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
