/* Cookie consent banner — frosted-glass card (owner's reference design), equal-prominence Reject/Accept.
   Cookie consent + Google Consent Mode v2. Vanilla, no dependencies, no external requests.
   The inline <head> snippet sets the 'default' (denied) and re-applies a stored choice before GTM loads.
   This file renders the banner/settings panel and sends gtag('consent','update') on a choice. */
(function () {
  'use strict';
  var KEY = 'cc_consent', VERSION = 1, MAX_AGE = 182 * 864e5; // ~6 months
  var d = document, w = window;
  w.dataLayer = w.dataLayer || [];
  function gtag() { w.dataLayer.push(arguments); }
  var en = /^en/i.test(d.documentElement.lang || '');
  var T = en ? {
    title: 'We value your privacy', desc: 'We use cookies for analytics and advertising. You can change your choice anytime in ', descL: 'Cookie settings', descE: '.',
    accept: 'Accept all', reject: 'Reject all', settings: 'Customize', save: 'Save',
    nec: 'Necessary', necD: 'Required for the site to work.',
    an: 'Analytics', anD: 'Visitor statistics.',
    ad: 'Advertising', adD: 'Google Ads measurement.'
  } : {
    title: 'Σεβόμαστε το απόρρητό σας', desc: 'Χρησιμοποιούμε cookies για στατιστικά και διαφήμιση. Μπορείτε να αλλάξετε την επιλογή σας οποιαδήποτε στιγμή στις ', descL: 'Ρυθμίσεις cookies', descE: '.',
    accept: 'Αποδοχή όλων', reject: 'Απόρριψη', settings: 'Ρυθμίσεις', save: 'Αποθήκευση',
    nec: 'Απαραίτητα', necD: 'Για να λειτουργεί ο ιστότοπος.',
    an: 'Στατιστικά', anD: 'Μέτρηση επισκεψιμότητας.',
    ad: 'Διαφήμιση', adD: 'Μέτρηση διαφημίσεων Google.'
  };

  function read() {
    try {
      var c = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (c && c.v === VERSION && typeof c.ts === 'number' && Date.now() - c.ts < MAX_AGE) return c;
    } catch (e) {}
    return null;
  }
  function state(a, m) {
    var g = function (x) { return x ? 'granted' : 'denied'; };
    return { analytics_storage: g(a), ad_storage: g(m), ad_user_data: g(m), ad_personalization: g(m) };
  }
  function apply(a, m) {
    try { localStorage.setItem(KEY, JSON.stringify({ v: VERSION, ts: Date.now(), a: !!a, m: !!m })); } catch (e) {}
    var s = state(a, m);
    gtag('consent', 'update', s);
    w.dataLayer.push({ event: 'consent_update', consent_analytics: s.analytics_storage, consent_ads: s.ad_storage });
    close();
  }

  var root, prefs, cbA, cbM, saveBtn, setBtn, lastFocus;
  function el(tag, cls, txt) { var e = d.createElement(tag); if (cls) e.className = cls; if (txt) e.textContent = txt; return e; }
  function row(id, name, desc, locked) {
    var r = el('div', 'cc-row'), lab = el('label', 'cc-row__lab'), txt = el('span', 'cc-row__txt');
    var cb = el('input', 'cc-sw'); cb.type = 'checkbox'; cb.id = 'cc-' + id;
    if (locked) { cb.checked = true; cb.disabled = true; cb.setAttribute('aria-describedby', 'cc-' + id + '-d'); }
    lab.htmlFor = cb.id;
    txt.appendChild(el('strong', null, name));
    var dd = el('span', 'cc-row__d', desc); dd.id = 'cc-' + id + '-d'; txt.appendChild(dd);
    lab.appendChild(txt); lab.appendChild(cb); r.appendChild(lab);
    return { row: r, cb: cb };
  }
  function build() {
    root = el('div', 'cc'); root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'false');
    root.setAttribute('aria-labelledby', 'cc-title'); root.setAttribute('aria-describedby', 'cc-desc');
    var box = el('div', 'cc__box');
    var h = el('h2', 'cc__title', T.title); h.id = 'cc-title';
    var p = el('p', 'cc__desc', T.desc), inl = el('button', 'cc-inl', T.descL); inl.type = 'button'; inl.onclick = function () { showPrefs(true); }; p.appendChild(inl); p.appendChild(d.createTextNode(T.descE)); p.id = 'cc-desc';
    prefs = el('div', 'cc__prefs'); prefs.id = 'cc-prefs'; prefs.hidden = true;
    var n = row('nec', T.nec, T.necD, true), a = row('an', T.an, T.anD), m = row('ad', T.ad, T.adD);
    cbA = a.cb; cbM = m.cb;
    prefs.appendChild(n.row); prefs.appendChild(a.row); prefs.appendChild(m.row);
    var act = el('div', 'cc__actions');
    var rej = el('button', 'cc-btn cc-btn--rej', T.reject), acc = el('button', 'cc-btn cc-btn--acc', T.accept);
    setBtn = el('button', 'cc-link', T.settings); saveBtn = el('button', 'cc-btn cc-btn--save', T.save);
    [rej, acc, setBtn, saveBtn].forEach(function (b) { b.type = 'button'; });
    rej.setAttribute('data-cc', 'reject'); acc.setAttribute('data-cc', 'accept');
    setBtn.setAttribute('aria-expanded', 'false'); setBtn.setAttribute('aria-controls', 'cc-prefs');
    saveBtn.hidden = true;
    rej.onclick = function () { apply(false, false); };
    acc.onclick = function () { apply(true, true); };
    saveBtn.onclick = function () { apply(cbA.checked, cbM.checked); };
    setBtn.onclick = function () { showPrefs(prefs.hidden); };
    act.appendChild(setBtn); act.appendChild(rej); act.appendChild(acc); act.appendChild(saveBtn);
    box.appendChild(h); box.appendChild(p); box.appendChild(prefs); box.appendChild(act);
    root.appendChild(box);
    root.addEventListener('keydown', function (e) { if (e.key === 'Escape' && read()) close(); });
    // Keep pointer/wheel/touch gestures on the banner from reaching page-level scroll/animation drivers
    // (e.g. a hero scrubbed by pointermove): the banner must never steer or stall the page animation.
    ['pointermove', 'mousemove', 'pointerdown', 'touchstart'].forEach(function (t) {
      root.addEventListener(t, function (e) { e.stopPropagation(); }, { passive: true });
    });
    d.body.appendChild(root);
  }
  function showPrefs(on) {
    prefs.hidden = !on; saveBtn.hidden = !on;
    setBtn.setAttribute('aria-expanded', on ? 'true' : 'false');
    root.classList.toggle('cc--prefs', on);
    if (on) cbA.focus();
  }
  function open(withPrefs, focus) {
    if (!root) build();
    var c = read();
    cbA.checked = !!(c && c.a); cbM.checked = !!(c && c.m);
    root.hidden = false; d.body.classList.add('cc-open');
    showPrefs(!!withPrefs);
    if (focus) { lastFocus = d.activeElement; (withPrefs ? cbA : root.querySelector('.cc-btn')).focus(); }
  }
  function close() {
    if (!root) return;
    root.hidden = true; d.body.classList.remove('cc-open');
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) {} } lastFocus = null;
  }
  w.ccOpen = function () { open(true, true); };
  d.addEventListener('click', function (e) {
    var t = e.target && e.target.closest ? e.target.closest('[data-cc-open]') : null;
    if (!t) return; e.preventDefault(); open(true, true);
  });
  function init() {
    if (!d.querySelector('[data-cc-open]')) { // pages without a footer link get a small one at the end
      var p = el('p', 'cc-reopen'), b = el('button', 'cc-footer-link', en ? 'Cookie settings' : 'Ρυθμίσεις cookies');
      b.type = 'button'; b.setAttribute('data-cc-open', ''); p.appendChild(b); d.body.appendChild(p);
    }
    if (!read()) open(false, false);
  }
  // Build the banner after first paint, when the main thread is idle, so it never competes with page start-up animation.
  function later() { (w.requestIdleCallback || function (f) { setTimeout(f, 300); })(init, { timeout: 2000 }); }
  if (d.readyState === 'complete') later(); else w.addEventListener('load', later);
})();
