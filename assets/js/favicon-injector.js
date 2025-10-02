(function () {
  const H = document.head;
  const links = [
    { rel: "icon", href: "/favicon.ico", sizes: "any" },
    { rel: "icon", type: "image/png", href: "/assets/favicons/favicon-32x32.png", sizes: "32x32" },
    { rel: "icon", type: "image/png", href: "/assets/favicons/favicon-16x16.png", sizes: "16x16" },
    { rel: "apple-touch-icon", href: "/assets/favicons/apple-touch-icon.png" },
    { rel: "manifest", href: "/site.webmanifest" }
  ];
  links.forEach(attrs => {
    const el = document.createElement("link");
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    H.appendChild(el);
  });
  const meta = document.createElement("meta");
  meta.name = "theme-color";
  meta.content = "#5D4E37";
  H.appendChild(meta);
})();