/**
 * InstagramCarousel3D Component
 * 
 * A 3D rotating carousel that displays Instagram posts.
 * Utilizes RequestAnimationFrame for smooth rotation and CSS 3D transforms.
 */
import { useEffect, useRef, useState } from "react";
import { useInstagramPosts, type InstagramPost } from "@/hooks/useInstagramPosts";
import { memo } from "react";

type Config = {
  handle?: string;
  profile_url?: string;
  title?: string;
  subtitle?: string;
};

/**
 * 3D rotating carousel for Instagram posts.
 * Posts are arranged in a circle in 3D space and continuously rotate.
 * Hover any card to pause and inspect; click to open in Instagram.
 */
import { memo } from "react";

export const InstagramCarousel3D = memo(function InstagramCarousel3D({ config }: { config: Config }) {
  const { posts, loading } = useInstagramPosts();
  const stageRef = useRef<HTMLDivElement>(null);
  const angleRef = useRef(0);
  // Speed: each card stays in front for ~2.5s. degrees/frame = (360/count) / (2.5 * 60fps)
  const computedSpeed = (360 / (posts.length > 0 ? posts.length : 8)) / (2.5 * 60);
  const targetSpeedRef = useRef(computedSpeed);
  const speedRef = useRef(computedSpeed);
  const rafRef = useRef<number>(0);
  const [active, setActive] = useState<InstagramPost | null>(null);

  const profileUrl = config.profile_url ?? `https://www.instagram.com/${config.handle ?? "lagravatadepapel"}`;
  const handle = config.handle ?? "lagravatadepapel";

  // List used for rendering — fall back to placeholders if empty
  const list: InstagramPost[] = posts.length > 0 ? posts : Array.from({ length: 8 }).map((_, i) => ({
    id: `placeholder-${i}`,
    image_url: "",
    caption: "Siga-nos no instagram",
    permalink: profileUrl,
    position: i,
    is_published: true,
    source: "manual",
    posted_at: new Date().toISOString(),
  }));

  const count = list.length;
  const radius = Math.max(280, count * 38);

  useEffect(() => {
    const tick = () => {
      speedRef.current += (targetSpeedRef.current - speedRef.current) * 0.06;
      angleRef.current += speedRef.current;
      const stage = stageRef.current;
      if (stage) stage.style.transform = `translateZ(-${radius}px) rotateY(${angleRef.current}deg)`;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [radius]);

  return (
    <section className="ig3d-section" id="instagram">
      <div className="ig3d-bg" aria-hidden />

      <div className="ig3d-header reveal">
        <div className="ig3d-eyebrow">
          <span className="ig3d-dot" /> ao vivo no instagram
        </div>
        <h2 className="flex flex-col items-center gap-1">
          <span className="text-white">{config.title ?? "Siga no Instagram"}</span>
          <span className="not-italic text-red-600 font-bold drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]">@{handle}</span>
        </h2>
        <p className="ig3d-sub">{config.subtitle ?? "Os bastidores das nossas invasões — atualizados em tempo real."}</p>
      </div>

      <div className="ig3d-scene">

        <div className="ig3d-stage" ref={stageRef}>
          {list.map((post, i) => {
            const rot = (360 / count) * i;
            return (
              <button
                key={post.id}
                type="button"
                className="ig3d-card"
                style={{ transform: `rotateY(${rot}deg) translateZ(${radius}px)` }}
                onClick={() => {
                  if (post.permalink) {
                    window.open(post.permalink, "_blank", "noopener,noreferrer");
                  }
                }}
                aria-label={post.caption || "Post do Instagram"}
              >
                {post.image_url ? (
                  <img src={post.image_url} alt={post.caption || "Foto de animação de casamento Instagram La Gravata"} loading="lazy" />
                ) : (
                  <div className="ig3d-empty">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  </div>
                )}
                <div className="ig3d-card-shine" />
                <div className="ig3d-card-info">
                  <span className="ig3d-handle">@{handle}</span>
                  <p>{post.caption || "—"}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="ig3d-footer reveal">
        <a className="ig3d-cta" href={profileUrl} target="_blank" rel="noopener noreferrer">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
          </svg>
          <span>Seguir @{handle}</span>
          <span className="ig3d-arrow">→</span>
        </a>
        {loading && <span className="ig3d-loading">carregando feed…</span>}
      </div>

      {active && (
        <div className="ig3d-modal" onClick={() => setActive(null)}>
          <div className="ig3d-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="ig3d-modal-close" onClick={() => setActive(null)} aria-label="Fechar">✕</button>
            <div className="ig3d-modal-img">
              {active.image_url && <img src={active.image_url} alt={active.caption} />}
            </div>
            <div className="ig3d-modal-body">
              <span className="ig3d-handle">@{handle}</span>
              <p>{active.caption}</p>
              {active.permalink && (
                <a href={active.permalink} target="_blank" rel="noopener noreferrer">Ver no Instagram →</a>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
});
