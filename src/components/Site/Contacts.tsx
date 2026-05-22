import { MessageCircle, Instagram, Facebook, Video as TikTokIcon, Mail } from "lucide-react";
import { memo } from "react";


interface ContactsProps {
  content?: any;
}

export const Contacts = memo(({ content }: ContactsProps) => {
  const whatsappUrl = content?.hero?.cta_url || "https://api.whatsapp.com/send?phone=5511985111012";
  const instagramUrl = content?.integrations?.instagram_url || "https://www.instagram.com/lagravatadepapel/";
  const whatsappNumber = content?.footer?.phone || "(11) 98511-1012";
  
  const contacts = [
    { 
      platform: "WhatsApp", 
      info: whatsappNumber, 
      link: whatsappUrl,
      icon: <MessageCircle className="w-6 h-6" />,
      section: "footer",
      field: "phone"
    },
    { 
      platform: "Instagram", 
      info: "@lagravatadepapel", 
      link: instagramUrl,
      icon: <Instagram className="w-6 h-6" />,
      section: "integrations",
      field: "instagram_url"
    },
    { 
      platform: "Facebook", 
      info: "La Gravata de Papel", 
      link: "https://www.facebook.com/lagravatadepapel",
      icon: <Facebook className="w-6 h-6" />,
      section: "footer",
      field: "facebook_url"
    },
    { 
      platform: "TikTok", 
      info: "@lagravatadepapel", 
      link: "https://www.tiktok.com/@lagravatadepapel",
      icon: <TikTokIcon className="w-6 h-6" />,
      section: "footer",
      field: "tiktok_url"
    },
    { 
      platform: "E-mail", 
      info: "torontosac@gmail.com", 
      link: "mailto:torontosac@gmail.com",
      icon: <Mail className="w-6 h-6" />,
      section: "integrations",
      field: "notification_email"
    }
  ];

  return (
    <section className="contacts-section" id="contatos">
      <div className="section-header reveal text-center">
        <h2 className="mx-auto !text-red-600 font-bold">Contatos</h2>
      </div>
      
      <div className="contacts-grid scene-3d">
        {contacts.map((contact, i) => (
          <div key={i} className="reveal">
            
              <a 
                href={contact.link}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-card tilt-3d scroll-3d group h-full"
                onClick={(e) => {
                  // Permitir navegação real nos links de contato
                  if (contact.link.startsWith('mailto:')) return;
                  if (contact.link.startsWith('https://api.whatsapp.com')) return;
                  // Se quiser manter o preventDefault para links internos ou testes, remova as linhas acima
                }}

              >
                <div className="contact-icon-wrapper group-hover:scale-110 transition-transform duration-300">
                  {contact.icon}
                </div>
                <div className="contact-info">
                  <span className="contact-platform">{contact.platform}</span>
                  <span className="contact-handle">{contact.info}</span>
                </div>
                <div className="contact-arrow">
                  <span>→</span>
                </div>
              </a>
            
          </div>
        ))}
      </div>
    </section>
  );
});

Contacts.displayName = "Contacts";
