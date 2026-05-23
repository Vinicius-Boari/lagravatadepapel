import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SkillsContainer from './SkillsContainer';
import React from 'react';

// Mock dependencies that might break in test environment
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('SkillsContainer & Cérebro Core', () => {
  it('renders main skills correctly', () => {
    render(<SkillsContainer />);
    expect(screen.getByText(/Cérebro/i)).toBeDefined();
    expect(screen.getByText(/Visual Experience/i)).toBeDefined();
    expect(screen.getByText(/Aprendizagem Autônoma/i)).toBeDefined();
    expect(screen.getByText(/Pesquisa Inteligente/i)).toBeDefined();
  });

  it('handles learning center interactions', async () => {
    render(<SkillsContainer />);
    
    const input = screen.getByPlaceholderText(/Ensine algo ao Cérebro/i);
    const sendButton = screen.getByRole('button', { name: /search/i });

    fireEvent.change(input, { target: { value: 'Ensine-me sobre R3F' } });
    fireEvent.click(sendButton);

    expect(screen.getByText(/Ensine-me sobre R3F/i)).toBeDefined();
    
    await waitFor(() => {
      expect(screen.getByText(/Informação processada pelo MFA/i)).toBeDefined();
    }, { timeout: 2000 });
  });

  it('switches to research tab and performs search', async () => {
    render(<SkillsContainer />);
    
    const searchTab = screen.getByText(/Pesquisa Inteligente/i);
    fireEvent.click(searchTab);

    const input = screen.getByPlaceholderText(/O que deseja pesquisar na web/i);
    fireEvent.change(input, { target: { value: 'React components' } });
    
    // Find the button within the container
    const sendButton = screen.getAllByRole('button').find(b => b.querySelector('svg.lucide-search'));
    if (sendButton) fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText(/Pesquisa concluída/i)).toBeDefined();
      expect(screen.getByText(/Documentação Oficial React Three Fiber/i)).toBeDefined();
    }, { timeout: 3000 });
  });
});
