// Επεξεργάζεσαι ΜΟΝΟ αυτό το αρχείο όταν προσθέτεις/αλλάζεις σελίδες.
// Cloudflare Pages Functions - dynamic sitemap source list.
export const BASE = 'https://aggelopouloscarpentry.com';

// Κάθε route = μια σελίδα του site. Πρόσθεσε/αφαίρεσε ανάλογα.
export const ROUTES = [
  { path: '/',                       changefreq: 'weekly',  priority: 1.0 },
  { path: '/έπιπλα-κουζίνας/',       changefreq: 'monthly', priority: 0.9 },
  { path: '/έπιπλα-υπνοδωμάτιου/',   changefreq: 'monthly', priority: 0.9 },
  { path: '/έπιπλα-μπάνιου/',        changefreq: 'monthly', priority: 0.8 },
  { path: '/πόρτες-και-κουφώματα/',  changefreq: 'monthly', priority: 0.8 },
  { path: '/ειδικές-κατασκευές/',    changefreq: 'monthly', priority: 0.8 },
  { path: '/επικοινωνία/',           changefreq: 'monthly', priority: 0.6 }
];
