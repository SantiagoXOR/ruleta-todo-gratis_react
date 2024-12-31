import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import * as Icons from '../Icons';

describe('Icon Components', () => {
  const iconComponents = {
    History: Icons.History,
    Download: Icons.Download,
    Spinner: Icons.Spinner,
    Error: Icons.Error,
    ArrowLeft: Icons.ArrowLeft,
    ArrowRight: Icons.ArrowRight,
    Tag: Icons.Tag,
    Check: Icons.Check,
    Success: Icons.Success
  };

  Object.entries(iconComponents).forEach(([name, Component]) => {
    describe(`${name} Icon`, () => {
      it('renders correctly', () => {
        const { container } = render(<Component />);
        const svg = container.querySelector('svg');
        const path = container.querySelector('path');
        
        expect(svg).toBeInTheDocument();
        expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
        expect(svg).toHaveAttribute('width', '24');
        expect(svg).toHaveAttribute('height', '24');
        expect(svg).toHaveAttribute('fill', 'currentColor');
        expect(path).toBeInTheDocument();
      });

      it('applies className prop correctly', () => {
        const testClass = 'test-class';
        const { container } = render(<Component className={testClass} />);
        const svg = container.querySelector('svg');
        
        expect(svg).toHaveClass(testClass);
      });

      it('maintains default size without className', () => {
        const { container } = render(<Component />);
        const svg = container.querySelector('svg');
        
        expect(svg).toHaveAttribute('width', '24');
        expect(svg).toHaveAttribute('height', '24');
      });
    });
  });
});
