// Welcome to MSP: shared behaviour of every page (13 Nov 2026): the Menu button on phones, and "your picks" from the
// course page wherever a page has a [data-mypicks] box (index.html, at the motivation-letter question).
(() => {
  // the electives starred on courses.html (kept in this browser only; courses.js writes msp-course-picks-titles)
  const box = document.querySelector('[data-mypicks]');
  if (box) {
    let picks = [];
    try { picks = JSON.parse(localStorage.getItem('msp-course-picks-titles') || '[]'); } catch (e) { picks = []; }
    if (Array.isArray(picks) && picks.length) {
      const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
      const n = picks.length;
      box.innerHTML = `<p class="mp-h">Your picks so far <span>(${n}${n < 3 ? ', the letter asks for 3 to 5' : n > 5 ? ', the letter asks for 3 to 5' : ''})</span></p>
        <ul>${picks.map(p => `<li><a href="courses.html#c=${encodeURIComponent(p[0])}">${esc(p[1])}</a> <span>${esc(p[0])}</span></li>`).join('')}</ul>
        <p class="mp-f"><a href="courses.html#picks">Change or copy your picks</a></p>`;
      box.hidden = false;
    }
  }
})();

(() => {
  const head = document.querySelector('.site-head');
  if (!head) return;
  const btn = head.querySelector('.menu-btn'), nav = head.querySelector('nav');
  if (!btn || !nav) return;
  const set = open => {
    head.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.lastChild.textContent = open ? 'Close' : 'Menu';
  };
  btn.addEventListener('click', () => {
    const open = !head.classList.contains('open');
    set(open);
    if (open) { const first = nav.querySelector('a'); if (first) first.focus(); }
  });
  // close on Escape, on a click outside, and after choosing a link (also a link to a part of the same page)
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && head.classList.contains('open')) { set(false); btn.focus(); } });
  document.addEventListener('click', e => { if (head.classList.contains('open') && !head.contains(e.target)) set(false); });
  nav.addEventListener('click', e => { if (e.target.closest('a')) set(false); });
  window.addEventListener('resize', () => { if (window.innerWidth > 900 && head.classList.contains('open')) set(false); });
})();

// back to top: appears after scrolling down a screen or so
(() => {
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'to-top'; b.setAttribute('aria-label', 'Back to the top of the page'); b.title = 'Back to top'; b.textContent = '↑';
  document.body.appendChild(b);
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const onScroll = () => b.classList.toggle('show', window.scrollY > 700);
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  b.addEventListener('click', () => { window.scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' }); const h = document.querySelector('.site-head a.home'); if (h) h.focus({ preventScroll: true }); });
})();
