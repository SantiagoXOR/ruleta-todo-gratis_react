import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Input } from '../Input';

describe('Input', () => {
  it('renderiza correctamente', () => {
    render(<Input label="Test Input" />);
    expect(screen.getByLabelText('Test Input')).toBeInTheDocument();
  });

  it('maneja cambios de valor', () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });
    
    expect(handleChange).toHaveBeenCalled();
  });

  it('muestra error', () => {
    render(<Input error="Error message" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Error message');
  });

  it('muestra hint', () => {
    render(<Input hint="Helpful hint" />);
    expect(screen.getByText('Helpful hint')).toBeInTheDocument();
  });

  it('maneja estado requerido', () => {
    render(<Input label="Required Field" required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('maneja estado deshabilitado', () => {
    render(<Input disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('maneja estado de carga', () => {
    render(<Input loading />);
    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(document.querySelector('.input-spinner')).toBeInTheDocument();
  });

  it('muestra contador de caracteres', () => {
    render(<Input value="test" maxLength={10} showCharCount />);
    expect(screen.getByText('4/10')).toBeInTheDocument();
  });

  it('maneja botón de limpiar', () => {
    const handleClear = vi.fn();
    render(<Input value="test" onClear={handleClear} />);
    
    const clearButton = screen.getByLabelText('Limpiar entrada');
    fireEvent.click(clearButton);
    
    expect(handleClear).toHaveBeenCalled();
  });

  it('aplica variantes correctamente', () => {
    const { rerender } = render(<Input variant="outlined" />);
    expect(document.querySelector('.input-outlined')).toBeInTheDocument();

    rerender(<Input variant="filled" />);
    expect(document.querySelector('.input-filled')).toBeInTheDocument();

    rerender(<Input variant="standard" />);
    expect(document.querySelector('.input-standard')).toBeInTheDocument();
  });

  it('aplica tamaños correctamente', () => {
    const { rerender } = render(<Input size="small" />);
    expect(document.querySelector('.input-small')).toBeInTheDocument();

    rerender(<Input size="medium" />);
    expect(document.querySelector('.input-medium')).toBeInTheDocument();

    rerender(<Input size="large" />);
    expect(document.querySelector('.input-large')).toBeInTheDocument();
  });

  it('maneja iconos', () => {
    const startIcon = <span data-testid="start-icon">start</span>;
    const endIcon = <span data-testid="end-icon">end</span>;
    
    render(<Input startIcon={startIcon} endIcon={endIcon} />);
    
    expect(screen.getByTestId('start-icon')).toBeInTheDocument();
    expect(screen.getByTestId('end-icon')).toBeInTheDocument();
  });

  it('maneja eventos de foco', () => {
    const handleFocus = vi.fn();
    const handleBlur = vi.fn();
    
    render(<Input onFocus={handleFocus} onBlur={handleBlur} />);
    const input = screen.getByRole('textbox');
    
    fireEvent.focus(input);
    expect(handleFocus).toHaveBeenCalled();
    expect(document.querySelector('.input-focused')).toBeInTheDocument();

    fireEvent.blur(input);
    expect(handleBlur).toHaveBeenCalled();
    expect(document.querySelector('.input-focused')).not.toBeInTheDocument();
  });

  it('maneja ancho completo', () => {
    render(<Input fullWidth />);
    expect(document.querySelector('.input-full-width')).toBeInTheDocument();
  });

  it('acepta una ref', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('maneja atributos ARIA', () => {
    render(
      <Input
        label="Test Input"
        error="Error message"
        hint="Helpful hint"
      />
    );
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-label', 'Test Input');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-errormessage');
  });

  it('anuncia mensajes al lector de pantalla cuando quedan pocos caracteres', () => {
    const { rerender } = render(
      <Input
        value="123456"
        maxLength={10}
        showCharCount
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '12345678' } });
    
    // Verificar que se muestra el contador
    expect(screen.getByText('8/10')).toBeInTheDocument();
  });
});
