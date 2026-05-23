import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SkillsContainer } from './SkillsContainer';
import React from 'react';

// Mock dependencies
vi.mock('framer-motion', () => {
  const ReactMock = require('react');
  return {
    motion: {
      div: ReactMock.forwardRef(({ children, ...props }: any, ref: any) => <div ref={ref} {...props}>{children}</div>),
      section: ReactMock.forwardRef(({ children, ...props }: any, ref: any) => <section ref={ref} {...props}>{children}</section>),
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
  it('renders main skills correctly', () => {
    render(<SkillsContainer />);
    expect(screen.getByText(/Cérebro/i)).toBeTruthy();
    expect(screen.getByText(/Visual Experience/i)).toBeTruthy();
  });

  it('handles learning center interactions', async () => {
    render(<SkillsContainer />);
    
    const input = screen.getByPlaceholderText(/Ensine algo ao Cérebro/i);
    const sendButton = screen.getByRole('button', { name: /search/i });

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

