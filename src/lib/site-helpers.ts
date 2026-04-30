// Helpers used by both the public site and the admin preview.

export function buildWhatsAppUrl(phone: string, message: string) {
  const clean = phone.replace(/\D/g, "");
  return `https://api.whatsapp.com/send?phone=${clean}&text=${encodeURIComponent(message)}`;
}

/** Parses a YouTube/Vimeo/Instagram URL into an embed URL. Returns null if not recognized. */
export function parseEmbedUrl(url: string): { type: "youtube" | "vimeo" | "instagram"; embed: string } | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    // YouTube
    if (u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be")) {
      let id = "";
      if (u.hostname.includes("youtu.be")) {
        id = u.pathname.slice(1);
      } else if (u.pathname.startsWith("/watch")) {
        id = u.searchParams.get("v") ?? "";
      } else if (u.pathname.startsWith("/shorts/")) {
        id = u.pathname.split("/")[2] ?? "";
      } else if (u.pathname.startsWith("/embed/")) {
        id = u.pathname.split("/")[2] ?? "";
      }
      if (!id) return null;
      return { type: "youtube", embed: `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&modestbranding=1` };
    }
    // Vimeo
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean)[0];
      if (!id) return null;
      return { type: "vimeo", embed: `https://player.vimeo.com/video/${id}?autoplay=1&muted=1&loop=1&background=1` };
    }
    // Instagram embed
    if (u.hostname.includes("instagram.com")) {
      const path = u.pathname.replace(/\/$/, "");
      return { type: "instagram", embed: `https://www.instagram.com${path}/embed` };
    }
  } catch {
    return null;
  }
  return null;
}
