import type { APIRoute } from 'astro';
export const GET: APIRoute = ({ site }) =>
  new Response(
    `User-agent: *\n${import.meta.env.PUBLIC_DEMO_MODE !== 'false' ? 'Disallow: /' : 'Allow: /'}\n\nSitemap: ${new URL('sitemap-index.xml', site).href}\n`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
