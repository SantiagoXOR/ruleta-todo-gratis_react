import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PrizeValidator } from '../PrizeValidator';
import { prizeValidationService } from '../../services/prizeValidationService';

// Mock del servicio
vi.mock('../../services/prizeValidationService', () => ({
  prizeValidationService: {
    validatePrize: vi.fn()
  }
}));

describe('PrizeValidator', () => {
  const mockStoreId = 'test-store-123';
  const mockValidationResponse = {
    success: true,
    message: 'Premio validado correctamente',
    prize: {
      id: '123',
      name: 'Test Prize',
      code: 'TEST123'
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (prizeValidationService.validatePrize as any).mockResolvedValue(mockValidationResponse);
  });

  describe('Rendering', () => {
    it('renders all form elements correctly', () => {
      render(<PrizeValidator storeId={mockStoreId} />);
      
      expect(screen.getByText('Validar Premio')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Ingresa el código del premio')).toBeInTheDocument();
      expect(screen.getByRole('button')).toHaveTextContent('Validar');
    });

    it('shows initial state correctly', () => {
      render(<PrizeValidator storeId={mockStoreId} />);
      
      const input = screen.getByPlaceholderText('Ingresa el código del premio');
      const button = screen.getByRole('button');
      
      expect(input).toHaveValue('');
      expect(button).not.toBeDisabled();
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/éxito/i)).not.toBeInTheDocument();
    });
  });

  describe('Validation Process', () => {
    it('handles successful validation correctly', async () => {
      const mockCallback = vi.fn();
      render(<PrizeValidator storeId={mockStoreId} onValidationComplete={mockCallback} />);
      
      const input = screen.getByPlaceholderText('Ingresa el código del premio');
      const button = screen.getByRole('button');

      fireEvent.change(input, { target: { value: 'TEST123' } });
      fireEvent.click(button);

      expect(button).toBeDisabled();
      expect(screen.getByText('Validando...')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText('Premio validado correctamente')).toBeInTheDocument();
      });

      expect(prizeValidationService.validatePrize).toHaveBeenCalledWith({
        code: 'TEST123',
        storeId: mockStoreId
      });
      expect(mockCallback).toHaveBeenCalledWith(mockValidationResponse);
      expect(button).not.toBeDisabled();
    });

    it('handles validation error correctly', async () => {
      const errorResponse = {
        success: false,
        message: 'Código inválido'
      };
      (prizeValidationService.validatePrize as any).mockRejectedValueOnce(new Error('Validation failed'));

      render(<PrizeValidator storeId={mockStoreId} />);
      
      const input = screen.getByPlaceholderText('Ingresa el código del premio');
      const button = screen.getByRole('button');

      fireEvent.change(input, { target: { value: 'INVALID' } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/error al validar/i)).toBeInTheDocument();
      });

      expect(button).not.toBeDisabled();
    });

    it('validates empty code input', () => {
      render(<PrizeValidator storeId={mockStoreId} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(screen.getByText('Por favor, ingresa un código')).toBeInTheDocument();
      expect(prizeValidationService.validatePrize).not.toHaveBeenCalled();
    });

    it('converts code to uppercase', () => {
      render(<PrizeValidator storeId={mockStoreId} />);
      
      const input = screen.getByPlaceholderText('Ingresa el código del premio');
      fireEvent.change(input, { target: { value: 'test123' } });

      expect(input).toHaveValue('TEST123');
    });
  });
}); 