// Tel-click tracking -> dataLayer (GTM-NQ462JWK handles Google Ads / GA4 tags).
(function () {
  var slug = '';
  try { slug = decodeURIComponent(location.pathname).replace(/^\/+|\/+$/g, '').split('/')[0] || ''; } catch (e) {}
  var map = { '': 'home', 'index.html': 'home', 'έπιπλα-υπνοδωμάτιου': 'ntoulapes', 'έπιπλα-κουζίνας': 'kouzines' };
  var pageType = Object.prototype.hasOwnProperty.call(map, slug) ? map[slug] : slug;
  window.dataLayer = window.dataLayer || [];
  document.addEventListener('click', function (event) {
    var t = event.target;
    var link = t && t.closest ? t.closest('a[href^="tel:"]') : null;
    if (!link) return;
    window.dataLayer.push({ event: 'phone_click', page_type: pageType, link_url: link.getAttribute('href') });
  }, true);
})();

// Mobile-only sticky call bar: reuses the site's existing call button (.btn, "Κάλεσε Τώρα").
// Hidden while the wardrobe 360° tour is on screen / fullscreen, so it never covers the tour controls.
(function () {
  if (document.querySelector('.m-callbar')) return;
  var css = '.m-callbar{display:none}' +
    '@media (max-width:768px){' +
    '.m-callbar{display:block;position:fixed;left:12px;right:12px;bottom:calc(10px + env(safe-area-inset-bottom));z-index:900;text-align:center;' +
    'border-radius:999px;font-weight:700;padding:14px 22px;background:var(--accent,#6b4f36);color:#fff !important;text-decoration:none;box-shadow:0 10px 24px rgba(0,0,0,.28);transition:transform .25s ease,opacity .25s ease}' +
    '.m-callbar.is-off{transform:translateY(140%);opacity:0;pointer-events:none}' +
    'body.has-callbar{padding-bottom:calc(76px + env(safe-area-inset-bottom))}' +
    'body:has(.tour.is-fs) .m-callbar,body:has(.tour-ov.is-open) .m-callbar,body:has(.tour-fz) .m-callbar{display:none}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  var a = document.createElement('a');
  a.className = 'btn m-callbar'; a.href = 'tel:+306936815779'; a.textContent = 'Κάλεσε Τώρα';
  a.setAttribute('aria-label', 'Κάλεσε Τώρα: 693 681 5779');
  document.body.appendChild(a); document.body.classList.add('has-callbar');
  var tours = document.querySelectorAll('.tour, .tour__box');
  if (tours.length && 'IntersectionObserver' in window) {
    var vis = new Set();
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.isIntersecting ? vis.add(e.target) : vis.delete(e.target); });
      a.classList.toggle('is-off', vis.size > 0);
    });
    tours.forEach(function (t) { io.observe(t); });
  }
})();
