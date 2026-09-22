import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const isSharedPagesHost = site?.hostname === 'alexis01001415-oss.github.io';
  const rootRule = import.meta.env.PUBLIC_DEMO_MODE !== 'false' ? 'Disallow: /' : 'Allow: /';
  // UMBRAL is a separate, indexable Pages project on this shared hostname.
  const projectRule = isSharedPagesHost ? '\nAllow: /umbral-blender-web/' : '';
  const projectSitemap = isSharedPagesHost
    ? `Sitemap: ${new URL('umbral-blender-web/sitemap.xml', site).href}\n`
    : '';
  return new Response(
    `User-agent: *\n${rootRule}${projectRule}\n\nSitemap: ${new URL('sitemap-index.xml', site).href}\n${projectSitemap}`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
};
