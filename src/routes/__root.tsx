import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "La Gravata de Papel — Vamos Invadir Seu Evento" },
      {
        name: "description",
        content:
          "La Gravata de Papel — Vamos invadir seu casamento com personagens da série La Casa de Papel. Animação teatral, tequileiros, robô de LED, bazuca CO2 e muito mais.",
      },
      { name: "author", content: "La Gravata de Papel" },
      { property: "og:title", content: "La Gravata de Papel — Vamos Invadir Seu Evento" },
      {
        property: "og:description",
        content:
          "Animação teatral inspirada em La Casa de Papel para casamentos e festas em São Paulo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "La Gravata de Papel — Vamos Invadir Seu Evento" },
      { name: "description", content: "Lagravatadepapel" },
      { property: "og:description", content: "Lagravatadepapel" },
      { name: "twitter:description", content: "Lagravatadepapel" },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/57d9c635-ddb0-48c2-9b6d-ddc2b59b2927/id-preview-101bea68--b8b46a26-2e6d-4ba6-8b8c-8d0a9627d82c.lovable.app-1777559985653.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/57d9c635-ddb0-48c2-9b6d-ddc2b59b2927/id-preview-101bea68--b8b46a26-2e6d-4ba6-8b8c-8d0a9627d82c.lovable.app-1777559985653.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=Inter:wght@300;400;500;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return <Outlet />;
}
