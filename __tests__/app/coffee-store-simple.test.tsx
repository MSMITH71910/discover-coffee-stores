import React from 'react';
import { render, screen } from '@testing-library/react';
import Page from '@/app/coffee-store/page';

describe('Simple Coffee Store Page (/coffee-store)', () => {
  it('should render the coffee store page without errors', () => {
    render(<Page />);
    
    const pageElement = screen.getByText('Coffee store Page');
    expect(pageElement).toBeInTheDocument();
  });

  it('should render a div element with correct text content', () => {
    const { container } = render(<Page />);
    
    const divElement = container.querySelector('div');
    expect(divElement).toBeInTheDocument();
    expect(divElement).toHaveTextContent('Coffee store Page');
  });

  it('should not throw any errors during rendering', () => {
    expect(() => {
      render(<Page />);
    }).not.toThrow();
  });

  it('should have a simple component structure', () => {
    const { container } = render(<Page />);
    
    // Should have exactly one div element
    const divElements = container.querySelectorAll('div');
    expect(divElements).toHaveLength(1);
    
    // The div should be the direct child of the container
    expect(container.firstChild).toBe(divElements[0]);
  });
});