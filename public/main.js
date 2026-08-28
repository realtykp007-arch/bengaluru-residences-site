// Mobile menu toggle
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');
if (menuBtn && mobileMenu) {
  menuBtn.addEventListener('click', () => mobileMenu.classList.toggle('open'));
}

// Search filter (homepage)
const searchInput = document.getElementById('searchInput');
if (searchInput) {
  const items = Array.from(document.querySelectorAll('.project-item'));
  const noResults = document.getElementById('noResults');
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    let visible = 0;
    items.forEach(item => {
      const match = item.dataset.search.includes(q);
      item.style.display = match ? '' : 'none';
      if (match) visible++;
    });
    if (noResults) noResults.style.display = visible === 0 ? 'block' : 'none';
  });
}

// Lightbox with zoom
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');

function openLightbox(src) {
  lightboxImg.src = src;
  lightboxImg.style.transform = 'scale(1)';
  lightboxImg.dataset.zoomed = 'false';
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}
document.querySelectorAll('.lightbox-trigger').forEach(el => {
  el.addEventListener('click', (e) => {
    e.preventDefault();
    openLightbox(el.dataset.src);
  });
});
if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
if (lightbox) {
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  lightboxImg.addEventListener('click', () => {
    const zoomed = lightboxImg.dataset.zoomed === 'true';
    lightboxImg.style.transform = zoomed ? 'scale(1)' : 'scale(2)';
    lightboxImg.style.cursor = zoomed ? 'zoom-in' : 'zoom-out';
    lightboxImg.dataset.zoomed = zoomed ? 'false' : 'true';
  });
}
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
});
