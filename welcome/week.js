// courses.html, "What would your week look like?" (16 Nov 2026). Pick a period, two courses and a lab skill and see the
// week, with clashes, free time and the hours. Data: window.MSP_COURSES.week, the 2026-27 frame schedules (which two
// half-days each course meets, on which days each lab skill runs), built by tools/build_courses.py. Hours and the shape
// of a week follow the checked bank answer "typical-week". Exposes window.MSP_WEEK.show(code) for the course panel.
(() => {
  const D = window.MSP_COURSES, root = document.getElementById('week');
  if (!D || !D.week || !root) return;
  const W = D.week, C = D.courses, PER = D.periods || {};
  const $ = s => root.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const DAYN = { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday' };
  const HALF = { AM: 'morning', PM: 'afternoon' };
  const title = x => (C[x.code] && C[x.code].title) || x.title;
  const half = d => `${DAYN[d.slice(0, 3)]} ${HALF[d.slice(3)]}`;
  const slotLabel = days => days.map(half).join(' and ');
  const list = a => a.length > 1 ? a.slice(0, -1).join(', ') + ' or ' + a[a.length - 1] : a[0];
  const store = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } } };
  let st = { p: '1', c1: '', c2: '', s: '' };
  const P = () => W[st.p];
  const course = code => P().courses.find(c => c.code === code);
  const skill = code => P().skills.find(s => s.code === code);

  // ---- the year as a strip: teaching periods can be chosen, project periods are explained ----
  function strip() {
    $('#wk-year').innerHTML = [1, 2, 3, 4, 5, 6].map(n => {
      const pr = PER[n] || {}, teach = !!W[n];
      return teach
        ? `<button type="button" data-p="${n}" aria-pressed="${st.p === String(n)}"><b>Period ${n}</b><span>${esc(pr.months || '')}</span></button>`
        : `<div class="proj" title="${esc(pr.long || '')}"><b>Project</b><span>${esc(pr.months || '')}</span></div>`;
    }).join('');
  }

  // ---- the three choices ----
  function selects() {
    const p = P(), groups = {};
    p.courses.forEach(c => (groups[c.slot] = groups[c.slot] || []).push(c));
    const courseOpts = sel => '<option value="">Choose a course</option>' + Object.keys(groups).sort().map(s =>
      `<optgroup label="${esc(slotLabel(groups[s][0].days))}">${groups[s].slice().sort((a, b) => title(a).localeCompare(title(b)))
        .map(c => `<option value="${c.code}"${sel === c.code ? ' selected' : ''}>${esc(title(c))}</option>`).join('')}</optgroup>`).join('');
    $('#wk-c1').innerHTML = courseOpts(st.c1);
    $('#wk-c2').innerHTML = courseOpts(st.c2);
    $('#wk-s').innerHTML = '<option value="">Choose a lab skill</option>' + p.skills.slice().sort((a, b) => title(a).localeCompare(title(b)))
      .map(s => `<option value="${s.code}"${st.s === s.code ? ' selected' : ''}>${esc(title(s))} (${s.days.join('/')})</option>`).join('');
  }

  // ---- the week ----
  function draw() {
    const p = P(), cells = {}, notes = [];
    const chosen = [['c1', course(st.c1)], ['c2', course(st.c2)]].filter(x => x[1]);
    chosen.forEach(([k, c]) => c.days.forEach(d => (cells[d] = cells[d] || []).push({ k, c })));
    const a = course(st.c1), b = course(st.c2), s = skill(st.s);
    if (a && b && a.code === b.code) notes.push(`You chose ${esc(title(a))} twice. Pick a different second course.`);
    else if (a && b && a.slot === b.slot) notes.push(`<b>${esc(title(a))}</b> and <b>${esc(title(b))}</b> meet at the same times (${esc(slotLabel(a.days))}), so you can't take both in one period. Choose another second course.`);
    let sday = null;
    if (s) {
      sday = s.days.find(d => !cells[d + 'AM'] && !cells[d + 'PM']);
      if (!sday) notes.push(`<b>${esc(title(s))}</b> runs on ${esc(list(s.days.map(d => DAYN[d])))}, when you already have classes. Choose another skill or course.`);
    }
    // co-requisites: a chosen course that goes with a skill of this period
    chosen.forEach(([, c]) => c.coreq.forEach(q => { const sk = skill(q);
      if (sk && st.s !== q) notes.push(`${esc(title(c))} is taken together with the lab skill <b>${esc(title(sk))}</b>. <button type="button" class="linkbtn" data-add-skill="${q}">Add it</button>`); }));
    // the grid: header row, then mornings and afternoons; phones get days as rows
    const narrow = matchMedia('(max-width: 700px)').matches, g = $('#wk-grid');
    g.classList.toggle('narrow', narrow);
    const at = (di, hi) => narrow ? `grid-row:${di + 2};grid-column:${hi + 2}` : `grid-row:${hi + 2};grid-column:${di + 2}`;
    const span = (di) => narrow ? `grid-row:${di + 2};grid-column:2 / span 2` : `grid-row:2 / span 2;grid-column:${di + 2}`;
    let html = narrow
      ? '<div class="h" style="grid-row:1;grid-column:2">Morning</div><div class="h" style="grid-row:1;grid-column:3">Afternoon</div>'
      : DAYS.map((d, i) => `<div class="h" style="grid-row:1;grid-column:${i + 2}">${DAYN[d]}</div>`).join('') +
        '<div class="rl" style="grid-row:2;grid-column:1">Morning</div><div class="rl" style="grid-row:3;grid-column:1">Afternoon</div>';
    if (narrow) html += DAYS.map((d, i) => `<div class="rl" style="grid-row:${i + 2};grid-column:1">${DAYN[d].slice(0, 3)}</div>`).join('');
    DAYS.forEach((d, di) => {
      if (sday === d) { html += `<div class="blk s" style="${span(di)}"><b>${esc(title(s))}</b><span>Lab skill, the whole day</span></div>`; return; }
      ['AM', 'PM'].forEach((h, hi) => {
        const here = cells[d + h] || [];
        if (!here.length) html += `<div class="free" style="${at(di, hi)}"><span>Free</span></div>`;
        else if (here.length > 1) html += `<div class="blk clash" style="${at(di, hi)}"><b>Clash</b><span>${here.map(x => esc(title(x.c))).join(' / ')}</span></div>`;
        else html += `<div class="blk ${here[0].k}" style="${at(di, hi)}"><b>${esc(title(here[0].c))}</b><span>Lecture or tutorial</span></div>`;
      });
    });
    g.innerHTML = html;
    // the summary, in the words of the checked bank answer "typical-week"
    const nc = new Set(chosen.map(x => x[1].code)).size, hasS = !!(s && sday);
    let sum;
    if (!nc && !s) sum = 'Choose two courses and a lab skill, or start with one of the examples above.';
    else {
      const parts = [];
      if (nc) parts.push(`each course usually has a 90-minute lecture and two 90-minute tutorials a week, about 4.5 hours`);
      if (hasS) parts.push(`the lab skill is one full day in the lab, roughly 9:00 to 17:00, for five of the seven weeks`);
      sum = parts.join('; ') + '. ' + (nc === 2 && hasS
        ? 'That is about 15 to 16 hours of classes a week. With preparation, reading and group work, count on about 40 hours in total.'
        : 'A normal period has two courses and one lab skill: about 15 to 16 hours of classes, and about 40 hours in total with your own study.');
      sum = sum.charAt(0).toUpperCase() + sum.slice(1) + ' Exams are in the last week of the period.';
    }
    $('#wk-notes').innerHTML = notes.map(n => `<p>${n}</p>`).join('');
    $('#wk-sum').textContent = sum;
    const bundle = (p.bundles || []);
    $('#wk-extra').innerHTML = bundle.length ? `Also in this period: the Island Studies field course on Samos (${bundle.map(x => esc(title(x))).join(', ')}): the modules are taken together, by pre-registration and approval only.` : '';
    // a text version for screen readers
    $('#wk-sr').textContent = DAYS.map(d => `${DAYN[d]}: ` + (sday === d ? `${title(s)}, all day` :
      ['AM', 'PM'].map(h => `${HALF[h]} ${(cells[d + h] || []).map(x => title(x.c)).join(' and ') || 'free'}`).join(', '))).join('. ');
  }

  function render() { strip(); selects(); draw(); }
  function set(next) { st = Object.assign({}, st, next); render(); }

  // ---- examples ----
  const PRESETS = {
    core: () => ({ p: '1', c1: 'CHE1101', c2: 'PHY1101', s: 'PRA1101' }),
    picks: () => {
      const picks = (store.get('msp-course-picks') || '').split(',').filter(Boolean);
      let best = null;
      Object.keys(W).forEach(p => {
        const cs = W[p].courses.filter(c => picks.includes(c.code));
        const pair = [];
        cs.forEach(c => { if (pair.length < 2 && !pair.some(x => x.slot === c.slot)) pair.push(c); });
        const sk = W[p].skills.find(x => picks.includes(x.code));
        const score = pair.length * 2 + (sk ? 1 : 0);
        if (score && (!best || score > best.score)) best = { score, p, pair, sk };
      });
      if (!best) return null;
      return { p: best.p, c1: best.pair[0] ? best.pair[0].code : '', c2: best.pair[1] ? best.pair[1].code : '', s: best.sk ? best.sk.code : '' };
    },
  };

  root.addEventListener('click', e => {
    const yb = e.target.closest('[data-p]');
    if (yb) { set({ p: yb.dataset.p, c1: '', c2: '', s: '' }); return; }
    const pre = e.target.closest('[data-preset]');
    if (pre) {
      const next = PRESETS[pre.dataset.preset]();
      if (next) { set(next); $('#wk-msg').textContent = ''; }
      else $('#wk-msg').textContent = 'None of your picks runs in periods 1, 2, 4 or 5 this year. Star some courses first, or choose below.';
      return;
    }
    const add = e.target.closest('[data-add-skill]');
    if (add) { set({ s: add.dataset.addSkill }); return; }
    if (e.target.closest('[data-clear]')) set({ c1: '', c2: '', s: '' });
  });
  ['c1', 'c2', 's'].forEach(k => $('#wk-' + k).addEventListener('change', e => set({ [k]: e.target.value })));
  matchMedia('(max-width: 700px)').addEventListener('change', draw);
  const pickBtn = $('[data-preset=picks]');
  if (pickBtn && !(store.get('msp-course-picks') || '')) pickBtn.hidden = true;

  // the course panel's "See it in a week": the first period in which this course or skill runs
  window.MSP_WEEK = {
    has: code => Object.keys(W).some(p => W[p].courses.some(c => c.code === code) || W[p].skills.some(s => s.code === code)),
    show(code) {
      const p = Object.keys(W).find(k => W[k].courses.some(c => c.code === code) || W[k].skills.some(s => s.code === code));
      if (!p) return;
      const isSkill = W[p].skills.some(s => s.code === code);
      set(isSkill ? { p, c1: '', c2: '', s: code } : { p, c1: code, c2: '', s: '' });
      root.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    },
  };
  set(PRESETS.core());
})();
