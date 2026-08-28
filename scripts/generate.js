const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PROJECTS_DIR = path.join(ROOT, 'projects');
const DIST = path.join(ROOT, 'dist');

function loadProjects() {
  const slugs = fs.readdirSync(PROJECTS_DIR).filter(f =>
    fs.statSync(path.join(PROJECTS_DIR, f)).isDirectory()
  );
  return slugs.map(slug => {
    const jsonPath = path.join(PROJECTS_DIR, slug, 'project.json');
    if (!fs.existsSync(jsonPath)) return null;
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    data.slug = data.slug || slug;
    data._dir = slug;
    return data;
  }).filter(Boolean).sort((a, b) => a.name.localeCompare(b.name));
}

function esc(s) {
  if (s === undefined || s === null) return '';
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function layout({ title, description, content, basePath }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description || '')}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,500;9..144,600&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${basePath}styles.css">
</head>
<body>
${content}
${footer()}
${lightboxMarkup()}
<script src="${basePath}main.js"></script>
</body>
</html>`;
}

function header(basePath, active) {
  const link = (href, label, key) => `<a href="${href}" class="${active===key ? 'active' : ''}">${label}</a>`;
  return `
<header class="site-header">
  <div class="wrap row">
    <a href="${basePath}index.html" class="brand">Bengaluru Residences</a>
    <nav class="nav-links">
      ${link(basePath + 'index.html', 'Projects', 'projects')}
    </nav>
    <button id="menuBtn" class="menu-btn" aria-label="Menu">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
    </button>
  </div>
  <div id="mobileMenu" class="mobile-menu">
    <a href="${basePath}index.html">Projects</a>
  </div>
</header>`;
}

function footer() {
  return `
<footer class="site-footer">
  <div class="wrap row">
    <p class="brand">Bengaluru Residences</p>
    <p class="note">A curated project library for sales presentation purposes. Details extracted from official project brochures.</p>
  </div>
</footer>`;
}

function lightboxMarkup() {
  return `
<div id="lightbox" class="lightbox">
  <button id="lightboxClose" class="lightbox-close">&times;</button>
  <img id="lightboxImg" src="" alt="" />
</div>`;
}

function projectCard(p, basePath) {
  const meta = [p.developer, p.location].filter(Boolean).join(' · ');
  const configs = (p.configurations || []).join(', ');
  return `
<a href="${basePath}projects/${p.slug}/index.html" class="card">
  <div class="card-img">
    <img src="${basePath}projects/${p.slug}/${p.coverImage || p.heroImage}" loading="lazy" alt="${esc(p.name)}" />
  </div>
  <div class="card-body">
    <h3>${esc(p.name)}</h3>
    <p class="card-meta">${esc(meta)}</p>
    <div class="card-foot">
      <p class="card-config">${esc(configs)}</p>
      ${p.price ? `<p>${esc(p.price)}</p>` : ''}
    </div>
  </div>
</a>`;
}

function homePage(projects) {
  const basePath = './';
  const content = `
${header(basePath, 'projects')}
<section class="wrap home-hero">
  <p class="eyebrow">Bengaluru · Curated Project Library</p>
  <h1>Everything you need to pitch, in one place.</h1>
  <p class="sub">A clean library of our live Bengaluru projects — overview, configurations, floor plans, amenities and location, ready for the next customer meeting.</p>
</section>
<section class="wrap">
  <div class="search-row">
    <input id="searchInput" type="text" placeholder="Search by project, developer or location..." class="search-input" />
  </div>
  <div id="projectGrid" class="project-grid">
    ${projects.map(p => `<div class="project-item" data-search="${esc((p.name+' '+p.developer+' '+p.location).toLowerCase())}">${projectCard(p, basePath)}</div>`).join('\n')}
  </div>
  <p id="noResults" class="no-results">No projects match your search.</p>
</section>`;
  return layout({ title: 'Bengaluru Residences — Project Library', description: 'Curated Bengaluru real-estate project library for sales presentations.', content, basePath });
}

function section(id, title, innerHtml) {
  if (!innerHtml) return '';
  return `
<section id="${id}" class="pd-section">
  <div class="wrap">
    <h2>${esc(title)}</h2>
    ${innerHtml}
  </div>
</section>`;
}

function galleryGrid(images, basePath, slug) {
  if (!images || !images.length) return '';
  return `<div class="gallery-grid">
    ${images.map(img => `<button class="lightbox-trigger gallery-item" data-src="${basePath}projects/${slug}/${img}">
      <img src="${basePath}projects/${slug}/${img}" loading="lazy" alt="Project image" />
    </button>`).join('\n')}
  </div>`;
}

function projectPage(p, basePath) {
  const nav = [
    ['overview', 'Overview'],
    p.highlights && p.highlights.length ? ['highlights', 'Highlights'] : null,
    ['configurations', 'Configurations'],
    p.floorPlans && p.floorPlans.length ? ['floorplans', 'Floor Plans'] : null,
    p.masterPlan ? ['masterplan', 'Master Plan'] : null,
    p.images && p.images.length ? ['gallery', 'Gallery'] : null,
    p.amenities && p.amenities.length ? ['amenities', 'Amenities'] : null,
    p.specifications && p.specifications.length ? ['specifications', 'Specifications'] : null,
    p.locationInfo ? ['location', 'Location'] : null,
  ].filter(Boolean);

  const stickyNav = `
<div class="subnav no-scrollbar">
  <div class="wrap row">
    ${nav.map(([id, label]) => `<a href="#${id}">${label}</a>`).join('')}
  </div>
</div>`;

  const hero = `
<section class="wrap p-hero">
  <div class="p-hero-grid">
    <div>
      <p class="eyebrow">${esc(p.developer || '')}</p>
      <h1>${esc(p.name)}</h1>
      ${p.codename ? `<p class="p-codename">${esc(p.codename)}</p>` : ''}
      ${p.tagline ? `<p class="p-tagline">${esc(p.tagline)}</p>` : ''}
      <p class="p-location">${esc(p.location || '')}</p>
      <div class="p-facts">
        ${p.configurations && p.configurations.length ? `<div><p class="p-fact-label">Configurations</p><p class="p-fact-value">${esc(p.configurations.join(', '))}</p></div>` : ''}
        ${p.unitSizeRange ? `<div><p class="p-fact-label">Unit Sizes</p><p class="p-fact-value">${esc(p.unitSizeRange)}</p></div>` : ''}
        ${p.price ? `<div><p class="p-fact-label">Price</p><p class="p-fact-value">${esc(p.price)}</p></div>` : ''}
        ${p.possession ? `<div><p class="p-fact-label">Possession</p><p class="p-fact-value">${esc(p.possession)}</p></div>` : ''}
      </div>
      <div class="p-cta">
        ${p.floorPlans && p.floorPlans.length ? `<a href="#floorplans" class="btn btn-dark">View Floor Plans</a>` : ''}
      </div>
    </div>
    <div class="p-hero-img">
      <img src="${basePath}projects/${p.slug}/${p.heroImage}" alt="${esc(p.name)}" />
    </div>
  </div>
</section>`;

  const overview = section('overview', 'Overview', p.overview ? `<p class="prose">${esc(p.overview)}</p>` : '');

  const highlights = section('highlights', 'Highlights', (p.highlights && p.highlights.length) ? `
  <ul class="highlight-grid">
    ${p.highlights.map(h => `<li class="highlight-item"><span class="dash">—</span><span>${esc(h)}</span></li>`).join('')}
  </ul>` : '');

  const configurations = section('configurations', 'Configurations', `
  <div class="pill-row">
    ${(p.configurations || []).map(c => `<span class="pill">${esc(c)}</span>`).join('')}
  </div>
  ${p.unitSizeRange ? `<p class="prose" style="margin-top:16px">Unit sizes: ${esc(p.unitSizeRange)}</p>` : ''}`);

  const floorplans = section('floorplans', 'Floor Plans', (p.floorPlans && p.floorPlans.length) ? `
  <div class="fp-grid">
    ${p.floorPlans.map(fp => `
    <div>
      <div class="fp-head">
        <h3>${esc(fp.configuration)}</h3>
        <span class="fp-tower">${esc(fp.tower || '')}</span>
      </div>
      ${fp.sbua ? `<p class="fp-size">${esc(fp.sbua)} SBUA</p>` : ''}
      <button class="lightbox-trigger fp-img-btn" data-src="${basePath}projects/${p.slug}/${fp.image}">
        <img src="${basePath}projects/${p.slug}/${fp.image}" loading="lazy" alt="${esc(fp.configuration)} floor plan" />
      </button>
    </div>`).join('')}
  </div>` : '');

  const masterplan = section('masterplan', 'Master Plan', p.masterPlan ? `
  <button class="lightbox-trigger mp-btn" data-src="${basePath}projects/${p.slug}/${p.masterPlan}">
    <img src="${basePath}projects/${p.slug}/${p.masterPlan}" loading="lazy" alt="Master plan" />
  </button>` : '');

  const gallery = section('gallery', 'Project Images', galleryGrid(p.images, basePath, p.slug));

  const amenities = section('amenities', 'Amenities', (p.amenities && p.amenities.length) ? `
  <ul class="amenity-grid">
    ${p.amenities.map(a => `<li class="amenity-item"><span class="dot">•</span>${esc(a)}</li>`).join('')}
  </ul>` : '');

  const specifications = section('specifications', 'Specifications', (p.specifications && p.specifications.length) ? `
  <div class="spec-grid">
    ${p.specifications.map(s => `
    <div class="spec-cat">
      <h3>${esc(s.category)}</h3>
      <ul>
        ${s.items.map(i => `<li><span class="dot">·</span><span>${esc(i)}</span></li>`).join('')}
      </ul>
    </div>`).join('')}
  </div>` : '');

  let locationHtml = '';
  if (p.locationInfo) {
    const nearbyHtml = (p.locationInfo.nearby || []).map(n => `
      <div class="loc-cat">
        <h3>${esc(n.category)}</h3>
        <ul>
          ${n.places.map(pl => `<li>${esc(pl)}</li>`).join('')}
        </ul>
      </div>`).join('');
    locationHtml = `
    ${p.locationInfo.summary ? `<p class="loc-summary">${esc(p.locationInfo.summary)}</p>` : ''}
    <div class="loc-grid">${nearbyHtml}</div>`;
  }
  const location = section('location', 'Location', locationHtml);

  const rera = p.rera ? section('rera', 'RERA / Legal', `<p class="prose">${esc(p.rera)}</p>`) : '';

  const content = `
${header(basePath, 'projects')}
${stickyNav}
${hero}
${overview}
${highlights}
${configurations}
${floorplans}
${masterplan}
${gallery}
${amenities}
${specifications}
${location}
${rera}`;

  return layout({
    title: `${p.name} — ${p.developer || ''}`,
    description: p.overview || p.tagline || '',
    content,
    basePath
  });
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

function build() {
  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });

  const projects = loadProjects();

  // homepage
  fs.writeFileSync(path.join(DIST, 'index.html'), homePage(projects));

  // static assets
  fs.copyFileSync(path.join(ROOT, 'public', 'styles.css'), path.join(DIST, 'styles.css'));
  fs.copyFileSync(path.join(ROOT, 'public', 'main.js'), path.join(DIST, 'main.js'));

  // project pages + assets
  for (const p of projects) {
    const outDir = path.join(DIST, 'projects', p.slug);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'index.html'), projectPage(p, '../../'));
    // copy project assets (images, etc.) except project.json
    const srcDir = path.join(PROJECTS_DIR, p._dir);
    for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
      if (entry.name === 'project.json') continue;
      const s = path.join(srcDir, entry.name);
      const d = path.join(outDir, entry.name);
      if (entry.isDirectory()) copyDir(s, d);
      else fs.copyFileSync(s, d);
    }
  }

  console.log(`Built ${projects.length} project page(s) -> ${DIST}`);
}

build();
