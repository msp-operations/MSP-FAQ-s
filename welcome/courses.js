// courses.html: the core in the middle, eight worlds around it, each opening into its courses (13 Nov 2026).
// Data: window.MSP_COURSES (courses-data.js, built by tools/build_courses.py). State lives in the address (#w=earth&c=BIO2002,
// #picks=...), so the back button, deep links and shared links work. Picks are kept in this browser only (localStorage).
(() => {
  const D = window.MSP_COURSES;
  if (!D) return;
  const C = D.courses, ALL = Object.values(C);
  const $ = id => document.getElementById(id);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
                  set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };

  // ---------- worlds ----------
  const W = {};
  D.worlds.forEach(w => { W[w.id] = Object.assign({ kind: 'crest' }, w); });
  W.core = { id: 'core', kind: 'special', name: D.core.name, intro: D.core.intro, eyebrow: 'Where everyone starts' };
  W.society = { id: 'society', kind: 'special', name: D.society.name, intro: D.society.intro, eyebrow: 'Beyond the lab' };
  W.together = { id: 'together', kind: 'band', name: D.together.name, intro: D.together.intro };
  const CRESTS = D.worlds.slice().sort((a, b) => a.pos - b.pos).map(w => w.id);
  const img = (id, v) => W[id] && W[id].kind === 'crest' ? `assets/crests/${W[id].crest}${v}.webp`
    : (v.includes('cream') ? 'assets/logos/msp-seal-light.png' : 'assets/logos/msp-seal-navy.png');
  const inWorld = id => ALL.filter(c => c.worlds.includes(id));
  const isElective = c => c.kind === 'course' && !c.worlds.includes('core');
  const LONG = { Jan: 'January', Feb: 'February', Mar: 'March', Apr: 'April', May: 'May', Jun: 'June', Jul: 'July', Aug: 'August',
                 Sep: 'September', Oct: 'October', Nov: 'November', Dec: 'December' };
  const when = c => c.periods.map(p => p.months).join(' and ');
  // MSP's own period months (build_courses.py MSP_PERIODS), not the UM-wide dates of the repository
  const whenLong = c => c.periods.map(p => `Period ${p.p} (${p.long || p.months.split('–').map(m => LONG[m] || m).join(' to ')})`).join(', ');
  const TEACH = { 'PBL': 'tutorial groups (Problem-Based Learning)', 'Lecture(s)': 'lectures', 'Skills': 'skills sessions', 'Assignment(s)': 'assignments',
                  'Exercises': 'exercises', 'Work in subgroups': 'work in small groups', 'Research': 'research', 'Presentation(s)': 'presentations',
                  'Labs': 'lab work', 'Working visit(s)': 'working visits', 'Paper(s)': 'papers' };
  const lower = s => s.charAt(0).toLowerCase() + s.slice(1);
  const sentence = arr => { const a = arr.filter(Boolean); if (!a.length) return ''; const t = a.length > 1 ? a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1] : a[0]; return t.charAt(0).toUpperCase() + t.slice(1); };
  const levelName = { 1000: 'introductory', 2000: 'intermediate', 3000: 'advanced' };

  // ---------- picks (this browser only) ----------
  let picks = (store.get('msp-course-picks') || '').split(',').filter(x => C[x] && isElective(C[x]));
  // the codes, plus code + title for the other pages (index.html shows them at the motivation-letter question; site.js)
  const savePicks = () => { store.set('msp-course-picks', picks.join(','));
    store.set('msp-course-picks-titles', JSON.stringify(picks.map(k => [k, C[k].title]))); pill(); };
  function togglePick(code) {
    const i = picks.indexOf(code);
    if (i > -1) picks.splice(i, 1); else picks.push(code);
    savePicks();
    document.querySelectorAll(`[data-star="${code}"]`).forEach(b => { b.setAttribute('aria-pressed', String(i === -1)); b.classList.remove('pop'); void b.offsetWidth; if (i === -1) b.classList.add('pop'); });
    const p = $('pickpill'); p.classList.remove('bump'); void p.offsetWidth; if (i === -1) p.classList.add('bump');
    if (cur.c === code) showCourse(code, true);
    if (cur.picks != null) showPicks(cur.picks, true);
  }
  function pill() {
    $('pickpill').hidden = !picks.length;
    $('pickpill-t').textContent = 'My picks · ' + picks.length;
  }
  const STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8l2.8 6 6.5.7-4.9 4.4 1.4 6.4L12 17l-5.8 3.3 1.4-6.4-4.9-4.4 6.5-.7z"/></svg>';
  const starBtn = c => isElective(c)
    ? `<button class="star" type="button" data-star="${c.code}" aria-pressed="${picks.includes(c.code)}" aria-label="Add ${esc(c.title)} to my picks">${STAR}</button>` : '<span></span>';

  // ---------- the map ----------
  // a quiet sky behind the map: faint stars, always the same (seeded), denser away from the centre
  function stars() {
    const svg = $('stars'); if (!svg) return;
    let s = 20261113; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    let out = '';
    for (let i = 0; i < 150; i++) {
      const x = rnd() * 1440, y = rnd() * 1300, d = Math.hypot((x - 720) / 720, (y - 760) / 600);
      if (d < .45 && rnd() < .7) continue;
      const r = rnd() < .08 ? 1.6 : .5 + rnd() * .8, o = (.12 + rnd() * .38).toFixed(2);
      out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="${rnd() < .2 ? '#BEDDF7' : '#F5EDDD'}" fill-opacity="${o}"/>`;
    }
    svg.innerHTML = out;
    const orbits = document.querySelector('svg.orbits');
    if (orbits && reduced() && orbits.pauseAnimations) orbits.pauseAnimations();
  }

  function buildMap() {
    stars();
    $('n-all').textContent = ALL.filter(c => !c.worlds.includes('core')).length;
    $('hub-list').innerHTML = D.core.codes.filter(k => C[k] && C[k].kind === 'course').map(k => `<li>${esc(C[k].title.replace('Introduction to ', ''))}</li>`).join('');
    $('hub').dataset.world = 'core';
    const stage = $('stage');
    CRESTS.forEach(id => {
      const w = W[id], a = (w.pos * 45 - 45) * Math.PI / 180;
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'crest'; b.dataset.world = id;
      b.style.left = (50 + 39.0 * Math.sin(a)) + '%';
      b.style.top = (48.8 - 35.4 * Math.cos(a)) + '%';
      const n = inWorld(id).length;
      b.innerHTML = `<img src="${img(id, '-cream-md')}" alt="" width="156" height="156"><span class="n">${esc(w.short || w.name)}</span><span class="c">${n} courses &amp; skills</span>`;
      b.setAttribute('aria-label', `${w.name}: ${n} courses and skills. Open this world.`);
      b.addEventListener('mouseenter', () => { const i = new Image(); i.src = img(id, '-cream'); }, { once: true });
      stage.appendChild(b);
    });
    stage.addEventListener('click', e => {
      const b = e.target.closest('[data-world]');
      if (!b) return;
      const r = (b.querySelector('img') || b).getBoundingClientRect();
      origin = { x: r.left + r.width / 2, y: r.top + r.height / 2, r: r.width / 2 };
      go({ w: b.dataset.world });
    });
    // bands under the map
    const soc = inWorld('society').sort(byLevel);
    $('society-intro').textContent = D.society.intro;
    $('society-list').innerHTML = soc.map(c => `<button type="button" data-open="${c.code}">${esc(c.title)}</button>`).join('');
    $('society-list').insertAdjacentHTML('afterend', `<div class="more"><button class="btn ghost" type="button" data-goworld="society">See all ${soc.length} in one place</button></div>`);
    $('together-intro').textContent = D.together.intro;
    $('together-list').innerHTML = D.together.codes.filter(k => C[k]).map(k => `<button type="button" data-open="${k}">${esc(C[k].title)}</button>`).join('')
      + '<span>Bachelor Thesis Research</span>';
    $('yearnote').innerHTML = `These are the courses of the academic year ${esc(D.year.replace('-', '–'))}, from the public UM course catalogue. ` +
      `The courses for September 2027 are published in spring 2027 and can be different. ` +
      `<a href="https://www.maastrichtuniversity.nl/education/bachelor/programmes/maastricht-science-programme/courses-and-curriculum" target="_blank" rel="noopener">The official courses &amp; curriculum page</a>.`;
  }
  const byLevel = (a, b) => a.level - b.level || a.title.localeCompare(b.title);

  // ---------- routing: everything is in the address ----------
  let cur = { w: null, c: null, picks: null }, origin = null, lastFocus = null;
  function parse() {
    const h = new URLSearchParams(location.hash.slice(1));
    return { w: h.get('w'), c: h.get('c'), picks: h.has('picks') ? (h.get('picks') || '') : null };
  }
  function go(s, replace) {
    const p = [];
    if (s.w) p.push('w=' + encodeURIComponent(s.w));
    if (s.c) p.push('c=' + encodeURIComponent(s.c));
    if (s.picks != null) p.push('picks' + (s.picks ? '=' + s.picks : ''));
    const url = p.length ? '#' + p.join('&') : location.pathname + location.search;
    if (replace) history.replaceState(null, '', url); else history.pushState(null, '', url);
    render();
  }
  function render() {
    const s = parse();
    if (s.w && !W[s.w]) s.w = null;
    if (s.w !== cur.w) { if (s.w && W[s.w].kind !== 'band') showWorld(s.w, cur.w); else hideWorld(cur.w); }
    if (s.c !== cur.c || s.picks !== cur.picks) {
      if (s.c && C[s.c]) showCourse(s.c); else if (s.picks != null) showPicks(s.picks); else hideSheet();
    }
    cur = s;
    document.body.classList.toggle('inworld', !!s.w);
  }
  window.addEventListener('popstate', render);
  window.addEventListener('hashchange', render);

  // ---------- a world ----------
  const world = $('world');
  function rowHTML(c, here, i) {
    const others = c.worlds.filter(x => x !== here && x !== 'core' && x !== 'together');
    const also = others.length ? `<span class="also">Also in ${others.map(x => esc(W[x].short || W[x].name)).join(' · ')}</span>` : '';
    return `<li class="row" style="transition-delay:${Math.min(i * 35, 700) + 250}ms">
      <button class="open" type="button" data-open="${c.code}">
        <span class="meta">${c.code} · ${esc(when(c))}${c.kind === 'skill' ? ' · lab skill' : ''}</span>
        <span class="ti">${esc(c.title)}</span>
        <span class="hk">${esc(c.hook)}</span>${also}
      </button>${starBtn(c)}</li>`;
  }
  function section(title, sub, hint, list, here, start) {
    if (!list.length) return '';
    return `<section class="lvl"><div class="lh"><h2>${title}</h2><span>${sub}</span></div>${hint ? `<p class="hint">${hint}</p>` : ''}
      <ol class="rows">${list.map((c, i) => rowHTML(c, here, start + i)).join('')}</ol></section>`;
  }
  function fillWorld(id) {
    const w = W[id], list = inWorld(id);
    const home = c => (c.worlds[0] === id ? 0 : 1);
    const sorted = list.slice().sort((a, b) => a.level - b.level || home(a) - home(b) || a.title.localeCompare(b.title));
    const courses = sorted.filter(c => c.kind === 'course'), skills = sorted.filter(c => c.kind === 'skill');
    const lv = n => courses.filter(c => c.level === n);
    $('w-eyebrow').textContent = w.kind === 'crest' ? `World ${w.pos + 1} of 8` : w.eyebrow;
    $('w-title').textContent = w.name;
    $('w-intro').textContent = w.intro;
    const levels = [...new Set(list.map(c => c.level))].sort();
    $('w-count').textContent = `${courses.length} courses · ${skills.length} lab skills` + (levels.length > 1 ? ` · from ${levels[0]} to ${levels[levels.length - 1]} level` : '');
    const bg = $('w-bg'); bg.src = img(id, '-cream');
    let html = '', n = 0;
    if (id === 'core') {
      html += section('The core courses', 'everyone takes these', 'Together they give every MSP student the same base, whatever you choose afterwards.', courses, id, n); n += courses.length;
    } else {
      const l1 = lv(1000), l2 = lv(2000), l3 = lv(3000);
      html += section('Start here', '1000 · introductory', '', l1, id, n); n += l1.length;
      html += section('Go deeper', '2000 · intermediate', l1.length ? '' : 'No separate introduction here: the core prepares you for these.', l2, id, n); n += l2.length;
      html += section('Advanced', '3000 · advanced', 'These build on earlier courses, so they come later in your degree.', l3, id, n); n += l3.length;
    }
    html += section('In the lab', 'skills · 2.5 credits each', 'Hands-on trainings that run next to the courses.', skills, id, n);
    $('w-body').innerHTML = html;
    // other worlds
    const others = CRESTS.filter(x => x !== id).concat(id === 'core' ? [] : ['core']).concat(id === 'society' ? [] : ['society']);
    $('w-others').innerHTML = others.map(x => `<button type="button" data-goworld="${x}"><img src="${img(x, '-cream-sm')}" alt=""><span>${esc(W[x].short || W[x].name)}</span></button>`).join('');
    $('w-crumbs').innerHTML = CRESTS.map(x => `<button type="button" data-goworld="${x}" aria-label="${esc(W[x].name)}" aria-current="${x === id}" title="${esc(W[x].name)}"><img src="${img(x, '-cream-sm')}" alt=""></button>`).join('');
  }
  function showWorld(id, from) {
    lastFocus = lastFocus || document.activeElement;
    const switching = from && !world.hidden;
    world.classList.remove('in');
    fillWorld(id);
    world.scrollTop = 0;
    document.body.classList.add('locked');
    if (switching) { requestAnimationFrame(() => requestAnimationFrame(() => world.classList.add('in'))); $('w-title').focus({ preventScroll: true }); return; }
    world.hidden = false;
    if (origin && !reduced()) {
      world.classList.remove('fade');
      sweep(origin.x, origin.y, origin.r, true);
    } else {
      world.classList.add('fade'); world.style.clipPath = '';
    }
    requestAnimationFrame(() => requestAnimationFrame(() => world.classList.add('in')));
    origin = null;
    $('w-title').focus({ preventScroll: true });
  }
  // the circle that grows from the crest (open) or shrinks back into it (close), with a thin cream edge running along it
  function sweep(x, y, r, opening) {
    const ring = $('ringedge'), EDGE = 3;
    const small = `circle(${r}px at ${x}px ${y}px)`, big = `circle(150vmax at ${x}px ${y}px)`;
    const smallR = `circle(${r + EDGE}px at ${x}px ${y}px)`, bigR = `circle(calc(150vmax + ${EDGE}px) at ${x}px ${y}px)`;
    ring.hidden = false;
    [world, ring].forEach(el => { el.style.transition = 'none'; });
    world.style.clipPath = opening ? small : big; ring.style.clipPath = opening ? smallR : bigR;
    void world.offsetWidth;
    [world, ring].forEach(el => { el.style.transition = ''; });
    world.style.clipPath = opening ? big : small; ring.style.clipPath = opening ? bigR : smallR;
    clearTimeout(sweep.t); sweep.t = setTimeout(() => { ring.hidden = true; }, 850);
  }
  function hideWorld(from) {
    if (world.hidden) return;
    const el = from && document.querySelector(`#stage [data-world="${from}"]`);
    const done = () => { world.hidden = true; world.classList.remove('in'); world.style.clipPath = ''; document.body.classList.remove('locked');
      const f = el || lastFocus; lastFocus = null; if (f && f.focus) f.focus({ preventScroll: true }); };
    if (el && !reduced() && !world.classList.contains('fade')) {
      const r = (el.querySelector('img') || el).getBoundingClientRect();
      sweep(r.left + r.width / 2, r.top + r.height / 2, r.width / 2, false);
      let ended = false;
      const fin = () => { if (!ended) { ended = true; done(); } };
      world.addEventListener('transitionend', fin, { once: true });
      setTimeout(fin, 900);
    } else done();
  }

  // ---------- the sheet ----------
  const sheet = $('sheet'), scrim = $('scrim');
  function openSheet() {
    if (sheet.hidden) { lastSheetFocus = document.activeElement; sheet.hidden = false; scrim.hidden = false; void sheet.offsetWidth; }
    sheet.classList.add('on'); scrim.classList.add('on'); sheet.scrollTop = 0;
    document.body.classList.add('locked', 'sheet-open');
    const t = $('s-title'); if (t) t.focus({ preventScroll: true });
  }
  let lastSheetFocus = null;
  function hideSheet() {
    if (sheet.hidden) return;
    sheet.classList.remove('on'); scrim.classList.remove('on'); document.body.classList.remove('sheet-open');
    setTimeout(() => { if (!sheet.classList.contains('on')) { sheet.hidden = true; scrim.hidden = true; } }, reduced() ? 0 : 450);
    if (world.hidden) document.body.classList.remove('locked');
    if (lastSheetFocus && lastSheetFocus.focus && document.contains(lastSheetFocus)) lastSheetFocus.focus({ preventScroll: true });
    lastSheetFocus = null;
  }
  // the official requirement text, word for word, with the course codes made clickable ("or", notes and old codes stay as written)
  const linkify = t => esc(t).replace(/\b([A-Z]{3}\d{4})\b/g, k => C[k] ? `<button class="chip" type="button" data-open="${k}" title="${esc(C[k].title)}">${k}</button>` : k);
  const isNone = t => !t || /^none\.?$/i.test(t.trim());
  function showCourse(code, keepScroll) {
    const c = C[code], here = cur.w && c.worlds.includes(cur.w) ? cur.w : c.worlds[0];
    const homeW = W[here];
    $('s-world').innerHTML = homeW && homeW.kind !== 'band' ? `<img src="${img(here, '-sm')}" alt="">${esc(homeW.name)}` : esc(homeW ? homeW.name : '');
    $('s-world').dataset.goworld = homeW && homeW.kind !== 'band' ? here : '';
    const facts = [];
    facts.push(['When', whenLong(c)]);
    facts.push(['Credits', `${String(c.ects).replace('.0', '')} ECTS` + (c.kind === 'skill' ? ' (a lab skill)' : '')]);
    facts.push(['Before you take it', isNone(c.preText) ? 'No prerequisites listed' : linkify(c.preText)]);
    if (!isNone(c.coText)) facts.push(['Taken together with', linkify(c.coText)]);
    if (c.teaching.length) facts.push(['How it\'s taught', esc(sentence(c.teaching.map(t => TEACH[t] || lower(t))))]);
    if (c.assessment.length) facts.push(['How you\'re assessed', esc(sentence(c.assessment.map(lower)))]);
    const obj = c.objectives;
    const ws = c.worlds.filter(x => W[x] && W[x].kind !== 'band');
    const note = c.worlds.includes('core') ? 'Everyone takes this one: it is part of the core.'
      : c.kind === 'skill' ? 'A hands-on lab skill. For your motivation letter, pick elective courses: skills don\'t count there.'
      : c.kind === 'project' ? 'A project, part of every MSP degree.' : '';
    const picked = picks.includes(code);
    $('s-body').innerHTML = `
      <div class="meta">${c.code} · ${c.level} level, ${levelName[c.level]}</div>
      <h2 id="s-title" tabindex="-1">${esc(c.title)}</h2>
      <p class="hook">${esc(c.hook)}</p>
      <div class="facts">${facts.map(f => `<div><span class="k">${f[0]}</span><span>${f[1]}</span></div>`).join('')}</div>
      ${obj.length ? `<h3>What you'll learn</h3><ul class="obj">${obj.slice(0, 5).map(o => `<li>${esc(o)}</li>`).join('')}</ul>
        ${obj.length > 5 ? `<details><summary>All ${obj.length} learning goals</summary><ul class="obj">${obj.slice(5).map(o => `<li>${esc(o)}</li>`).join('')}</ul></details>` : ''}` : ''}
      ${c.description ? `<details><summary>The full course description</summary><p>${esc(c.description)}</p></details>` : ''}
      ${ws.length ? `<h3>Part of</h3><div class="worlds">${ws.map(x => `<button type="button" data-goworld="${x}"><img src="${img(x, '-sm')}" alt="">${esc(W[x].name)}</button>`).join('')}</div>` : ''}
      <div class="act">${isElective(c) ? `<button class="btn${picked ? ' on' : ''}" type="button" data-star="${code}" aria-pressed="${picked}">${picked ? '★ In my picks' : '☆ Add to my picks'}</button>` : ''}
        ${window.MSP_WEEK && window.MSP_WEEK.has(code) ? `<button class="btn ghost" type="button" data-week="${code}">See it in a week</button>` : ''}
        <a class="btn ghost" href="${esc(c.url)}" target="_blank" rel="noopener">Official course page ↗</a></div>
      ${note ? `<p class="note">${note}</p>` : ''}
      <p class="src">From the public UM course catalogue, ${esc(D.year.replace('-', '–'))}. The courses for September 2027 can be different.</p>`;
    if (!keepScroll) openSheet();
  }
  function showPicks(shared, keepScroll) {
    const sharedList = (shared || '').split(',').filter(x => C[x] && isElective(C[x]));
    const isShared = sharedList.length && sharedList.join(',') !== picks.join(',');
    const list = isShared ? sharedList : picks;
    $('s-world').innerHTML = `${STAR.replace('<svg', '<svg style="width:26px;height:26px"')}${isShared ? 'Shared picks' : 'My picks'}`;
    $('s-world').dataset.goworld = '';
    const n = list.length;
    const state = isShared ? '' : n === 0 ? '' : n < 3 ? `${n} so far. The letter asks for 3 to 5.`
      : n <= 5 ? `${n} picks: just right for your letter.` : `${n} picks. The letter asks for 3 to 5, so choose your favourites.`;
    $('s-body').innerHTML = `
      <h2 id="s-title" tabindex="-1">${isShared ? 'Someone shared <b>their picks</b>' : 'My <b>picks</b>'}</h2>
      <p class="hook">${isShared ? 'These are the MSP courses someone picked. Keep them as your own starting point if you like.'
        : 'Your motivation letter asks you to name 3 to 5 elective courses that interest you, and why. Collect them here.'}</p>
      ${n ? `<ul class="picklist">${list.map(k => `<li><button class="t" type="button" data-open="${k}"><b>${esc(C[k].title)}</b><span>${k} · ${esc(W[C[k].worlds[0]].name)}</span></button>
        ${isShared ? '' : `<button class="rm" type="button" data-star="${k}" aria-label="Remove ${esc(C[k].title)}">×</button>`}</li>`).join('')}</ul>`
        : '<p class="note" style="margin-top:22px">No picks yet. Open a world and tap the star next to a course you like.</p>'}
      ${state ? `<p class="pickstate">${state}</p>` : ''}
      ${n ? `<div class="act">${isShared ? '<button class="btn" type="button" id="p-keep">Keep these as my picks</button>'
        : '<button class="btn" type="button" id="p-copy">Copy the list</button><button class="btn ghost" type="button" id="p-share">Copy a link to share</button>'}</div>
        <p class="copied" id="p-msg" aria-live="polite"></p>` : ''}
      <p class="note">Picks are saved in this browser only. Nothing is sent to MSP.</p>`;
    const msg = t => { const m = $('p-msg'); if (m) m.textContent = t; };
    if ($('p-copy')) $('p-copy').onclick = () => copy('My MSP course picks:\n' + picks.map(k => `- ${C[k].title} (${k})`).join('\n'), () => msg('Copied. Paste it into your notes for the letter.'));
    if ($('p-share')) $('p-share').onclick = () => copy(location.href.split('#')[0] + '#picks=' + picks.join(','), () => msg('Link copied. Anyone who opens it sees your picks.'));
    if ($('p-keep')) $('p-keep').onclick = () => { picks = sharedList.slice(); savePicks(); go({ w: cur.w, picks: '' }, true); };
    if (!keepScroll) openSheet();
  }
  function copy(text, ok) {
    const fallback = () => { const t = document.createElement('textarea'); t.value = text; t.style.position = 'fixed'; t.style.opacity = '0'; document.body.appendChild(t); t.select();
      try { document.execCommand('copy'); ok(); } catch (e) {} t.remove(); };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(ok, fallback); else fallback();
  }

  // ---------- one click handler for everything ----------
  document.addEventListener('click', e => {
    const star = e.target.closest('[data-star]');
    if (star) { e.preventDefault(); togglePick(star.dataset.star); return; }
    const wk = e.target.closest('[data-week]');                   // "See it in a week": close the panel and world, then week.js
    if (wk) { const code = wk.dataset.week, wait = world.hidden ? 80 : 950; go({}); setTimeout(() => window.MSP_WEEK && window.MSP_WEEK.show(code), wait); return; }
    const open = e.target.closest('[data-open]');
    if (open) { go({ w: cur.w, c: open.dataset.open }); return; }
    const gw = e.target.closest('[data-goworld]');
    if (gw && gw.dataset.goworld) {
      if (world.hidden) { const m = document.querySelector(`#stage [data-world="${gw.dataset.goworld}"]`); if (m) { const r = (m.querySelector('img') || m).getBoundingClientRect(); origin = { x: r.left + r.width / 2, y: r.top + r.height / 2, r: r.width / 2 }; } }
      go({ w: gw.dataset.goworld });
      return;
    }
  });
  $('w-back').addEventListener('click', () => go({}));
  $('s-close').addEventListener('click', () => go({ w: cur.w }));
  scrim.addEventListener('click', () => go({ w: cur.w }));
  $('pickpill').addEventListener('click', () => go({ w: cur.w, picks: '' }));
  document.addEventListener('keydown', e => {
    const chat = document.querySelector('.chat');                // Mosa's chat (chat.js) handles its own Escape
    if (e.key !== 'Escape' || (chat && !chat.hidden)) return;
    if (!sheet.hidden) go({ w: cur.w }); else if (!world.hidden) go({});
  });

  buildMap();
  if (picks.length) savePicks(); else pill();                      // keeps the titles for the other pages up to date
  render();
})();
