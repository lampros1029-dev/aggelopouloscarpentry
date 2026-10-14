// POST /api/contact — φόρμα επικοινωνίας (αντικαθιστά το Web3Forms).
// Bindings (Pages project → Settings → Bindings):
//   PHOTOS = R2 bucket "aggelopoulos-contact-uploads"
//   MAILER = Service binding → Worker "aggelopoulos-contact-mailer"
// Pages Functions δεν υποστηρίζουν send_email, γι' αυτό η αποστολή γίνεται από τον Worker.

const MAX_FILES = 15;
const MAX_TOTAL_SAFE = 17.5 * 1024 * 1024; // 17.5MB raw → ~24MB MIME after base64 + line breaks
const OK_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });

const clean = (v, max) => String(v ?? '').replace(/\r/g, '').slice(0, max).trim();
const oneLine = (v, max) => clean(v, max).replace(/\n+/g, ' ');

export async function onRequestPost({ request, env }) {
  let fd;
  try { fd = await request.formData(); } catch { return json({ success: false, message: 'Μη έγκυρη υποβολή.' }, 400); }

  // Anti-spam: honeypot + χρόνος συμπλήρωσης
  if (clean(fd.get('_gotcha'), 200)) return json({ success: true }); // σιωπηλή απόρριψη
  const started = Number(fd.get('_started') || 0);
  if (!started || Date.now() - started < 2500) return json({ success: false, message: 'Πολύ γρήγορη υποβολή.' }, 400);

  const name = oneLine(fd.get('name'), 120);
  const phone = oneLine(fd.get('phone'), 40);
  const email = oneLine(fd.get('email'), 200);
  const message = clean(fd.get('message'), 8000);

  if (name.length < 3) return json({ success: false, message: 'Συμπληρώστε ονοματεπώνυμο.' }, 400);
  if (!/^[0-9+ ()-]{8,}$/.test(phone)) return json({ success: false, message: 'Μη έγκυρο τηλέφωνο.' }, 400);
  if (!/^[^\s@<>",]+@[^\s@<>",]+\.[^\s@<>",]+$/.test(email)) return json({ success: false, message: 'Μη έγκυρο email.' }, 400);
  if (message.length < 10) return json({ success: false, message: 'Το μήνυμα είναι πολύ σύντομο.' }, 400);

  const files = fd.getAll('photos').filter(f => f && typeof f === 'object' && f.size > 0);
  if (files.length > MAX_FILES) return json({ success: false, message: `Έως ${MAX_FILES} φωτογραφίες.` }, 413);
  const total = files.reduce((s, f) => s + f.size, 0);
  if (total > MAX_TOTAL_SAFE) return json({ success: false, message: 'Οι φωτογραφίες ξεπερνούν το όριο μεγέθους.' }, 413);
  for (const f of files) if (!OK_TYPES.has(f.type)) return json({ success: false, message: 'Επιτρέπονται μόνο εικόνες (JPG/PNG/WebP).' }, 415);

  const id = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}`;
  const keys = [];
  try {
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const ext = f.type === 'image/png' ? 'png' : f.type === 'image/webp' ? 'webp' : 'jpg';
      const key = `${id}/photo-${String(i + 1).padStart(2, '0')}.${ext}`;
      await env.PHOTOS.put(key, f.stream(), { httpMetadata: { contentType: f.type } });
      keys.push({ key, filename: `photo-${i + 1}.${ext}`, type: f.type });
    }

    const resp = await env.MAILER.fetch('https://mailer/send', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name, phone, email, message, attachments: keys }),
    });
    if (!resp.ok) {
      console.error('mailer failed', resp.status, await resp.text());
      return json({ success: false, message: 'Η αποστολή απέτυχε.' }, 502);
    }
    return json({ success: true, message: 'Ελήφθη!' });
  } catch (err) {
    console.error('contact error', err && err.stack || err);
    return json({ success: false, message: 'Η αποστολή απέτυχε.' }, 500);
  } finally {
    if (keys.length) { try { await env.PHOTOS.delete(keys.map(k => k.key)); } catch (e) { console.error('r2 cleanup', e); } }
  }
}

export const onRequest = () => json({ success: false, message: 'Method not allowed' }, 405);
