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
    
    const inputs = screen.getAllByPlaceholderText(/Ensine algo ao Cérebro/i);
    const input = inputs[0]; // Take the first visible one
    const sendButtons = screen.getAllByRole('button');
    const sendButton = sendButtons.find(b => b.querySelector('svg.lucide-search')) || sendButtons[0];

    fireEvent.change(input, { target: { value: 'Ensine-me algo' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText(/Informação processada pelo MFA/i)).toBeTruthy();
    }, { timeout: 3000 });
  });

  it('switches tabs correctly', async () => {
    render(<SkillsContainer />);
    const searchTabs = screen.getAllByText(/Pesquisa Inteligente/i);
    fireEvent.click(searchTabs[0]);
    
    await waitFor(() => {
      expect(screen.getAllByPlaceholderText(/O que deseja pesquisar na web/i).length).toBeGreaterThan(0);
    });
  });
});



