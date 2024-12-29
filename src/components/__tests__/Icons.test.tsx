import { test, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Icons } from '../Icons';

test('Icons component', () => {
  test('should render Gift icon', () => {
    const { container } = render(<Icons.Gift />);
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg?.getAttribute('role')).toBe('img');
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
  });

  test('should render Gift icon with custom className', () => {
    const { container } = render(<Icons.Gift className="custom-class" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg?.classList.contains('custom-class')).toBe(true);
  });

  test('should render Volume icon', () => {
    const { container } = render(<Icons.Volume />);
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg?.getAttribute('role')).toBe('img');
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
  });

  test('should render VolumeOff icon', () => {
    const { container } = render(<Icons.VolumeOff />);
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg?.getAttribute('role')).toBe('img');
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
  });

  test('should render icons with custom width and height', () => {
    const { container } = render(<Icons.Gift width={32} height={32} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg?.getAttribute('width')).toBe('32');
    expect(svg?.getAttribute('height')).toBe('32');
  });

  test('should render icons with default width and height when not specified', () => {
    const { container } = render(<Icons.Gift />);
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg?.getAttribute('width')).toBe('24');
    expect(svg?.getAttribute('height')).toBe('24');
  });

  test('should combine custom className with default styles', () => {
    const { container } = render(<Icons.Gift className="custom-class" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg?.classList.contains('custom-class')).toBe(true);
    expect(svg?.classList.length).toBeGreaterThan(1);
  });

  test('should apply custom color through style prop', () => {
    const { container } = render(<Icons.Gift style={{ color: 'red' }} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg?.getAttribute('style')).toContain('color: red');
  });

  test('should apply custom styles through style prop', () => {
    const customStyle = {
      transform: 'rotate(45deg)',
      opacity: '0.5',
    };
    const { container } = render(<Icons.Gift style={customStyle} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg?.getAttribute('style')).toContain('transform: rotate(45deg)');
    expect(svg?.getAttribute('style')).toContain('opacity: 0.5');
  });

  test('should handle multiple icons with different props', () => {
    const { container } = render(
      <>
        <Icons.Gift className="gift-icon" width={24} height={24} />
        <Icons.Volume className="volume-icon" style={{ color: 'blue' }} />
        <Icons.VolumeOff style={{ opacity: '0.7' }} width={32} height={32} />
      </>
    );
    const icons = container.querySelectorAll('svg');
    expect(icons.length).toBe(3);
    
    // Gift icon checks
    expect(icons[0].classList.contains('gift-icon')).toBe(true);
    expect(icons[0].getAttribute('width')).toBe('24');
    expect(icons[0].getAttribute('height')).toBe('24');
    
    // Volume icon checks
    expect(icons[1].classList.contains('volume-icon')).toBe(true);
    expect(icons[1].getAttribute('style')).toContain('color: blue');
    
    // VolumeOff icon checks
    expect(icons[2].getAttribute('style')).toContain('opacity: 0.7');
    expect(icons[2].getAttribute('width')).toBe('32');
    expect(icons[2].getAttribute('height')).toBe('32');
  });

  test('should handle zero width and height', () => {
    const { container } = render(<Icons.Gift width={0} height={0} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg?.getAttribute('width')).toBe('0');
    expect(svg?.getAttribute('height')).toBe('0');
  });

  test('should handle negative width and height as absolute values', () => {
    const { container } = render(<Icons.Gift width={-24} height={-24} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg?.getAttribute('width')).toBe('24');
    expect(svg?.getAttribute('height')).toBe('24');
  });

  test('should handle multiple style combinations', () => {
    const { container } = render(
      <Icons.Gift 
        className="custom-class"
        style={{
          color: 'red',
          transform: 'scale(1.5)',
          margin: '10px',
        }}
        width={40}
        height={40}
      />
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg?.classList.contains('custom-class')).toBe(true);
    expect(svg?.getAttribute('style')).toContain('color: red');
    expect(svg?.getAttribute('style')).toContain('transform: scale(1.5)');
    expect(svg?.getAttribute('style')).toContain('margin: 10px');
    expect(svg?.getAttribute('width')).toBe('40');
    expect(svg?.getAttribute('height')).toBe('40');
  });

  test('should maintain aspect ratio when only width is provided', () => {
    const { container } = render(<Icons.Gift width={32} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg?.getAttribute('width')).toBe('32');
    expect(svg?.getAttribute('height')).toBe('32'); // Should match width to maintain aspect ratio
  });

  test('should maintain aspect ratio when only height is provided', () => {
    const { container } = render(<Icons.Gift height={32} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg?.getAttribute('width')).toBe('32'); // Should match height to maintain aspect ratio
    expect(svg?.getAttribute('height')).toBe('32');
  });
});
