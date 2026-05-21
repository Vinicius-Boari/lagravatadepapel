import { createRouter, useRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

/**
 * Standard Error Component
 * 
 * Provides a clean fallback UI for unexpected runtime errors.
 * Includes a stack trace preview in development mode.
 */
function DefaultErrorComponent({ error, reset }: { error: any; reset: () => void }) {
  const router = useRouter();

  // Standardize error message extraction
  const errorMessage = error?.message || (typeof error === 'string' ? error : "An unexpected error occurred.");
  const isResponseError = error instanceof Response || (error && typeof error === 'object' && 'status' in error);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-zinc-100">
      <div className="max-w-md w-full text-center space-y-6 animate-in fade-in duration-500">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-red-600/10 border border-red-600/20 shadow-2xl">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-white uppercase italic">Ops! Algo deu errado</h1>
          <p className="text-sm text-zinc-400">
            {isResponseError 
              ? "Sua sessão pode ter expirado ou você não tem permissão para acessar esta área." 
              : "Tivemos um problema técnico temporário. Nossa equipe já foi notificada."}
          </p>
        </div>

        {import.meta.env.DEV && errorMessage && (
          <div className="mt-4 p-4 rounded-lg bg-zinc-900 border border-zinc-800 text-left overflow-hidden shadow-inner">
            <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse" />
              Debug Info (Dev Only)
            </p>
            <pre className="max-h-40 overflow-auto font-mono text-[11px] text-zinc-500 leading-relaxed custom-scrollbar">
              {errorMessage}
              {error?.stack && `\n\nStack:\n${error.stack}`}
            </pre>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-red-700 hover:scale-105 active:scale-95 shadow-lg shadow-red-900/20"
          >
            Tentar novamente
          </button>
          <a
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 px-6 py-3 text-sm font-bold text-zinc-300 transition-all hover:bg-zinc-800 hover:text-white"
          >
            Voltar ao Início
          </a>
        </div>
      </div>
    </div>
  );
}

export const getRouter = () => {
  const router = createRouter({
    routeTree,
    context: {},
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultErrorComponent: DefaultErrorComponent,
  });

  return router;
};
