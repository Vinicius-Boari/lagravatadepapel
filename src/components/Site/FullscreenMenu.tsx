import { memo } from "react";

interface FullscreenMenuProps {
  menuOpen: boolean;
  onClose: () => void;
}

export const FullscreenMenu = memo(({ menuOpen, onClose }: FullscreenMenuProps) => {
  return (
    <div className={`fullscreen-menu${menuOpen ? " active" : ""}`}>
      <button className="menu-close" onClick={onClose} aria-label="Fechar menu">
        <span>Fechar</span>
        <span className="menu-close-x">✕</span>
      </button>
      <span className="menu-label">Navegação</span>
      <nav className="menu-nav relative">
        <a href="#hero" onClick={onClose}>Home</a>
        <a href="#servicos" onClick={onClose}>Serviços</a>
        <a href="/questionarioevento" onClick={onClose}>Orçamento</a>
        <a href="#videos" onClick={onClose}>Vídeos</a>
        <a href="#invasoes" onClick={onClose}>Invasões</a>
        <a href="#instagram" onClick={onClose}>Instagram</a>
        <a href="#sobre" onClick={onClose}>La gravata</a>
        <a href="#tropa-da-gravata" onClick={onClose}>Tropa da Gravata</a>
        <a href="#cupons" onClick={onClose}>Cupons</a>
        <a href="#contatos" onClick={onClose}>Contatos</a>
      </nav>
    </div>
  );
});

FullscreenMenu.displayName = "FullscreenMenu";
