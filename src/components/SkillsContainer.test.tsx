import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SkillsContainer } from './SkillsContainer';
import React from 'react';

// Mock dependencies
vi.mock('framer-motion', () => {
  const ReactMock = require('react');
  const ComponentMock = ReactMock.forwardRef(({ children, ...props }: any, ref: any) => {
    // Filter out motion-specific props that shouldn't reach DOM
    const { whileInView, initial, transition, viewport, ...domProps } = props;
    return <div ref={ref} {...domProps}>{children}</div>;
  });
  return {
    motion: {
      div: ComponentMock,
      section: ComponentMock,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

describe('SkillsContainer & Cérebro Core', () => {
  it('renders title correctly', () => {
    render(<SkillsContainer />);
    const titles = screen.getAllByText(/Cérebro/i);
    expect(titles.length).toBeGreaterThan(0);
  });

  it('handles learning center interactions', async () => {
    render(<SkillsContainer />);
    
    const input = screen.getByPlaceholderText(/Ensine algo ao Cérebro/i);
    const sendButton = screen.getByRole('button'); // Search button

    fireEvent.change(input, { target: { value: 'Ensine-me algo' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText(/Informação processada pelo MFA/i)).toBeTruthy();
    }, { timeout: 2000 });
  });

  it('switches tabs correctly', async () => {
    render(<SkillsContainer />);
    const searchTab = screen.getByText(/Pesquisa Inteligente/i);
    fireEvent.click(searchTab);
    expect(screen.getByPlaceholderText(/O que deseja pesquisar na web/i)).toBeTruthy();
  });
});


