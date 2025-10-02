import { BASE, ROUTES } from './sitemap-urls';

// Μικρό helper για XML escaping (ασφαλές για ελληνικά/UTF-8).
const esc = (s) => String(s)
  .replace(/&/g,'&amp;').replace(/</g,'&lt;')
  .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');

export async function onRequest() {
  const today = new Date().toISOString().slice(0,10); // YYYY-MM-DD

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${ROUTES.map(({path, changefreq, priority}) => {
  const loc = new URL(path, BASE).href; // χειρίζεται σωστά τα ελληνικά slugs
  return `  <url>
    <loc>${esc(loc)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${Number(priority).toFixed(1)}</priority>
  </url>`;
}).join('\n')}
</urlset>`;

  return new Response(body, {
    headers: { 'content-type': 'application/xml; charset=utf-8' }
  });
}
