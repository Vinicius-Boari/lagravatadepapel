import { MessageCircle, Instagram, Facebook, Video as TikTokIcon, Mail } from "lucide-react";
import { memo } from "react";

export const Contacts = memo(() => {
  const contacts = [
    { 
      platform: "WhatsApp", 
      info: "(11) 98511-1012", 
      link: "https://api.whatsapp.com/send?phone=5511985111012",
      icon: <MessageCircle className="w-6 h-6" />
    },
    { 
      platform: "Instagram", 
      info: "@lagravatadepapel", 
      link: "https://www.instagram.com/lagravatadepapel/",
      icon: <Instagram className="w-6 h-6" />
    },
    { 
      platform: "Facebook", 
      info: "La Gravata de Papel", 
      link: "https://www.facebook.com/lagravatadepapel",
      icon: <Facebook className="w-6 h-6" />
    },
    { 
      platform: "TikTok", 
      info: "@lagravatadepapel", 
      link: "https://www.tiktok.com/@lagravatadepapel",
      icon: <TikTokIcon className="w-6 h-6" />
    },
    { 
      platform: "E-mail", 
      info: "torontosac@gmail.com", 
      link: "mailto:torontosac@gmail.com",
      icon: <Mail className="w-6 h-6" />
    }
  ];

  return (
    <section className="contacts-section" id="contatos">
      <div className="section-header reveal text-center">
        <h2 className="mx-auto !text-red-600 font-bold">Contatos</h2>
      </div>
      
      <div className="contacts-grid scene-3d">
        {contacts.map((contact, i) => (
          <a 
            key={i}
            href={contact.link}
            target="_blank"
            rel="noopener noreferrer"
            className="contact-card tilt-3d scroll-3d reveal group"
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
        ))}
      </div>
    </section>
  );
});

Contacts.displayName = "Contacts";
