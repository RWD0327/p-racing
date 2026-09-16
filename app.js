const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu() {
  navigation.classList.remove('is-open');
  menuButton.setAttribute('aria-expanded', 'false');
}
menuButton.addEventListener('click', () => {
  const isOpen = navigation.classList.toggle('is-open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navigation.classList.contains('is-open')) {
    closeMenu();
    menuButton.focus();
  }
});
window.matchMedia('(min-width: 681px)').addEventListener('change', closeMenu);
document.querySelector('#year').textContent = new Date().getFullYear();

// One continuous wheel gesture moves exactly one full-screen section.
const desktop = matchMedia('(min-width: 681px) and (hover: hover) and (pointer: fine)');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const main = document.querySelector('#main');
const panels = [...main.querySelectorAll(':scope > section')];
let activePanel = 0;
let moving = false;
let gestureUsed = false;
let wheelTotal = 0;
let gestureTimer;
let animation;
function showPanel(index, animate = true) {
  const previousPanel = activePanel;
  activePanel = Math.max(0, Math.min(panels.length - 1, index));
  if (previousPanel !== activePanel) panels[activePanel].scrollTop = 0;
  cancelAnimationFrame(animation);
  const start = main.scrollTop;
  const target = panels[activePanel].offsetTop;
  const duration = animate && !reducedMotion.matches ? 650 : 0;
  const started = performance.now();
  moving = duration > 0;
  if (!duration) { main.scrollTop = target; return; }
  function frame(now) {
    const progress = Math.min(1, (now - started) / duration);
    main.scrollTop = start + (target - start) * (1 - Math.pow(1 - progress, 4));
    if (progress < 1) animation = requestAnimationFrame(frame);
    else { main.scrollTop = target; moving = false; }
  }
  animation = requestAnimationFrame(frame);
}
main.addEventListener('wheel', event => {
  if (!desktop.matches || event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY) || !event.deltaY) return;
  clearTimeout(gestureTimer);
  gestureTimer = setTimeout(() => { gestureUsed = false; wheelTotal = 0; }, 180);
  if (moving || gestureUsed) { event.preventDefault(); return; }
  const panel = panels[activePanel];
  const direction = Math.sign(event.deltaY);
  const hasMoreContent = direction > 0 ? panel.scrollTop + panel.clientHeight < panel.scrollHeight - 2 : panel.scrollTop > 2;
  // Preserve access to overflowing content at short heights or high text zoom.
  if (hasMoreContent) { wheelTotal = 0; return; }
  event.preventDefault();
  const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? main.clientHeight : 1);
  if (Math.sign(wheelTotal) !== direction) wheelTotal = 0;
  wheelTotal += delta;
  if (Math.abs(wheelTotal) < 12) return;
  gestureUsed = true;
  showPanel(activePanel + direction);
}, { passive: false });
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', event => {
    if (!desktop.matches) return;
    const target = link.getAttribute('href').slice(1);
    const index = target === 'main' ? 0 : panels.findIndex(panel => panel.id === target);
    if (index < 0) return;
    event.preventDefault();
    history.replaceState(null, '', `#${panels[index].id}`);
    showPanel(index);
    panels[index].setAttribute('tabindex', '-1');
    panels[index].focus({ preventScroll: true });
  });
});
document.addEventListener('keydown', event => {
  if (!desktop.matches || event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.target.closest('button, input, textarea, select, a, [contenteditable="true"]')) return;
  const direction = ['ArrowDown', 'PageDown'].includes(event.key) || (event.key === ' ' && !event.shiftKey) ? 1
    : ['ArrowUp', 'PageUp'].includes(event.key) || (event.key === ' ' && event.shiftKey) ? -1 : 0;
  if (!direction && !['Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  if (moving) return;
  const panel = panels[activePanel];
  if (direction && (direction > 0 ? panel.scrollTop + panel.clientHeight < panel.scrollHeight - 2 : panel.scrollTop > 2)) {
    panel.scrollBy({ top: direction * panel.clientHeight * .7, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    return;
  }
  showPanel(event.key === 'Home' ? 0 : event.key === 'End' ? panels.length - 1 : activePanel + direction);
});
function alignPanel() {
  if (desktop.matches) showPanel(activePanel, false);
  else { cancelAnimationFrame(animation); moving = false; main.scrollTop = 0; }
}
window.addEventListener('resize', alignPanel);
main.addEventListener('focusin', event => {
  if (!desktop.matches) return;
  const index = panels.findIndex(panel => panel.contains(event.target));
  if (index >= 0 && index !== activePanel) showPanel(index, false);
});
desktop.addEventListener('change', alignPanel);
window.addEventListener('hashchange', () => {
  const index = panels.findIndex(panel => `#${panel.id}` === location.hash);
  if (index >= 0 && desktop.matches) showPanel(index);
});
const initialPanel = panels.findIndex(panel => `#${panel.id}` === location.hash);
if (initialPanel >= 0) activePanel = initialPanel;
alignPanel();
document.fonts.ready.then(alignPanel);
