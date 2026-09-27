// Server-only secrets: read at runtime from process.env (Vercel), falling back to Vite's
// import.meta.env so `.env` files work in `astro dev`.
export function env(name: string): string {
  return process.env[name] || (import.meta.env as Record<string, string | undefined>)[name] || '';
}
