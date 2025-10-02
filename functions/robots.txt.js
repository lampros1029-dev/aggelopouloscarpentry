// Cloudflare Pages Function για /robots.txt ώστε να υπάρχει ΠΑΝΤΑ το Sitemap:
export async function onRequest() {
  const body = `User-agent: *
Allow: /

Sitemap: https://aggelopouloscarpentry.com/sitemap.xml
`;
  return new Response(body, {
    headers: { 'content-type': 'text/plain; charset=utf-8' }
  });
}
