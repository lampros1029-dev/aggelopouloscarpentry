// robots.txt.js για full SEO + AI visibility

export async function onRequest() {
  const body = `User-agent: *
Allow: /
Content-signal: search=yes, ai-train=yes

Sitemap: https://aggelopouloscarpentry.com/sitemap.xml`;
  
  return new Response(body, {
    headers: { 'content-type': 'text/plain; charset=utf-8' }
  });
}
