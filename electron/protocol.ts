import { protocol } from "electron";
import path from "node:path";
import fs from "node:fs/promises";

export const APP_SCHEME = "app";
export const APP_HOST = "bundle";
export const APP_ORIGIN = `${APP_SCHEME}://${APP_HOST}`;

// Espelho da CSP de produção web (vite.config.ts), sem Turnstile.
// 'unsafe-inline' em script-src mantido por causa do script inline do index.html.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: https:",
  "connect-src 'self' https://*.supabase.co https://*.supabase.in wss://*.supabase.co wss://*.supabase.in",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-src 'none'",
].join("; ");

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".txt": "text/plain",
  ".webmanifest": "application/manifest+json",
};

/**
 * Deve ser chamado ANTES de app.whenReady().
 * "standard" dá origem real (app://bundle) — History API (BrowserRouter),
 * paths absolutos /assets/... e localStorage (sessão Supabase) funcionam.
 */
export function registerSchemePrivileges(): void {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: APP_SCHEME,
      privileges: { standard: true, secure: true, supportFetchAPI: true },
    },
  ]);
}

/**
 * Serve dist/ via app://bundle com fallback SPA (equivalente desktop
 * dos rewrites da Vercel) e injeta CSP no HTML.
 */
export function registerAppProtocol(distDir: string): void {
  const root = path.resolve(distDir);

  protocol.handle(APP_SCHEME, async (request) => {
    const url = new URL(request.url);
    if (url.host !== APP_HOST) {
      return new Response("Not found", { status: 404 });
    }

    const requested = path.normalize(
      path.join(root, decodeURIComponent(url.pathname))
    );
    if (requested !== root && !requested.startsWith(root + path.sep)) {
      return new Response("Forbidden", { status: 403 });
    }

    let filePath = requested;
    try {
      const stat = await fs.stat(filePath);
      if (stat.isDirectory()) {
        filePath = path.join(root, "index.html");
      }
    } catch {
      // Arquivo não existe → fallback SPA para o React Router
      filePath = path.join(root, "index.html");
    }

    const ext = path.extname(filePath).toLowerCase();
    const headers = new Headers({
      "Content-Type": MIME_TYPES[ext] ?? "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
    });
    if (ext === ".html") {
      headers.set("Content-Security-Policy", CSP);
      headers.set("X-Frame-Options", "DENY");
      headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    }

    const data = await fs.readFile(filePath);
    return new Response(new Uint8Array(data), { status: 200, headers });
  });
}
