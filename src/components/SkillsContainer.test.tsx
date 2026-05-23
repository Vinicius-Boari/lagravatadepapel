import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SkillsContainer } from './SkillsContainer';
import React from 'react';

// Mock dependencies
vi.mock('framer-motion', () => {
  const ReactMock = require('react');
  const ComponentMock = ReactMock.forwardRef(({ children, ...props }: any, ref: any) => {
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
  it('renders title and components correctly', () => {
    render(<SkillsContainer />);
    const titles = screen.getAllByText(/Cérebro/i);
    expect(titles.length).toBeGreaterThan(0);
  });

  it('handles learning center interactions', async () => {
    render(<SkillsContainer />);
    const inputs = screen.getAllByRole('textbox');
    const input = inputs[0]; 
    const sendButton = screen.getAllByRole('button').find(b => b.querySelector('svg.lucide-search')) || screen.getAllByRole('button')[0];

    fireEvent.change(input, { target: { value: 'Ensine-me algo' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      const response = screen.queryByText(/processada/i) || screen.queryByText(/identifiquei/i);
      expect(response).toBeTruthy();
    }, { timeout: 3000 });
  });

  it('contains essential sub-modules', () => {
    render(<SkillsContainer />);
    expect(screen.getByText(/Aprendizagem Autônoma/i)).toBeTruthy();
    expect(screen.getByText(/Pesquisa Inteligente/i)).toBeTruthy();
  });
});
