# Bengaluru Residences — Project Library

A simple, premium, **static** website that gives the sales team everything they need to pitch a project — overview, configurations, floor plans, master plan, gallery, amenities, specifications and location — in one place, on one page per project.

No backend. No database. No CRM. No login. Just data-driven HTML pages that anyone can open on a laptop or tablet in a customer meeting.

**This is a lightweight, extracted-content deliverable.** The original brochure PDFs are the private source archive used to build each project's `project.json` and image set — they are intentionally **not** included here or deployed with the site. Every fact, figure, floor plan and master plan shown on the site was read from those brochures and extracted/optimized into the `project.json` + `images/` folder for each project.

---

## How it works

```
PROJECT DATA (project.json)
        +
PROJECT ASSETS (images, brochure.pdf)
        ↓
   SAME TEMPLATE (scripts/generate.js)
        ↓
   PROJECT PAGE (dist/projects/<slug>/index.html)
```

Every project uses **exactly the same** template, CSS and layout. Only the content in `project.json` changes. Sections that have no data (e.g. no RERA number, or no master plan) are automatically omitted from the page — nothing ever renders empty.

## Folder structure

```
site/
├── package.json
├── vercel.json          ← Vercel build config
├── netlify.toml         ← Netlify build config
├── scripts/
│   └── generate.js      ← the site generator (Node, no dependencies)
├── public/
│   ├── styles.css       ← the entire design system (self-contained, no CDN)
│   └── main.js          ← search, mobile menu, lightbox/zoom
├── projects/
│   ├── solace/
│   │   ├── project.json
│   │   └── images/*.webp    ← hero, gallery, floor plans, master plan — all extracted from the brochure
│   ├── mahindra-blossom/
│   │   └── ...
│   └── ... (15 projects total)
└── dist/                 ← generated output, this is what you deploy
```

Total package size is ~25-30 MB — light enough to clone, build and deploy in seconds.

## Building the site

The generator is plain Node.js — no npm install required.

```bash
cd site
node scripts/generate.js
```

This reads every `projects/*/project.json`, renders the homepage and one page per project into `dist/`, and copies each project's images/brochure alongside its page. Open `dist/index.html` in a browser, or serve the folder:

```bash
npx serve dist
```

## Deploying

**Any static host works** — there is no server, no API, no environment variables.

- **Vercel**: import the GitHub repo. `vercel.json` already sets the build command (`node scripts/generate.js`) and output directory (`dist`). Nothing else to configure.
- **Netlify**: import the repo. `netlify.toml` already sets the build command and publish directory.
- **Cloudflare Pages**: in the dashboard, set Build command to `node scripts/generate.js` and Build output directory to `dist`.
- **GitHub Pages**: run `node scripts/generate.js` locally and push the contents of `dist/` to a `gh-pages` branch (GitHub Pages can't run a Node build step itself).

## Pushing to GitHub

No special steps needed — the whole repo is ~25-30 MB, well under any GitHub limit.

```bash
cd site
git init
git add .
git commit -m "Bengaluru Residences project library"
git remote add origin <your-repo-url>
git push -u origin main
```

## Adding a new project (no code changes needed)

1. Process the new project's brochure into extracted content (same workflow used for all 15 projects here): pull the overview, configurations, sizes, pricing/possession if available, highlights, amenities, specifications, location detail and RERA number, and crop the useful images (hero, gallery, floor plans per configuration, master plan).
2. Create a new folder: `projects/<new-project-slug>/`
3. Add `project.json` (copy an existing one as a template — see schema below)
4. Add `images/` with the extracted photos/floor plans/master plan, as `.webp`
5. Run `node scripts/generate.js`
6. Check `dist/projects/<new-project-slug>/index.html`
7. Commit and deploy

The homepage, navigation and page layout all update **automatically** — the generator is fully data-driven, so adding a project never requires touching `scripts/generate.js`, `public/styles.css`, or any other template/source file. The template renders whatever sections a given `project.json` has data for and skips the rest.

### `project.json` schema

Only include fields you have real data for. Omit anything you don't — the page will skip that section rather than showing it empty.

```jsonc
{
  "slug": "project-slug",
  "name": "Project Name",
  "codename": "",                  // optional marketing name/tagline line
  "developer": "Developer Name",
  "location": "Area, Bengaluru",
  "tagline": "",
  "heroImage": "images/hero.webp",
  "coverImage": "images/hero.webp", // used on the homepage card
  "configurations": ["2 BHK", "3 BHK"],
  "unitSizeRange": "1,200 – 2,000 sq.ft",
  "price": "",
  "possession": "",
  "overview": "1-2 paragraph summary, factual, no fabricated claims.",
  "highlights": ["...", "..."],
  "floorPlans": [
    { "tower": "Tower 1", "configuration": "3 BHK", "sbua": "1,800 sq.ft", "image": "images/fp_3bhk.webp" }
  ],
  "masterPlan": "images/masterplan.webp",
  "images": ["images/gallery1.webp", "..."],
  "amenities": ["...", "..."],
  "specifications": [
    { "category": "Flooring", "items": ["...", "..."] }
  ],
  "locationInfo": {
    "summary": "...",
    "nearby": [
      { "category": "Schools", "places": ["School A — 1.2 km", "..."] }
    ]
  },
  "rera": ""
}
```

## Design system

The entire visual language lives in `public/styles.css` — a single, self-contained stylesheet (no Tailwind CDN, no build step, no external CSS dependency, so it keeps working even if a CDN is ever unreachable). Typography is Fraunces (serif, headings) + Inter (sans, body) loaded from Google Fonts, with graceful fallback to system serif/sans if fonts don't load. Colors: warm off-white background, near-black ink text, warm gold accent.

Do not fork the CSS or layout per project — every project intentionally looks identical in structure so the sales team never has to relearn the page.

## What's deliberately **not** in this project

Per the brief, this is a pitching tool, not a platform:

- No CRM, no dashboard, no inventory management system
- No authentication / user accounts
- No payments
- No AI chatbot or recommendation engine
- No backend or database — everything is static HTML generated at build time

## Data accuracy

Every fact on every project page — sizes, configurations, amenities, specifications, RERA numbers — was read directly from that project's official brochure and extracted into `project.json` (or, where a brochure lacked a section entirely, that section is simply absent from the page). Nothing was invented or estimated. A few projects are pre-launch "opportunity" documents rather than full brochures (Brigade Kanakapura Road, Brigade Whitefield-Kadugodi Township) — these intentionally show fewer sections because less information exists yet; as fuller brochures become available, update the corresponding `project.json` and re-run the build.

The original brochure PDFs themselves are kept as a private source archive outside this repository — they are not needed to run, build or deploy the site, since everything useful for pitching has already been extracted into each project's `project.json` and `images/` folder.

## Current projects (15)

| Project | Developer | Location |
|---|---|---|
| Sumadhura Solace | Sumadhura Group | Marathahalli Main Road, Thubarahalli |
| Mahindra Blossom | Mahindra Lifespaces | HopeFarm Junction, Whitefield |
| Prestige Evergreen @ Raintree Park | Prestige Estates | Varthur, Whitefield |
| Prestige Marigold Phase 2 | Prestige Estates | North Bengaluru, off Bellary Road |
| Prestige Pine Forest | Prestige Estates | Pattandur Agrahara, Whitefield |
| Prestige Southern Star | Prestige Estates | Akshayanagar, Bannerghatta Road |
| Brigade Kanakapura Road | Brigade Group | Kanakapura Road |
| Brigade Whitefield-Kadugodi Township | Brigade Group | Whitefield-Kadugodi Main Road |
| Prestige Elm Park | Prestige Estates | Whitefield |
| Prestige Glenbrook | Prestige Estates | Whitefield |
| Brigade Avalon | Brigade Group | Whitefield |
| Sumadhura Capitol Residences | Sumadhura Group | Whitefield, near ITPL |
| Sumadhura Edition | Sumadhura Group | Whitefield |
| Folium by Sumadhura — Phase IV | Sumadhura Group | Whitefield Village |
| Eaton Park | Prestige Estates | The Prestige City, Sarjapur |

---

Built as a static HTML/CSS/JS generator — no framework lock-in, no npm dependency risk, fast by default.
