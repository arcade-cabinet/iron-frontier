/**
 * Spinner Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Spinner, LoadingOverlay } from '../Spinner';

describe('Spinner', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<Spinner />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('renders with testID', () => {
      render(<Spinner testID="my-spinner" />);
      expect(screen.getByTestId('my-spinner')).toBeInTheDocument();
    });

    it('has accessible label', () => {
      render(<Spinner label="Please wait" />);
      expect(screen.getByRole('status')).toHaveAccessibleName('Please wait');
    });

    it('renders default "Loading..." label', () => {
      render(<Spinner />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('label is visually hidden but accessible', () => {
      render(<Spinner label="Custom label" />);
      const label = screen.getByText('Custom label');
      expect(label).toHaveClass('sr-only');
    });
  });

  describe('Sizes', () => {
    it('applies medium size by default', () => {
      render(<Spinner />);
      const spinner = screen.getByRole('status').querySelector('span:first-child');
      expect(spinner).toHaveClass('size-6');
    });

    it('applies small size', () => {
      render(<Spinner size="sm" />);
      const spinner = screen.getByRole('status').querySelector('span:first-child');
      expect(spinner).toHaveClass('size-4');
    });

    it('applies large size', () => {
      render(<Spinner size="lg" />);
      const spinner = screen.getByRole('status').querySelector('span:first-child');
      expect(spinner).toHaveClass('size-8');
    });
  });

  describe('Color', () => {
    it('applies custom color', () => {
      render(<Spinner color="#ff0000" />);
      const spinner = screen.getByRole('status').querySelector('span:first-child');
      expect(spinner).toHaveStyle({ color: '#ff0000' });
    });

    it('has no inline style when color is not provided', () => {
      render(<Spinner />);
      const spinner = screen.getByRole('status').querySelector('span:first-child');
      expect(spinner).not.toHaveAttribute('style');
    });
  });

  describe('Custom className', () => {
    it('applies additional className', () => {
      render(<Spinner className="custom-spinner" />);
      expect(screen.getByRole('status')).toHaveClass('custom-spinner');
    });
  });

  describe('Ref forwarding', () => {
    it('forwards ref correctly', () => {
      const ref = vi.fn();
      render(<Spinner ref={ref} />);
      expect(ref).toHaveBeenCalled();
    });
  });
});

describe('LoadingOverlay', () => {
  describe('Visibility', () => {
    it('renders when visible is true', () => {
      render(<LoadingOverlay visible />);
      // The outer container has role="status"
      const statuses = screen.getAllByRole('status');
      expect(statuses.length).toBeGreaterThanOrEqual(1);
    });

    it('does not render when visible is false', () => {
      render(<LoadingOverlay visible={false} />);
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  describe('Label', () => {
    it('shows default "Loading..." label in visible text', () => {
      render(<LoadingOverlay visible />);
      // The visible label text (not sr-only)
      expect(screen.getByText('Loading...', { selector: 'span:not(.sr-only)' })).toBeInTheDocument();
    });

    it('shows custom label', () => {
      render(<LoadingOverlay visible label="Saving progress..." />);
      expect(screen.getByText('Saving progress...', { selector: 'span:not(.sr-only)' })).toBeInTheDocument();
    });

    it('has accessible label on outer container', () => {
      render(<LoadingOverlay visible label="Please wait" />);
      // Find the overlay container (the outer one with fixed class)
      const overlay = screen.getByRole('status', { name: 'Please wait' });
      expect(overlay).toHaveClass('fixed');
    });
  });

  describe('Styling', () => {
    it('applies custom className to overlay', () => {
      render(<LoadingOverlay visible className="custom-overlay" />);
      // Find the outer container with fixed positioning
      const overlay = screen.getAllByRole('status').find(el => el.classList.contains('fixed'));
      expect(overlay).toHaveClass('custom-overlay');
    });

    it('has fixed positioning', () => {
      render(<LoadingOverlay visible />);
      const overlay = screen.getAllByRole('status').find(el => el.classList.contains('fixed'));
      expect(overlay).toBeInTheDocument();
    });

    it('has high z-index', () => {
      render(<LoadingOverlay visible />);
      const overlay = screen.getAllByRole('status').find(el => el.classList.contains('fixed'));
      expect(overlay).toHaveClass('z-50');
    });
  });
});
