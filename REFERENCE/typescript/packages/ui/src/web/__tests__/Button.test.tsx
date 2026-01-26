/**
 * Button Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../Button';

describe('Button', () => {
  describe('Rendering', () => {
    it('renders children correctly', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button')).toHaveTextContent('Click me');
    });

    it('renders with testID', () => {
      render(<Button testID="my-button">Test</Button>);
      expect(screen.getByTestId('my-button')).toBeInTheDocument();
    });

    it('forwards ref correctly', () => {
      const ref = vi.fn();
      render(<Button ref={ref}>Test</Button>);
      expect(ref).toHaveBeenCalled();
    });
  });

  describe('Variants', () => {
    it('applies primary variant by default', () => {
      render(<Button>Primary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-rust-600');
    });

    it('applies secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-bronze-500');
    });

    it('applies danger variant', () => {
      render(<Button variant="danger">Danger</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-crimson-600');
    });

    it('applies ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-transparent');
    });

    it('applies outline variant', () => {
      render(<Button variant="outline">Outline</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border-2');
    });
  });

  describe('Sizes', () => {
    it('applies medium size by default', () => {
      render(<Button>Medium</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-10');
    });

    it('applies small size', () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-8');
    });

    it('applies large size', () => {
      render(<Button size="lg">Large</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-12');
    });
  });

  describe('Full Width', () => {
    it('is not full width by default', () => {
      render(<Button>Normal</Button>);
      const button = screen.getByRole('button');
      expect(button).not.toHaveClass('w-full');
    });

    it('applies full width when prop is true', () => {
      render(<Button fullWidth>Full Width</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-full');
    });
  });

  describe('Interactions', () => {
    it('calls onClick when clicked', async () => {
      const onClick = vi.fn();
      const user = userEvent.setup();

      render(<Button onClick={onClick}>Click me</Button>);
      await user.click(screen.getByRole('button'));

      expect(onClick).toHaveBeenCalledOnce();
    });

    it('calls onPress when clicked', async () => {
      const onPress = vi.fn();
      const user = userEvent.setup();

      render(<Button onPress={onPress}>Click me</Button>);
      await user.click(screen.getByRole('button'));

      expect(onPress).toHaveBeenCalledOnce();
    });

    it('calls both onClick and onPress when clicked', async () => {
      const onClick = vi.fn();
      const onPress = vi.fn();
      const user = userEvent.setup();

      render(
        <Button onClick={onClick} onPress={onPress}>
          Click me
        </Button>
      );
      await user.click(screen.getByRole('button'));

      expect(onClick).toHaveBeenCalledOnce();
      expect(onPress).toHaveBeenCalledOnce();
    });
  });

  describe('Disabled State', () => {
    it('is disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('does not call onClick when disabled', async () => {
      const onClick = vi.fn();
      const user = userEvent.setup();

      render(
        <Button disabled onClick={onClick}>
          Disabled
        </Button>
      );
      await user.click(screen.getByRole('button'));

      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('shows loading spinner when loading', () => {
      render(<Button loading>Loading</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    it('is disabled when loading', () => {
      render(<Button loading>Loading</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('does not call onClick when loading', async () => {
      const onClick = vi.fn();
      const user = userEvent.setup();

      render(
        <Button loading onClick={onClick}>
          Loading
        </Button>
      );
      await user.click(screen.getByRole('button'));

      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('Icons', () => {
    it('renders left icon', () => {
      const Icon = () => <span data-testid="left-icon">L</span>;
      render(<Button leftIcon={<Icon />}>With Icon</Button>);
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    });

    it('renders right icon', () => {
      const Icon = () => <span data-testid="right-icon">R</span>;
      render(<Button rightIcon={<Icon />}>With Icon</Button>);
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });

    it('hides icons when loading', () => {
      const LeftIcon = () => <span data-testid="left-icon">L</span>;
      const RightIcon = () => <span data-testid="right-icon">R</span>;

      render(
        <Button loading leftIcon={<LeftIcon />} rightIcon={<RightIcon />}>
          Loading
        </Button>
      );

      expect(screen.queryByTestId('left-icon')).not.toBeInTheDocument();
      expect(screen.queryByTestId('right-icon')).not.toBeInTheDocument();
    });
  });

  describe('Custom className', () => {
    it('applies additional className', () => {
      render(<Button className="custom-class">Custom</Button>);
      expect(screen.getByRole('button')).toHaveClass('custom-class');
    });

    it('preserves variant classes when custom className is provided', () => {
      render(<Button className="custom-class" variant="secondary">Custom</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
      expect(button).toHaveClass('bg-bronze-500');
    });
  });
});
