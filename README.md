# Indiacot — Website

Marketing website for **Indiacot**, a manufacturer of print-finishing machines (i-Foil,
hot foil stamping, screen printing, foil fusing, UV coating, lamination, and Cast & Cure),
engineered in Rajkot, Gujarat.

This is a **static website** — plain HTML, CSS, and JavaScript with no build step. You can
open it directly in a browser or deploy it to any static host.

## Project structure

```
.
├── index.html              # Home page
├── print.html              # Print-friendly version of the home page (standalone)
├── styles.css              # Main stylesheet
├── cinematic.css / .js     # Scroll/reveal animations
├── map-intro.css / .js     # Animated map intro
├── tilt.js                 # Card tilt effect
├── tweaks-app.jsx          # Dev-only tweak panel (React, not part of the live site)
├── tweaks-panel.jsx        # Dev-only tweak panel UI
├── sitemap.xml             # SEO sitemap
├── robots.txt              # Crawler rules
├── products/               # Individual machine / product pages
│   ├── i-foil-online.html
│   ├── i-foil-semi-automatic.html
│   ├── foil-fusing.html
│   ├── comp-foil-fusing.html
│   ├── screen-printing.html
│   ├── lamination.html
│   ├── film-laminating.html
│   ├── gst1060-cold-foil.html
│   ├── catalogue.js
│   └── product.js
└── assets/                 # Images, videos, and product catalogue PDFs
    └── catalogues/         # Downloadable product PDFs
```

## Viewing locally

Because the pages reference assets by relative path, serve the folder over a local
web server rather than opening the file directly:

```bash
# Python 3
python3 -m http.server 8000
```

Then open <http://localhost:8000/> in your browser.

## Deploying

The site works on any static host (GitHub Pages, Netlify, Vercel, Cloudflare Pages, etc.).
The home page is `index.html`, which these hosts serve automatically at the site root.

- **GitHub Pages:** repo Settings → Pages → deploy from the `main` branch root.
- **Netlify / Vercel:** import the repo; no build command, publish directory is the repo root.

> **Note on `robots.txt`:** it is set to allow search engines to index the site and points
> to `sitemap.xml`. If you are deploying to a staging URL that should *not* be indexed,
> change the contents to `User-agent: *` / `Disallow: /` before going live.

## Notes

- The `.jsx` tweak-panel files are development helpers and are not loaded by the live pages.
- Working/scratch files (the original `uploads/` and `screenshots/` folders, plus
  `.thumbnail`) are excluded via `.gitignore` and are not part of the published site.
