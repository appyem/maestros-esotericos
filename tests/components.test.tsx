import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { Button } from '@/components/ui/Button';

describe('Button Component', () => {
  it('should render without crashing', () => {
    render(<Button>Test Button</Button>);
    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });

  it('should apply primary variant by default', () => {
    render(<Button>Primary</Button>);
    const button = screen.getByText('Primary');
    expect(button).toHaveClass('bg-primary');
  });

  it('should be disabled when isLoading is true', () => {
    render(<Button isLoading>Loading</Button>);
    const button = screen.getByText('Loading');
    expect(button).toBeDisabled();
  });
});
