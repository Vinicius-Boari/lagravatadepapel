import { useState, useEffect } from "react";

export type InstagramPost = {
  id: string;
  image_url: string;
  caption: string;
  permalink: string | null;
  position: number;
  is_published: boolean;
  source: string;
  posted_at: string;
};

const STATIC_POSTS: InstagramPost[] = [
  {
    id: "static-1",
    image_url: "/images/hero_invasion.png",
    caption: "Invasão La Gravata de Papel",
    permalink: "https://www.instagram.com/lagravatadepapel",
    position: 0,
    is_published: true,
    source: "static",
    posted_at: new Date().toISOString(),
  },
  {
    id: "static-2",
    image_url: "/images/hero_party.png",
    caption: "Animação da Balada",
    permalink: "https://www.instagram.com/lagravatadepapel",
    position: 1,
    is_published: true,
    source: "static",
    posted_at: new Date().toISOString(),
  },
  {
    id: "static-3",
    image_url: "/images/hero_venue.png",
    caption: "Momento da Gravata",
    permalink: "https://www.instagram.com/lagravatadepapel",
    position: 2,
    is_published: true,
    source: "static",
    posted_at: new Date().toISOString(),
  },
  {
    id: "static-4",
    image_url: "/images/service_robo.png",
    caption: "Robô de LED",
    permalink: "https://www.instagram.com/lagravatadepapel",
    position: 3,
    is_published: true,
    source: "static",
    posted_at: new Date().toISOString(),
  },
  {
    id: "static-5",
    image_url: "/images/service_tequileiro.png",
    caption: "Tequileiros",
    permalink: "https://www.instagram.com/lagravatadepapel",
    position: 4,
    is_published: true,
    source: "static",
    posted_at: new Date().toISOString(),
  },
  {
    id: "static-6",
    image_url: "/images/service_co2.png",
    caption: "Bazuca CO2",
    permalink: "https://www.instagram.com/lagravatadepapel",
    position: 5,
    is_published: true,
    source: "static",
    posted_at: new Date().toISOString(),
  },
];

export function useInstagramPosts() {
  const [posts, setPosts] = useState<InstagramPost[]>(STATIC_POSTS);
  const [loading, setLoading] = useState(false);

  return { posts, loading, reload: () => {} };
}
