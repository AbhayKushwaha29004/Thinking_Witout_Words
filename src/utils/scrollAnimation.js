/**
 * Scroll-based animation utilities
 */

export function initScrollAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
  );

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
  return observer;
}

export function updateScrollProgress() {
  const bar = document.querySelector('.scroll-progress');
  if (!bar) return;
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? scrollTop / docHeight : 0;
  bar.style.width = `${progress * 100}%`;
}

export function getActiveSection(sectionIds) {
  const scrollY = window.scrollY + window.innerHeight / 3;
  let active = sectionIds[0];
  for (const id of sectionIds) {
    const el = document.getElementById(id);
    if (el && el.offsetTop <= scrollY) active = id;
  }
  return active;
}
