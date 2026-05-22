import { memo } from "react";


interface FooterProps {
  footer: any;
  content?: any;
}

export const Footer = memo(({ footer, content }: FooterProps) => {
  const whatsappUrl = content?.hero?.cta_url || "https://api.whatsapp.com/send?phone=5511985111012";
  const instagramUrl = content?.integrations?.instagram_url || "https://www.instagram.com/lagravatadepapel/";

  return (
    <footer className="lg-footer">
      <div className="footer-top">
        <div className="footer-logo">La Gravata<br />de Papel</div>
        <div className="footer-links">
          <div className="footer-col">
            <h4>Navegação</h4>
            <a href="#hero">Home</a>
            <a href="#servicos">Serviços</a>
            <a href="/questionarioevento">Questionário</a>
            <a href="#videos">Vídeos</a>
            <a href="#invasoes">Invasões</a>
            <a href="#sobre">Sobre</a>
            <a href="#tropa-da-gravata">Tropa da Gravata</a>
            <a href="#cupons">Cupons</a>
          </div>
          <div className="footer-col">
            <h4>Redes Sociais</h4>
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="https://www.facebook.com/lagravatadepapel" target="_blank" rel="noopener noreferrer">Facebook</a>
            <a href="https://www.tiktok.com/@lagravatadepapel" target="_blank" rel="noopener noreferrer">TikTok</a>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">WhatsApp</a>
          </div>
          <div className="footer-col">
            <h4>Contato</h4>
            
              <a href={footer.phone_url || whatsappUrl} target="_blank" rel="noopener noreferrer">{footer.phone || "(11) 98511-1012"}</a>
            
            <a href="mailto:torontosac@gmail.com" target="_blank" rel="noopener noreferrer">torontosac@gmail.com</a>
            
              <a href="https://maps.google.com/?q=Rua+Mesquita,+384,+Vila+Deodoro,+SP" target="_blank" rel="noopener noreferrer">
                {footer.address_line1 || "Rua Mesquita, 384"}<br />{footer.address_line2 || "Vila Deodoro, SP"}
              </a>
            
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="footer-copyright-stack">
          <a 
            href="/admin/login" 
            className="admin-access-link"
            aria-label="Painel"
            title="Painel"
          >
            painel
          </a>
          
            <span>{footer.copyright}</span>
          
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = "Footer";
