const pages = window.COMIC_PAGES || [];
const container = document.querySelector('#pages');
const picker = document.querySelector('#page-select');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
let active = 0;
let zoom = 1;

document.querySelector('#collection-note').textContent = window.COMIC_NOTE || `${pages.length} ภาพ · ภาษาไทย`;

pages.forEach((page, index) => {
  picker.append(new Option(`ภาพ ${index + 1} / ${pages.length} · ${page.filename}`, index));
  const button = document.createElement('button');
  button.className = 'thumbnail';
  button.type = 'button';
  button.setAttribute('aria-label', `ไปภาพ ${index + 1}: ${page.filename}`);
  const thumb = document.createElement('img');
  thumb.src = page.src;
  thumb.alt = '';
  thumb.loading = 'lazy';
  const number = document.createElement('span');
  number.textContent = String(index + 1);
  button.append(thumb, number);
  button.onclick = () => go(index);
  document.querySelector('#thumbnails').append(button);

  const figure = document.createElement('figure');
  figure.id = `comic-${index + 1}`;
  figure.dataset.index = index;
  const image = document.createElement('img');
  image.src = page.src;
  image.alt = `การ์ตูนเรื่องการออกกำลังกายและฮอร์โมน ภาพที่ ${index + 1} (${page.filename})`;
  image.width = page.width;
  image.height = page.height;
  image.loading = index === 0 ? 'eager' : 'lazy';
  image.decoding = 'async';
  const caption = document.createElement('figcaption');
  const label = document.createElement('span');
  label.textContent = `ภาพ ${index + 1} / ${pages.length}`;
  const filename = document.createElement('span');
  filename.className = 'file-name';
  filename.textContent = page.filename;
  caption.append(label, filename);
  figure.append(image, caption);
  container.append(figure);
});

function update(index) {
  active = Math.max(0, Math.min(pages.length - 1, index));
  picker.value = active;
  document.querySelector('#reading-progress').textContent = `${active + 1} / ${pages.length}`;
  document.querySelectorAll('.thumbnail').forEach((button, i) => {
    if (i === active) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
  for (const id of ['previous', 'bottom-previous']) document.getElementById(id).disabled = active === 0;
  for (const id of ['next', 'bottom-next']) document.getElementById(id).disabled = active === pages.length - 1;
}

function go(index, instant = false) {
  update(index);
  const figure = document.getElementById(`comic-${active + 1}`);
  figure?.scrollIntoView({ behavior: instant || reduced ? 'instant' : 'smooth', block: 'start' });
  try { history.replaceState(null, '', `#page-${active + 1}`); } catch { /* file:// may restrict history */ }
}

picker.onchange = () => go(+picker.value);
for (const id of ['previous', 'bottom-previous']) document.getElementById(id).onclick = () => go(active - 1);
for (const id of ['next', 'bottom-next']) document.getElementById(id).onclick = () => go(active + 1);

function setZoom(value) {
  zoom = Math.max(1, Math.min(2.5, value));
  document.documentElement.style.setProperty('--reader-offset', (document.querySelector('.reader-tools').offsetHeight + 16) + 'px');
  const base = Math.min(880, document.querySelector('#reading-stage').clientWidth);
  container.classList.toggle('zoomed', zoom > 1);
  container.style.setProperty('--reading-width', base * zoom + 'px');
  document.querySelector('#fit').textContent = zoom === 1 ? 'พอดีจอ' : Math.round(zoom * 100) + '%';
  document.querySelector('#zoom-out').disabled = zoom === 1;
  document.querySelector('#zoom-in').disabled = zoom === 2.5;
}

document.querySelector('#zoom-out').onclick = () => setZoom(zoom - .25);
document.querySelector('#zoom-in').onclick = () => setZoom(zoom + .25);
document.querySelector('#fit').onclick = () => setZoom(1);
const fullButton = document.querySelector('#fullscreen');
fullButton.hidden = !document.fullscreenEnabled;
fullButton.onclick = async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch { /* The reader remains usable if fullscreen is declined. */ }
};
document.addEventListener('fullscreenchange', () => {
  fullButton.textContent = document.fullscreenElement ? 'ออกเต็มจอ' : 'เต็มจอ';
  fullButton.setAttribute('aria-pressed', String(!!document.fullscreenElement));
});

document.addEventListener('keydown', event => {
  if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName) || event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.key === 'ArrowRight') { event.preventDefault(); go(active + 1); }
  if (event.key === 'ArrowLeft') { event.preventDefault(); go(active - 1); }
  if (event.key === '+') setZoom(zoom + .25);
  if (event.key === '-') setZoom(zoom - .25);
});

let ticking = false;
function track() {
  ticking = false;
  const top = document.querySelector('.reader-tools').offsetHeight + 30;
  let index = 0;
  for (const figure of container.children) {
    if (figure.getBoundingClientRect().top <= top) index = +figure.dataset.index;
    else break;
  }
  update(index);
}
document.addEventListener('scroll', () => {
  if (!ticking) { ticking = true; requestAnimationFrame(track); }
}, { passive: true });
addEventListener('resize', () => setZoom(zoom));
update(0);
setZoom(1);
function openHash() {
  const fromHash = location.hash.match(/^#page-(\d+)$/);
  if (fromHash) requestAnimationFrame(() => go(+fromHash[1] - 1, true));
}
addEventListener('hashchange', openHash);
openHash();
