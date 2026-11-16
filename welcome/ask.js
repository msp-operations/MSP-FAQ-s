/* "Ask us a question": search over the question bank (questions.js, built from questions.md by tools/build_questions.py).
   Runs entirely in the browser with MiniSearch (assets/vendor). Nothing typed here is sent or stored anywhere; only the
   "Ask the admissions office" button opens the visitor's own mail program with the question filled in. */
(function () {
  var DATA = window.MSP_QUESTIONS, MS = window.MiniSearch;
  if (!DATA || !MS) return;                                    // no data: the page keeps its four static questions
  var MAIL = 'msp-admissions@maastrichtuniversity.nl';
  var $ = function (id) { return document.getElementById(id); };
  var box = $('askbox'), input = $('ask'), res = $('ask-results'), head = $('ask-head'), more = $('ask-more'), mail = $('ask-mail'),
      stat = $('faq-static'), tops = $('ask-topics');
  var STOP = ('a an the i im me my mine we our you your is are am was be been do does did can could would should will shall may might ' +
    'to of for in on at by with about from and or if it its this that there whats please hello hi dear ' +   // question words (what, which, who, how, when, where, why) kept: in short questions they carry the meaning
    'msp maastricht science programme program question questions here help want like also just still then hey thanks thank thx ok okay ' +
    'ik je jij jou jouw mijn me mij we wij ons onze de het een en of is kan kun ben bent heb hebt heeft moet moeten mag wil zijn was ' +
    'wat dat die dit deze er nog al ook voor van met op aan bij naar om te tot uit dan maar als ' +
    'ich du mein meine meinen mir mich wir der die das den dem ein eine einen und oder ist sind bin habe hast hat kann muss darf will ' +
    'zu im am an auf mit für von bei nach noch auch es le la les et un une je mon ma mes est').split(' ');   // question words (wanneer, wann ...) stay: in short Dutch/German questions they carry the meaning
  var stop = {}; STOP.forEach(function (w) { stop[w] = 1; });
  /* everyday words → the words the answers use (added to the question before searching; both the box and the chat) */
  var SYN = {
    qualification: 'admission requirements', qualifications: 'admission requirements', qualify: 'admission requirements',
    eligible: 'admission requirements', eligibility: 'admission requirements', entry: 'admission requirements',
    prerequisite: 'admission requirements', prerequisites: 'admission requirements', toelatingseisen: 'admission requirements',
    voraussetzungen: 'admission requirements', zulassung: 'admission requirements',
    job: 'career jobs', jobs: 'career', work: 'career jobs', working: 'career', employer: 'career employers', employers: 'career', salary: 'career jobs',
    uni: 'university', unis: 'universities', college: 'university', masters: 'master', msc: 'master', grad: 'master', graduate: 'alumni graduates',
    hard: 'difficult workload', tough: 'difficult workload', difficult: 'workload', heavy: 'workload', busy: 'workload', stressful: 'workload stress',
    cost: 'tuition fee', costs: 'tuition fee', price: 'tuition fee', expensive: 'tuition fee', cheap: 'tuition fee', pay: 'tuition payment', money: 'tuition finance',
    flat: 'housing room', apartment: 'housing room', accommodation: 'housing', dorm: 'housing room',
    doctor: 'GP huisarts', huisarts: 'GP', med: 'medicine',          // 'become a doctor' / 'medical school' → medicine: see PHRASE_SYN
    worth: 'good quality', rank: 'ranking', ranked: 'ranking', reputation: 'quality ranking',
    fun: 'student life', party: 'student life', friends: 'student life', social: 'student life',
    exam: 'test', exams: 'test', test: 'exam', interview: 'interview selection',
    late: 'deadline passed', missed: 'deadline missed', due: 'deadline', deadlines: 'deadline',
    phd: 'phd doctorate research', research: 'research phd',
    english: 'english language', ielts: 'english language test', toefl: 'english language test'
  };
  /* phrases that must not be read word by word: "how does it work" is not about jobs; "become a doctor" is about medicine */
  var NOT_SYN = /\b(how (does|do|will) (it|that|this|the \w+) work|how it works|hoe werkt (het|dat|dit)|wie funktioniert (das|es|dies))\b/gi;
  var PHRASE_SYN = [[/\b(become a doctor|medical school|study medicine|med school|geneeskunde|medizin)\b/i, 'medicine']];
  var expand = function (q) {
    var extra = [], base = q.replace(NOT_SYN, ' ');
    base.toLowerCase().split(/[^a-zÀ-ɏ]+/).forEach(function (w) { if (SYN[w]) extra.push(SYN[w]); });
    PHRASE_SYN.forEach(function (p) { if (p[0].test(q)) extra.push(p[1]); });
    return extra.length ? q + ' ' + extra.join(' ') : q;
  };
  var norm = function (s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); };
  /* light English stemming, so "qualifications" finds "qualification" and "applying" finds "apply" */
  var stem = function (t) {
    if (t.length <= 4) return t;
    if (/ies$/.test(t) || /ied$/.test(t)) return t.slice(0, -3) + 'y';
    if (/(ss|x|ch|sh)es$/.test(t)) return t.slice(0, -2);
    if (/ing$/.test(t) && t.length > 6) return t.slice(0, -3);
    if (/ed$/.test(t) && t.length > 5 && !/eed$/.test(t)) return t.slice(0, -2);
    if (/s$/.test(t) && !/(ss|us|is|ys)$/.test(t)) return t.slice(0, -1);
    return t;
  };
  var term = function (t) { t = norm(t); return t.length < 2 || stop[t] ? null : stem(t); };
  /* one search entry per question (its wording, other words, topic and answer), plus one per training phrase
     (other ways people ask it, in several languages: questions.md "say:" lines / tools/training-phrases.json) */
  var docs = [];
  DATA.items.forEach(function (i) {
    docs.push({ id: i.id, item: i.id, q: i.q, also: i.also, text: i.text, topic: i.topic, p: '' });
    (i.phr || []).forEach(function (p, k) { docs.push({ id: i.id + '#' + k, item: i.id, p: p }); });
  });
  var ms = new MS({ fields: ['q', 'also', 'p', 'topic', 'text'], storeFields: ['item'], processTerm: term });
  ms.addAll(docs);
  var byId = {}; DATA.items.forEach(function (i) { byId[i.id] = i; });
  /* rare words (13 Nov 2026): a word that only a few questions use (UAF, BSA, UMcard, colloquium) says more than "where"
     or "help"; questions that contain the visitor's rare words get a boost (W.rare per word; rare = in at most W.rdf questions) */
  var own = {}, df = {}, tok = MS.getDefault('tokenize');
  DATA.items.forEach(function (i) {
    var t = own[i.id] = {};
    tok([i.q, i.also].concat(i.phr || []).join(' ')).map(term).filter(Boolean).forEach(function (w) { if (!t[w]) { t[w] = 1; df[w] = (df[w] || 0) + 1; } });
  });

  var esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); };
  var mailto = function (q) {
    var body = 'Dear admissions office,\n\nMy question: ' + (q || '') + '\n\n(If I have already applied, my application number is: )\n';
    return 'mailto:' + MAIL + '?subject=' + encodeURIComponent('Question about applying to MSP') + '&body=' + encodeURIComponent(body);
  };
  var day = function (d) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d || ''); if (!m) return '';
    return (+m[3]) + ' ' + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][+m[2] - 1] + ' ' + m[1];
  };
  var source = function (s) {
    if (!s) return '';
    return s.split(/\s*;\s*/).map(function (part) {
      var p = part.split(/\s*\|\s*/), label = esc(p[0]);
      return p[1] && /^https?:/.test(p[1]) ? '<a href="' + esc(p[1]) + '" target="_blank" rel="noopener">' + label + '</a>' : label;
    }).join(', ');
  };
  /* passport (13 Nov 2026): answers with [EU]/[non-EU] lines (classes only-eu / only-non) follow the page's passport
     switch (body.non). Until the visitor has chosen (here, in the chat, or on the page) both versions are shown, labelled. */
  var PKEY = 'msp-passport';
  var P = window.MSP_PASSPORT = {
    known: function () { try { return !!sessionStorage.getItem(PKEY); } catch (e) { return P._set; } },
    get: function () { return document.body.classList.contains('non') ? 'non' : 'eu'; },
    set: function (v) {
      document.body.classList.toggle('non', v === 'non'); P._set = true;
      try { sessionStorage.setItem(PKEY, v); } catch (e) {}
      document.querySelectorAll('.seg button').forEach(function (x) { x.setAttribute('aria-pressed', String((x.dataset.n === 'non') === (v === 'non'))); });
    },
    label: function (v) { return (v || P.get()) === 'non' ? 'a passport from outside the EU, EEA and Switzerland' : 'an EU, EEA or Swiss passport'; },
    both: function (h) {                       // show both versions, each with a label
      return h.replace(/<(p|li) class="only-eu">/g, '<$1><b>EU, EEA or Swiss passport:</b> ')
              .replace(/<(p|li) class="only-non">/g, '<$1><b>Other nationalities:</b> ');
    },
    show: function (h) { return P.known() ? h : P.both(h); }
  };
  try { var saved = sessionStorage.getItem(PKEY); if (saved) P.set(saved); } catch (e) {}
  document.querySelectorAll('.seg button').forEach(function (b) { b.addEventListener('click', function () { P.set(b.dataset.n === 'non' ? 'non' : 'eu'); }); });
  function card(i, open) {
    var h = '<details' + (open ? ' open' : '') + ' data-id="' + esc(i.id) + '"><summary>' + esc(i.q) + '</summary><div class="more">' + P.show(i.a);
    if (i.kind === 'personal') h += '<div class="person">This depends on your own application, so someone from the admissions office looks at it for you. ' +
      'Mail us with your name and, if you have one, your application number.<br><a class="btn" href="' + esc(mailto(i.q)) + '">Ask the admissions office</a></div>';
    var src = source(i.source), chk = day(i.checked);
    if (src || chk) h += '<p class="src">' + (src ? 'Source: ' + src : '') + (src && chk ? ' · ' : '') + (chk ? 'checked ' + chk : '') + '</p>';
    return h + '</div></details>';
  }
  function show(list, title, q) {
    stat.hidden = true;
    head.textContent = title;
    res.innerHTML = list.map(function (i, k) { return card(i, k === 0 && list.length <= 3); }).join('');
    more.hidden = false; mail.href = mailto(q);
  }
  function reset() {
    tops.hidden = false;
    head.textContent = 'Or browse all ' + DATA.items.length + ' questions by topic.';
    res.innerHTML = ''; more.hidden = true; stat.hidden = false; setTopic(null);
  }
  /* ranking shared with the chat (chat.js): every entry scored (BM25, with prefix and typo tolerance), then grouped per
     question: a question's score is its best entry plus a little for other entries that also match */
  var W = window.MSP_WEIGHTS = window.MSP_WEIGHTS || { q: 2, also: 1, p: 6, topic: 0.8, text: 0.3, second: 0.25, top: 5, cmin: 0.75, smin: 60, wcover: 0.5, wscore: 20, ratio: 0.85, rare: 0.4, rdf: 3 };   // tuned 12-13 Nov 2026 on held-out test sets (eval_bank.mjs)
  function rank(q) {
    q = expand(q);
    var hits = ms.search(q, { combineWith: 'OR', boost: { q: W.q, also: W.also, p: W.p, topic: W.topic, text: W.text },
      prefix: function (t) { return t.length > 3; }, fuzzy: function (t) { return t.length > 4 ? 0.2 : false; } });
    var g = {}, order = [];
    hits.forEach(function (h) {                                  // hits come best first
      var x = g[h.item];
      if (!x) { x = g[h.item] = { id: h.item, best: h.score, rest: 0, s: [], terms: {} }; order.push(x); }
      else x.rest += h.score;
      x.s.push(h.score);
      (h.queryTerms || []).forEach(function (t) { x.terms[t] = 1; });
    });
    var rare = W.rare ? tok(q).map(term).filter(function (w) { return w && df[w] && df[w] <= W.rdf; }) : [];
    order.forEach(function (x) {
      x.score = W.top ? x.s.slice(0, W.top).reduce(function (a, b) { return a + b; }, 0) / W.top   // average of the best few entries
        : x.best + W.second * Math.min(x.rest, x.best);
      var n = rare.filter(function (w) { return own[x.id][w]; }).length;
      if (n) x.score *= 1 + W.rare * n;
    });
    return order.sort(function (a, b) { return b.score - a.score; });
  }
  /* a question typed as an answer's heading, or as its first part, gets that answer first (16 Nov 2026: "When can I
     apply?" lost to "Do I choose a major?", "What are the admission requirements?" to the Board of Admissions). Same
     content words after stop words and stemming, at least two of them. */
  var keyOf = function (s) { var w = {}; tok(s || '').map(term).filter(Boolean).forEach(function (x) { w[x] = 1; }); return Object.keys(w).sort().join(' '); };
  var HEAD = {};
  DATA.items.forEach(function (i) {
    [i.q, i.q.split(/[,?.;:(]| or | and /)[0]].forEach(function (s) { var k = keyOf(s); if (k.split(' ').length >= 2 && !HEAD[k]) HEAD[k] = i.id; });
  });
  window.MSP_HEAD = function (q) { return HEAD[keyOf(q)] || null; };
  window.MSP_SEARCH = function (q) {
    var words = MS.getDefault('tokenize')(q).map(term).filter(Boolean);
    var R = rank(q).map(function (h) {            // cover = share of the question's own words that this answer matched
      var hit = words.filter(function (w) { return h.terms[w]; }).length;
      return { item: byId[h.id], score: h.score, words: words.length, cover: words.length ? hit / words.length : 1 };
    });
    var hk = HEAD[keyOf(q)], exact = false;
    if (hk) {
      var ix = -1; R.forEach(function (r, k) { if (ix < 0 && r.item.id === hk) ix = k; });
      if (ix > 0) R.unshift(R.splice(ix, 1)[0]);
      else if (ix < 0) R.unshift({ item: byId[hk], score: R[0] ? R[0].score : 100, words: words.length, cover: 1 });
      exact = true;
    }
    // sure = confident enough to answer without "I'm not completely sure": enough of the question matched, a strong
    // match, and no runner-up almost as strong (cmin/smin/ratio tuned on the test set with eval_bank.mjs, 12 Nov 2026)
    if (R[0]) {
      R[0].sure = R[0].cover > W.cmin && R[0].score >= W.smin;                      // understood well enough: answer confidently
      R[0].weak = R[0].cover <= W.wcover || R[0].score < W.wscore;                  // little matched: say so honestly
      R[0].close = !!(R[1] && R[1].score / R[0].score > W.ratio);                   // a runner-up almost as strong: offer it
      if (exact) { R[0].sure = true; R[0].weak = false; R[0].close = false; R[0].cover = 1; }
    }
    return R;
  };
  if (!box || !input || !tops) return;                          // pages without the search box (After MSP, After your offer): only the chat uses the search
  function search() {
    var q = input.value.trim();
    if (q.length < 2) return reset();
    setTopic(null);
    tops.hidden = true;                                         // topics make way for the answers while typing (phones)
    var hits = rank(q);
    var list = hits.slice(0, 6).map(function (h) { return byId[h.id]; });
    var hk = HEAD[keyOf(q)];                                    // typed as an answer's heading: that answer first
    if (hk) list = [byId[hk]].concat(list.filter(function (i) { return i.id !== hk; })).slice(0, 6);
    if (!list.length) { stat.hidden = true; res.innerHTML = ''; head.textContent = 'No answer found for that yet.'; more.hidden = false; mail.href = mailto(q); return; }
    show(list, list.length === 1 ? 'The best answer we have:' : 'The best answers we have, most likely first:', q);
  }
  var cur = null;
  function setTopic(t) {
    cur = t;
    [].forEach.call(tops.children, function (b) { b.setAttribute('aria-pressed', b.dataset.t === t); });
  }
  DATA.topics.forEach(function (t) {
    var n = DATA.items.filter(function (i) { return i.topic === t; }).length;
    var b = document.createElement('button'); b.type = 'button'; b.dataset.t = t; b.textContent = t + ' (' + n + ')';
    b.addEventListener('click', function () {
      if (cur === t) { input.value = ''; return reset(); }
      input.value = '';
      var list = DATA.items.filter(function (i) { return i.topic === t; }).sort(function (a, b) { return b.asked - a.asked; });
      show(list, t + ': ' + list.length + ' questions, most asked first.', '');
      setTopic(t);
    });
    tops.appendChild(b);
  });
  var timer;
  input.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(search, 140); });
  box.hidden = false;
  reset();
})();
