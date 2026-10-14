// Worker που καλείται ΜΟΝΟ μέσω service binding από το Pages Function /api/contact.
// workers_dev=false και χωρίς route → δεν είναι προσβάσιμος από το internet.
import { EmailMessage } from 'cloudflare:email';

const FROM = 'forma@aggelopouloscarpentry.com';
const FROM_NAME = 'Aggelopoulos Carpentry Website';
const TO = 'basilisangelopoulos1965@gmail.com';

const enc = new TextEncoder();
function b64(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(s);
}
const wrap = s => s.replace(/.{1,76}/g, '$&\r\n');
const hdr = s => /^[\x20-\x7e]*$/.test(s) ? s : `=?UTF-8?B?${b64(enc.encode(s))}?=`;
const safe = s => String(s).replace(/[\r\n"<>]/g, ' ').trim();

export default {
  async fetch(request, env) {
    if (request.method !== 'POST') return new Response('no', { status: 405 });
    const { name, phone, email, message, attachments = [] } = await request.json();

    const boundary = 'b' + crypto.randomUUID().replace(/-/g, '');
    const text =
      `Νέο αίτημα από τη φόρμα επικοινωνίας\n\n` +
      `Ονοματεπώνυμο: ${name}\nΤηλέφωνο: ${phone}\nEmail: ${email}\n\nΜήνυμα:\n${message}\n\n` +
      (attachments.length ? `Συνημμένες φωτογραφίες: ${attachments.length}\n` : '') +
      `\nΑπαντήστε σε αυτό το email για να γράψετε απευθείας στον πελάτη.`;

    const parts = [];
    parts.push(
      `MIME-Version: 1.0`,
      `From: ${hdr(FROM_NAME)} <${FROM}>`,
      `To: <${TO}>`,
      `Reply-To: ${hdr(safe(name))} <${safe(email)}>`,
      `Subject: ${hdr('Νέο αίτημα (φόρμα επικοινωνίας) – ' + safe(name))}`,
      `Date: ${new Date().toUTCString()}`,
      `Message-ID: <${crypto.randomUUID()}@aggelopouloscarpentry.com>`,
      `Content-Type: multipart/mixed; boundary="${boundary}"`,
      ``,
      `--${boundary}`,
      `Content-Type: text/plain; charset=UTF-8`,
      `Content-Transfer-Encoding: base64`,
      ``,
      wrap(b64(enc.encode(text)))
    );
    for (const a of attachments) {
      const obj = await env.PHOTOS.get(a.key);
      if (!obj) throw new Error('missing ' + a.key);
      const bytes = new Uint8Array(await obj.arrayBuffer());
      parts.push(
        `--${boundary}`,
        `Content-Type: ${a.type}; name="${safe(a.filename)}"`,
        `Content-Disposition: attachment; filename="${safe(a.filename)}"`,
        `Content-Transfer-Encoding: base64`,
        ``,
        wrap(b64(bytes))
      );
    }
    parts.push(`--${boundary}--`, ``);

    try {
      await env.EMAIL.send(new EmailMessage(FROM, TO, parts.join('\r\n')));
    } catch (e) {
      return new Response('send failed: ' + (e && e.message), { status: 502 });
    }
    return new Response('ok');
  },
};
