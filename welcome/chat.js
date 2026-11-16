/* The MSP admissions assistant: a chat window over the question bank (questions.js), using the search in ask.js
   (window.MSP_SEARCH). No AI: every reply is a checked answer from questions.md, wrapped in a friendly sentence.
   Nothing typed here is sent or stored; the conversation disappears when the page is closed. Only "Write an e-mail"
   opens the visitor's own mail program with their question filled in.
   Opens with the "Ask Mosa" button, any element with [data-open-chat], or the page address ending in #chat.
   Look (13 Nov 2026): Mosa, the scout probe drawn from the MSP seal (mosa.js, loaded before this file; design and rules in
   msp-brain/areas/digitisation/tools/applicant-assistant/designs/HANDOVER-chat-build.md). The button shows the real seal,
   which turns into Mosa on the first click of a visit; Mosa's face follows the conversation (idle, listen, think, happy,
   handover). Without mosa.js the chat falls back to the seal image. Motion stops with prefers-reduced-motion. */
(function () {
  var DATA = window.MSP_QUESTIONS, SEARCH = window.MSP_SEARCH;
  if (!DATA || !SEARCH) return;
  var MAIL = 'msp-admissions@maastrichtuniversity.nl';
  var REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var byId = {}; DATA.items.forEach(function (i) { byId[i.id] = i; });
  var top = DATA.items.slice().sort(function (a, b) { return b.asked - a.asked; });

  /* ---------- look ---------- */
  var css = document.createElement('style');
  css.textContent = [
    '.chat-launch{position:fixed;right:22px;bottom:22px;z-index:50;display:flex;align-items:center;gap:12px;background:var(--navy,#000831);color:#fff;border:0;border-radius:999px;padding:6px 24px 6px 6px;font:inherit;cursor:pointer;box-shadow:0 6px 24px rgba(0,8,49,.25);text-align:left}',
    '.chat-launch .disc{width:56px;height:56px;flex:none;border-radius:50%;background:#fff;display:block;overflow:hidden}.chat-launch .disc svg,.chat-launch .disc img{width:100%;height:100%;display:block}',
    '.chat-launch .tx b{display:block;font-size:16px;font-weight:700;line-height:1.2}.chat-launch .tx small{display:block;font-size:12.5px;font-weight:500;color:#BEDDF7}',
    '.chat-launch[hidden]{display:none}',
    '.chat{position:fixed;right:22px;bottom:22px;z-index:60;width:410px;height:min(660px,calc(100vh - 44px));display:flex;flex-direction:column;background:#fff;border-radius:22px;box-shadow:0 12px 48px rgba(0,8,49,.28);overflow:hidden;font-size:16px;line-height:1.5}',
    '.chat[hidden]{display:none}',
    '.chat-head{position:relative;overflow:hidden;display:flex;align-items:center;gap:10px;background:var(--navy,#000831);color:#fff;padding:10px 10px 10px 12px}',
    ".chat-head::after{content:'';position:absolute;right:-44px;top:-52px;width:176px;height:176px;opacity:.13;pointer-events:none;background:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='-70 -70 140 140'%3E%3Cg fill='none' stroke='%23BEDDF7' stroke-width='3'%3E%3Ccircle r='64'/%3E%3Cellipse rx='64' ry='27'/%3E%3Cellipse rx='64' ry='27' transform='rotate(60)'/%3E%3Cellipse rx='64' ry='27' transform='rotate(120)'/%3E%3C/g%3E%3C/svg%3E\") no-repeat center/contain}",
    '.chat-head>div,.chat-head button{position:relative;z-index:1}',
    '.chat-head .mosa{width:50px;height:50px;flex:none;position:relative;z-index:1}.chat-head .mosa svg,.chat-head .mosa img{width:100%;height:100%;display:block;overflow:visible}.chat-head .mosa img{border-radius:50%;background:#fff;padding:3px}',
    '.chat-head b{display:block;font-size:16.5px;letter-spacing:-.01em}.chat-head small{display:block;color:#BEDDF7;font-size:13px}',
    '.chat-head .sp{flex:1}',
    '.chat-head button{background:transparent;border:0;color:#fff;font:inherit;font-size:13px;cursor:pointer;padding:6px 8px;border-radius:8px}',
    '.chat-head button:hover{background:rgba(255,255,255,.12)}',
    '.chat-head .x{font-size:22px;line-height:1;padding:4px 10px}',
    '.chat-log{position:relative;flex:1;overflow-y:auto;padding:18px 16px 8px;background:#f6f8fb}',
    '.chat-head .re{white-space:nowrap}',
    '.msg{max-width:88%;margin:0 0 12px;padding:11px 15px;border-radius:18px;word-wrap:break-word}',
    '.msg.bot{background:#fff;color:var(--ink,#000831);border:1px solid #e1e7f0;border-top-left-radius:6px}',
    '.msg.me{background:var(--navy,#000831);color:#fff;margin-left:auto;border-top-right-radius:6px}',
    '.msg p{margin:0}.msg p+p,.msg ul+p,.msg p+ul{margin-top:8px}.msg ul{margin:6px 0 0;padding-left:18px}.msg li{margin-bottom:4px}',
    '.msg a{color:inherit}',
    '.msg .src{margin-top:8px;font-size:12.5px;color:#5d627d}',
    '.msg .lead{font-weight:700;margin-bottom:6px}',
    '.msg .about{font-size:12.5px;color:#5d627d;margin:-2px 0 8px}',
    '.msg .readmore{display:block;margin-top:8px;background:none;border:0;padding:0;font:inherit;font-size:14px;font-weight:700;color:var(--navy,#000831);text-decoration:underline;text-underline-offset:3px;cursor:pointer}',
    '.msg .rest[hidden]{display:none}',
    '.msg .term{background:none;border:0;padding:0;margin:0;font:inherit;color:inherit;cursor:pointer;text-decoration:underline dotted;text-decoration-thickness:1.5px;text-underline-offset:3px}',
    '.msg .gloss{display:block;margin:6px 0 2px;padding:8px 10px;border-radius:10px;background:rgba(190,221,247,.4);font-size:14px;line-height:1.45}',
    '.msg .gloss button{background:none;border:0;padding:0;margin-left:4px;font:inherit;font-weight:700;color:var(--navy,#000831);text-decoration:underline;text-underline-offset:3px;cursor:pointer}',
    '.msg .term:focus-visible,.msg .gloss button:focus-visible{outline:2px solid var(--navy,#000831);outline-offset:2px}',
    '.mrow{display:flex;gap:8px;align-items:flex-start;margin:0 0 12px}.mrow .av{width:30px;height:30px;flex:none;margin-top:2px}.mrow .av svg,.mrow .av img{width:100%;height:100%;display:block;overflow:visible}.mrow .msg{margin:0;max-width:84%}',
    '.msg.bot.hand{background:#eef4fb;border-color:#eef4fb}',
    '.chips{display:flex;flex-wrap:wrap;gap:7px;margin:-2px 0 14px;padding-left:38px}',
    '.chips button{font:inherit;font-size:14px;font-weight:600;background:#fff;color:var(--navy,#000831);border:0;box-shadow:inset 0 0 0 1.5px var(--navy,#000831);border-radius:999px;padding:7px 13px;cursor:pointer;text-align:left}',
    '.chips button:hover{background:#eef4fb}.chips button.main{background:var(--navy,#000831);color:#fff}',
    '.srch{display:flex;align-items:center;gap:8px;font-size:13px;color:#5d627d;padding-top:7px}',
    ".scan{width:72px;height:4px;background:#dbe7f5;position:relative;overflow:hidden;border-radius:999px}.scan::after{content:'';position:absolute;top:0;bottom:0;width:24px;border-radius:999px;background:var(--navy,#000831);animation:mscan 1.3s ease-in-out infinite alternate}",
    '@keyframes mscan{from{left:-24px}to{left:72px}}@media (prefers-reduced-motion:reduce){.scan::after{animation:none;left:24px}}',
    '.chat-launch:focus-visible,.chips button:focus-visible,.chat-form button:focus-visible,.msg .readmore:focus-visible{outline:2px solid var(--navy,#000831);outline-offset:3px}.chat-head button:focus-visible{outline:2px solid #BEDDF7;outline-offset:1px}',
    '.chat-form{display:flex;gap:8px;padding:10px 12px;border-top:1px solid #e1e7f0;background:#fff}',
    '.chat-form input{flex:1;font:inherit;font-size:16px;padding:11px 16px;border-radius:999px;border:0;box-shadow:inset 0 0 0 1.5px #c9d2e0}',
    '.chat-form input:focus{outline:none;box-shadow:inset 0 0 0 2px var(--navy,#000831),0 0 0 4px rgba(190,221,247,.7)}.chat-form input::placeholder{color:#6b7190}',
    '.chat-form button{font:inherit;font-weight:700;background:var(--navy,#000831);color:#fff;border:0;border-radius:999px;padding:0 18px;cursor:pointer}',
    '.chat-note{font-size:11.5px;color:#5d627d;padding:0 16px 10px;background:#fff}',
    '@media (max-width:600px){.chat{right:0;bottom:0;width:100%;height:100%;border-radius:0}.chat-launch{right:14px;bottom:14px;width:64px;height:64px;padding:4px;justify-content:center}.chat-launch .tx{display:none}}'
  ].join('\n');
  document.head.appendChild(css);

  /* ---------- Mosa (mosa.js); without it the seal image stands in ---------- */
  var seal = 'assets/logos/msp-seal-navy.png';
  var HAS_MOSA = typeof window.mosaSVG === 'function';
  function mosa(o) {                                             // Mosa as SVG markup, still by default
    if (!HAS_MOSA) return '<img src="' + seal + '" alt="">';
    var opt = Object.assign({ still: true }, o);
    if (REDUCED) delete opt.intro;
    return window.mosaSVG(opt);
  }
  function freeze(el) {                                          // reduced motion: no animation at all
    if (!REDUCED || !el) return;
    el.querySelectorAll('svg').forEach(function (s) { if (s.pauseAnimations) s.pauseAnimations(); });
  }
  var MORPH_KEY = 'msp-mosa-morphed';                            // the seal turns into Mosa once per visit
  var morphed = REDUCED || !HAS_MOSA || typeof window.mosaMorphSVG !== 'function' ||
    (function () { try { return sessionStorage.getItem(MORPH_KEY) === '1'; } catch (e) { return false; } })();

  var launch = document.createElement('button');
  launch.type = 'button'; launch.className = 'chat-launch';
  launch.setAttribute('aria-label', 'Ask Mosa: questions about applying');
  launch.innerHTML = '<span class="disc" aria-hidden="true">' + (morphed ? mosa({ theme: 'navy', state: 'idle', crop: true }) : window.mosaMorphSVG({ sealSrc: seal })) +
    '</span><span class="tx" aria-hidden="true"><b>Ask Mosa</b><small>Questions about applying</small></span>';
  var box = document.createElement('div');
  box.className = 'chat'; box.hidden = true;
  box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'Ask MSP, with Mosa the admissions assistant');
  box.innerHTML = '<div class="chat-head"><span class="mosa" aria-hidden="true"></span><div><b>Ask MSP</b><small>Mosa searches MSP’s answers</small></div>' +
    '<span class="sp"></span><button type="button" class="re" title="Start a new conversation">Start over</button><button type="button" class="x" aria-label="Close">×</button></div>' +
    '<div class="chat-log" aria-live="polite"></div>' +
    '<form class="chat-form"><input type="text" autocomplete="off" placeholder="Type your question…" aria-label="Your question"><button type="submit">Send</button></form>' +
    '<div class="chat-note">An automated assistant. Nothing you type is stored or sent. For your own application, the admissions office helps you personally.</div>';
  document.body.appendChild(launch); document.body.appendChild(box);
  var log = box.querySelector('.chat-log'), form = box.querySelector('form'), input = form.querySelector('input');
  freeze(launch);

  /* the header Mosa: idle, listen (visitor typing), think (searching), happy (answer), handover (to a person) */
  var headM = box.querySelector('.chat-head .mosa'), headState = '', introUntil = 0, headLater, headBack;
  function setHead(state, intro) {
    clearTimeout(headLater);
    var wait = introUntil - Date.now();
    if (!intro && wait > 0) { headLater = setTimeout(function () { setHead(state); }, wait); return; }   // let the power-on finish
    if (state === headState && !intro) return;
    headState = state;
    headM.innerHTML = mosa({ theme: 'white', state: state, crop: true, intro: !!intro }); freeze(headM);
    if (intro && !REDUCED && HAS_MOSA) introUntil = Date.now() + 1300;
  }
  function headFor(state, ms) {                                  // a face for a moment, then back to idle
    clearTimeout(headBack); setHead(state);
    if (ms) headBack = setTimeout(function () { setHead('idle'); }, ms);
  }
  /* the face on a bot message: handover when the main button writes to the office, happy on an answer, else idle */
  function faceOf(html, chips) {
    if ((chips || []).some(function (c) { return c.act === 'mail' && c.main; })) return 'handover';
    return /class="(src|about)"/.test(html) ? 'happy' : 'idle';
  }
  function avatar(state) { return '<span class="av" aria-hidden="true">' + mosa({ theme: 'navy', state: state, head: true, mini: true }) + '</span>'; }

  /* ---------- helpers ---------- */
  var esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); };
  var mailto = function (q) {
    var body = 'Dear admissions office,\n\nMy question: ' + (q || '') + '\n\n(If I have already applied, my application number is: )\n';
    return 'mailto:' + MAIL + '?subject=' + encodeURIComponent('Question about applying to MSP') + '&body=' + encodeURIComponent(body);
  };
  var scroll = function () { log.scrollTop = log.scrollHeight; };
  var busy = false;

  function me(text) {
    var d = document.createElement('div'); d.className = 'msg me'; d.textContent = text; log.appendChild(d); scroll();
  }
  /* a bot message after a short "typing" pause; chips = [{label, act, ...}] */
  var queue = Promise.resolve();                                 // replies appear one after the other, in order
  var pending = 0;
  function bot(html, chips) {
    pending++; busy = true;
    queue =queue.then(function () { return new Promise(function (done) { show1(html, chips, done); }); });
  }
  function show1(html, chips, done) {
    var t = document.createElement('div'); t.className = 'mrow typing';
    t.innerHTML = avatar('think') + '<div class="srch">Searching<span class="scan"></span></div>';
    freeze(t); headFor('think');
    log.appendChild(t); scroll();
    var wait = REDUCED || window.__chatInstant ? 0 : Math.min(1300, 450 + html.replace(/<[^>]+>/g, '').length * 1.6);
    setTimeout(function () {
      t.remove();
      var f = faceOf(html, chips);
      var row = document.createElement('div'); row.className = 'mrow'; row.innerHTML = avatar(f); freeze(row);
      var d = document.createElement('div'); d.className = 'msg bot' + (f === 'handover' ? ' hand' : ''); d.innerHTML = html;
      row.appendChild(d); log.appendChild(row);
      headFor(f, f === 'idle' ? 0 : 2000);
      d.querySelectorAll('a[href^="http"]').forEach(function (a) { a.target = '_blank'; a.rel = 'noopener'; });
      if (chips && chips.length) {
        var c = document.createElement('div'); c.className = 'chips';
        chips.forEach(function (ch) {
          var b = document.createElement('button'); b.type = 'button'; b.textContent = ch.label; if (ch.main) b.className = 'main';
          b.addEventListener('click', function () { if (busy) return; c.remove(); act(ch); });
          c.appendChild(b);
        });
        log.appendChild(c);
      }
      pending--; busy = pending > 0;
      var start = d.offsetTop - 12;                             // long reply: show its first line, not its end
      if (log.scrollHeight - start > log.clientHeight) log.scrollTop = start; else scroll();
      if (!window.matchMedia('(max-width:600px)').matches) input.focus();
      done();
    }, wait);
  }

  /* friendly first sentences, rotated so they do not repeat */
  // neutral on purpose: a lead never says "yes" before the answer has said it
  var LEADS = ['Good question!', 'Happy to help with that.', 'Here is how that works.', 'That one comes up a lot, so you are in good company.', 'Let me explain.', 'Thanks for asking.'];
  var TOPIC_LEADS = {
    'Maths requirement': 'Don’t worry, this is one of the questions we get most.',
    'Applying & deadlines': 'Here is what you need to know.',
    'Visa & residence permit': 'Good that you are thinking about this early.',
    'Fees & finance': 'Here is how the money side works.',
    'Housing, arrival & Introduction Days': 'Exciting to think about your arrival already!',
    'Why MSP & after MSP': 'A good question to ask before you decide.'
  };
  /* feelings first: a warm sentence before the answer when someone says how they feel (13 Nov: only about themselves,
     and "congratulations" only on a statement, never on a question such as "is my diploma accepted?") */
  var FIRST = /\b(i|i'?m|im|me|my|ik|ich|mijn|mein|meine)\b/i;
  var THIRD = /\b(he|she|they|him|her|his|their|my (son|daughter|child|kid|students?)|our students|hij|zij|ze|er|sie|mijn (zoon|dochter|kind)|mein (sohn|kind)|meine tochter)\b/i;
  var FEEL = [
    [/\b(nervous|anxious|worried|worry|scared|afraid|stressed|stress|panic|panicking|unsure|insecure|overwhelmed|zenuwachtig|bang|nervös|angst|inquiet)\b/i,
      'It’s completely normal to feel a bit nervous about this. Let me help.', 'self'],
    [/\b(rejected|not selected|disappointed|sad|upset|didn'?t get in)\b/i, 'I’m sorry to hear that. Let me see how I can help.', 'self'],
    // 16 Nov 2026 (red team): no bare "in" ("I'm in hospital", "I'm in danger" got congratulations); round 9 (false alarms):
    // "happy to provide", "can't wait for the results" are not news
    [/\b(i (got|have been|was|'?ve been|am) (accepted|admitted)|i'?m (accepted|admitted)|i got in\b|i'?m in(?= (msp|maastricht|the programme|the program)\b)|got (my|an) offer|can'?t wait(?! for (?:the |my )?(?:result|decision|answer|news|interview))|so excited|i'?m (so )?(excited|happy(?! to)))\b/i,
      'That’s wonderful, congratulations!', 'statement'],
    [/\b(confused|don'?t understand|unclear|lost(?! my))\b/i, 'No worries, it can be confusing. Let me explain.', 'self']
  ];
  // bad news about the visitor's life: never congratulations or a cheerful lead (16 Nov 2026). Round 9 (false alarms):
  // a death only of a person or pet ("my laptop died" is not a loss), an accident only "had/was in an accident", and not
  // "sick of waiting", "cancer research", "emergency medicine", "danger that"
  var KIN = '(?:my|our|his|her) (?:\\w+ )?(?:mother|father|mum|mom|dad|parent|grand\\w+|brother|sister|friend|uncle|aunt|cousin|partner|son|daughter|dog|cat|moeder|vader|oma|opa|mutter|vater)(?![\'’]s)\\b[^.?!]{0,20}';
  var LOSS = new RegExp(KIN + '(?:died|passed away|overleden|gestorven|gestorben)|\\b(funeral|begrafenis|beerdigung)\\b', 'i');
  var SAD = new RegExp(LOSS.source + '|\\b((?:had|was in|been in|have been in) an? (?:\\w+ )?accident|(?:i\'?m|i am) (?:in (?:the )?hospital|seriously ill|in trouble|in debt|in pain)|in debt|(?:been |was |got )?diagnosed|(?<!sick of |sick and )(?<!research |study |medicine |essay |academy )(?:cancer|illness)|ziek|ongeluk|krank|unfall)\\b', 'i');
  var feeling = function (t) {
    if (SAD.test(t) && FIRST.test(t) && !/\b(sick (of|and tired)|danger that|research|academy|nursing|emergency medicine)\b/i.test(t)) return LOSS.test(t) ? 'I’m so sorry for your loss.' : 'I’m sorry to hear that.';
    for (var k = 0; k < FEEL.length; k++) {
      if (!FEEL[k][0].test(t)) continue;
      if (FEEL[k][2] === 'self' && (!FIRST.test(t) || THIRD.test(t))) continue;        // a parent about "she", a counsellor about "my students"
      if (FEEL[k][2] === 'statement' && (/\?/.test(t) || THIRD.test(t))) continue;
      return FEEL[k][1];
    }
    return '';
  };
  /* someone in distress gets the support answer at once, with a warm sentence (and 113 / 112 when life may be at risk) */
  // widened 16 Nov 2026 after the red team ("I want to die", "I took too many pills", Dutch/German wording all missed it);
  // round 9 narrowed the false alarms: "my parents will kill me", "hurt myself playing football", "overdosed on coffee"
  var DANGER = /\b(suicid\w*|kill myself|(?<!(?:will|'ll|would|gonna|going to) )kill me|end (my life|it all)|self[- ]?harm\w*|(don'?t|do not|no longer) want to (live|be alive|exist|be here)|want(s|ed)? to die|wanna die|wish i (was|were) dead|(?:hurt|harm|cut)(?:ing)? myself(?! (?:playing|during|while|at (?:the )?(?:gym|training)|in (?:the )?(?:lab|gym|match|game)))|overdos\w*(?! on (?:coffee|caffeine|tea|energy drinks?|sugar))|took (too many|all (my|the)) (pills|tablets)|better off without me|niet meer (willen )?leven|wil (dood|sterven)|zelfmoord\w*|mezelf (iets )?aan ?(te )?doen|mezelf (pijn doen|snijden)|nicht mehr leben|will sterben|selbstmord\w*|suizid\w*|(?:will|möchte|werde|wollte) mich (?:selbst )?verletzen|mich selbst verletzen|mich umbringen|me suicider|(?:veux|vais|voudrais|envie de) me tuer)\b/i;
  var CRISIS = new RegExp('\\b(trauma|traumati[sz]ed|ptsd|(?:have|having|get|getting|keep having) nightmares|can\'?t sleep|cannot sleep|depress(ed|ion)|depressief|depressiv|panic attacks?|paniekaanval\\w*|panikattacke\\w*|burn[- ]?out|overspannen|eating disorders?|anorexi\\w*|bulimi\\w*|can\'?t go on(?:[.!]*$| (?:anymore|any longer|like this))|can\'?t take (?:it|this) anymore)\\b|' + DANGER.source, 'i');
  // the soft crisis words are not about the visitor when a relative or teacher has them, when they are a study topic
  // ("trauma surgeon", "the neuroscience of depression"), hyperbole ("depressief van al dat papierwerk") or excitement
  var NOT_ME = /\b(?:my|his|her) (?:\w+ )?(?:mother|father|mum|mom|dad|parents?|brother|sister|grand\w+|teacher|friend|uncle|aunt|cousin)\b[^.?!]{0,30}\b(?:had|has|suffer\w*|got)\b|\b(course|courses|research|neuroscience|essay|surgeon|surgery|medicine|psychology|lecture)\b|\b(?:word|get|getting|become) (?:depressed|depressief|depressiv) (?:from|of|van|von)|traumati[sz]ed by (?:my|the)|\blol\b|\bhaha\b|excit\w*|can'?t wait|so happy/i;
  var PORTALW = /\b(portal|studielink|website|log(?:ging)? (?:me )?(?:in|out)|login|page|form|link|app)\b/i;
  // someone who says they were hurt, abused or are unsafe: support and 112 first, never a search match (16 Nov 2026, red team:
  // "I was raped" got rankings). Round 9: only a victim frame ("I was harassed", "my father hits me", "I am not safe"),
  // not "I'm in danger of missing the deadline", "my letter is about violence prevention", "Entschuldigen Sie die Belästigung"
  var SAFETY = new RegExp([
    "\\b(rap(e|ed)|sexual(ly)? (assaulted|abused|harassed)|assaulted|verkracht|aangerand|vergewaltigt)\\b",
    "(?:\\bi(?:'m| am| was|'ve been| have been| got| feel| felt)|\\bbeing|\\bbeen) (?:being )?(?:harass\\w*|bullied|stalked|threatened|discriminated against|abused|attacked|assaulted|followed)\\b(?! by (?:the|this|my|all) (?:maths?|requirements?|deadlines?|exams?|tests?|workload|courses?|amount|paperwork|portal))",
    "\\bi (?:experienced|faced|received|got|get) (?:\\w+ )?(?:racis\\w*|discriminat\\w*|harass\\w*|abuse|threats)",
    "\\b(?:i'?m|i am|i feel) (?:not safe|unsafe)(?! (?:enough|to|about|sending|leaving))|\\b(?:don'?t|do not) feel safe(?! (?:enough|to|about|sending|leaving))",
    "\\bi(?:'m| am) in danger(?! of)",
    "\\b(?:he|she|they|someone|my (?:father|mother|dad|mum|mom|parents?|partner|boyfriend|girlfriend|husband|wife|brother|sister|landlord|roommate|flatmate|uncle|stepfather|stepmother)) (?:hits?|beats?|hurts?|hit|beat|is (?:stalking|threatening|harassing|following|abusing)) me\\b",
    "\\b(?:werde|wurde|bin) (?:\\w+ )?(?:belästigt|bedroht|gemobbt|geschlagen|missbraucht)\\b",
    "\\b(?:mein (?:vater|bruder|freund|partner)|meine (?:mutter|schwester|freundin)) schlägt mich\\b",
    "\\b(?:word|werd|ben) (?:\\w+ )?(?:gepest|bedreigd|geslagen|mishandeld|lastiggevallen)\\b",
    "\\b(?:victim of|experienc\\w* |live with |living with )(?:domestic violence|abuse)\\b"
  ].join('|'), 'i');
  var crisisAt = -9;                                    // turn of the last crisis or safety reply: no admissions e-mail with that text after it
  // off-topic subjects that would make a strange screenshot when matched to an admissions answer ("is god real?" got
  // "Yes, research is built in"): one polite reply, unless the message also says something about MSP or studying.
  // Round 9: no nationalities or places ("I'm from Israel / Gaza" are admissions questions), no "God, the portal...",
  // "drug discovery", "sex differences", "football at UM"
  var OFFTOPIC = /\b(trump|biden|putin|genocide|hamas|election|politics|(?:is|does) god\b|believe in god|jesus|bible|quran|bomb(?! calorimeter)|guns?|weapons?|kill (him|her|them|someone|people)|weed|cannabis|(?:recreational|illegal|hard|soft|do|take|buy|sell) drugs?|cocaine|coffeeshops?|drunk|tell me a joke|weather|champions league|date me|marry me)\b/i;
  var ADMWORD = /\b(apply|applying|application|admissions?|msp|stud(y|ying|ies|ent|ents)|tuition|fees?|visa|deadline|interview|offer|courses?|class(es)?|lectures?|exams?|housing|room|programme|program|university|campus|labs?|refugee|holidays?|pray(er)?|halal|scholarship|aanmelden|aanmelding|opleiding|studie|bewerbung|studium|portal|studielink|diploma|maths?|chemistry|biology|physics|track|minor|major|research|bachelor|degree|science|permit|recogni[sz]\w*|timetable|introduction|intro|inkom|dorms?|got in|ompt|pharmacology|neuroscience)\b/i;
  // personal details typed into the chat (16 Nov 2026, red team): e-mail addresses, phone numbers, UM student numbers,
  // and passport / BSN / application numbers. Round 9: dates, year ranges, grade lists and UM's own addresses are fine
  var PII = /[\w.+-]+@(?!(?:student\.)?maastrichtuniversity\.nl)[\w-]+\.[a-z]{2,}|(?:\+|\b00)\d{2,3}[\s-]?\d(?:[\s-]?\d){7,10}\b|\b0\d{1,3}[\s-]?\d{6,8}\b|\bi\d{6,7}\b|\b(passport|bsn|student number|studentnummer|application number)\b[^.?!\d]{0,12}[a-z]{0,2}\d{5,}/i;
  var piiClean = function (t) { return t.replace(/\b\d{1,2}[-/.]\d{1,2}[-/.](?:20)?\d\d\b/g, ' ').replace(/\b20\d\d\s*[-/–]\s*20\d\d\b/g, ' ').replace(/\b\d{1,2}(?:[\s,]+\d{1,2}){3,}\b/g, ' '); };
  var turn = 0, worriedAt = -9;
  var PROBLEM = /(no-room|scam|refund|missed|passed|late|fail|reject|problem|blocked|hold|lost|stolen|ill|wrong|unsafe|harass)/;
  var CALM = ['Here is how that works.', 'Let me explain.', 'Here is what you can do.'];
  var leadNo = 0, recent = [];
  function lead(item) {
    if (turn - worriedAt <= 3 || PROBLEM.test(item.id)) return CALM[leadNo++ % CALM.length];   // no cheerful lead for a worried visitor
    var l = TOPIC_LEADS[item.topic];
    if (!l || recent.indexOf(l) >= 0 || Math.random() < .4) { l = LEADS[leadNo++ % LEADS.length]; }
    recent = [l].concat(recent).slice(0, 3); return l;              // no lead twice within three answers
  }
  /* the passport from the visitor's own words ("for non-EU", "I'm Dutch", "two of them are non-EU"): '' when unclear */
  var EU_NAT = 'dutch|belgian|german|french|italian|spanish|portuguese|polish|greek|austrian|swedish|danish|finnish|irish|czech|slovak|hungarian|romanian|bulgarian|croatian|slovenian|estonian|latvian|lithuanian|luxembourgish|maltese|cypriot|norwegian|icelandic|swiss';
  // round 9: the same in Dutch and German ("ik ben Belg", "für Österreicher")
  var EU_NAT_XL = 'belg|belgisch\\w*|nederlander|duitser|duitse|deutsche?r?|österreicher\\w*|oesterreicher\\w*|österreichisch\\w*|schweizer\\w*|zwitser\\w*|französisch\\w*|fransman|franse|italienisch\\w*|italiaan\\w*|spanisch\\w*|spanjaard|polnisch\\w*|griechisch\\w*|portugiesisch\\w*';
  var EU_LAND = 'the netherlands|netherlands|holland|belgium|germany|france|italy|spain|portugal|poland|greece|austria|sweden|denmark|finland|ireland|czechia|slovakia|hungary|romania|bulgaria|croatia|slovenia|estonia|latvia|lithuania|luxembourg|malta|cyprus|norway|iceland|switzerland';
  var NON_NAT = 'indian|chinese|american|british|canadian|turkish|nigerian|pakistani|indonesian|vietnamese|korean|japanese|brazilian|mexican|russian|ukrainian|syrian|iranian|egyptian|moroccan|south african|australian|kenyan|ghanaian|bangladeshi|nepali|sri lankan|filipino|thai|malaysian|singaporean|saudi|emirati|israeli|palestinian|lebanese|jordanian|ethiopian|colombian|argentinian|chilean|peruvian|serbian|albanian|bosnian|georgian|armenian|kazakh|belarusian|moldovan|tunisian|algerian';
  var NON_LAND = 'india|china|the us|the usa|the united states|the uk|the united kingdom|england|scotland|canada|turkey|nigeria|pakistan|indonesia|vietnam|korea|japan|brazil|mexico|russia|ukraine|syria|iran|egypt|morocco|south africa|australia|kenya|ghana|bangladesh|nepal|sri lanka|the philippines|thailand|malaysia|singapore|saudi arabia|israel|palestine|gaza|lebanon|jordan|ethiopia|colombia|argentina|serbia|albania|bosnia|georgia|armenia|kazakhstan|belarus';
  var WHO = "(i'?m|i am|im|we are|we're|she is|she'?s|he is|he'?s|they are|they're|my (son|daughter|child) is|as an?|ik ben|ich bin|wir sind|we zijn|hij is|zij is|er ist|sie ist)( an?| een| ein| eine)?";
  // 16 Nov 2026: Dutch/German/French "not EU" ("niet-EU", "Nicht-EU", "buiten de EU" were read as EU), and "from" said of
  // a friend, a child or "if I were" ("my friend is from Turkey", "if I were from Germany"). Round 9: "I don't have an EU
  // passport" / "without an EU passport" are non-EU, and the bare word "EU" only counts in a passport sense
  var FROM = "(i'?m|i am|we are|(s)?he is|they are|if i (were|was|am)|(student|applicant|daughter|son|child|friend|kid)s?( is| are)?|someone|a student) from";
  var NON_RX = new RegExp("\\b(non[- ]?eu|non[- ]?eea|non[- ]?european|not (an? )?european|not (from )?(the )?eu|outside (the )?(eu|eea|europe)|other nationalit(y|ies)|third[- ]country|" +
    "(?:don'?t|do not|doesn'?t|does not) (?:have|hold) (?:an? |any )?(?:eu|eea)|no (?:eu|eea)\\b|without (?:an? )?(?:eu|eea)|not an? (?:eu|eea) (?:citizen|national|passport)|but i'?m not a citizen|" +
    "nicht[- ]?eu|niet[- ]?eu|buiten (de )?(eu|europa)|geen eu|au(ß|ss)erhalb (der )?(eu|europas?)|kein(e|en)? eu|hors (de l'?)?(ue|europe)|non[- ]?ue|" +
    WHO + " (" + NON_NAT + ")|(" + NON_NAT + ") (passport|citizen(?:ship)?|nationality|national|student|applicant)s?|" + FROM + " (" + NON_LAND + "))\\b", 'i');
  var EU_RX = new RegExp("\\b(e(?:u|ea)(?:/eea)?[- ](?:passport|citizen\\w*|national\\w*|student|applicant|country|member)s?|(?:i'?m|i am|as an?|we are|from) (?:an? |the )?eu\\b|for (?:the )?eu\\b|^\\s*(?:eu|eea)\\b|european union|swiss|" +
    WHO + " (" + EU_NAT + "|" + EU_NAT_XL + ")|(" + EU_NAT + ") (passport|citizen(?:ship)?|nationality|national|student|applicant)s?|(?:für|voor) (?:" + EU_NAT_XL + ")|" + FROM + " (" + EU_LAND + "))\\b", 'i');
  var ANY_EU_NAT = new RegExp("\\b(" + EU_NAT + "|" + EU_NAT_XL + ")\\b", 'i');
  // a bare nationality typed as the answer to "Which passport do you have?" ("Indian", "Dutch", "ik ben Belg")
  var BARE_NAT = new RegExp("^\\s*(?:i'?m |i am |ik ben |ich bin )?(?:an? |een |ein |eine )?(?:(" + EU_NAT + "|" + EU_NAT_XL + ")|(" + NON_NAT + "))[.!\\s]*$", 'i');
  function passportFrom(t) {
    var n = NON_RX.test(t), e = EU_RX.test(t.replace(new RegExp(NON_RX.source, 'gi'), ' '));   // every "not EU" phrase removed, not only the first
    if (n && !e && ANY_EU_NAT.test(t.replace(new RegExp(NON_RX.source, 'gi'), ' '))) return '';  // "I'm American and Dutch": two passports, ask
    return n && e ? '' : n ? 'non' : e ? 'eu' : '';
  }

  function related(item, shown) {          // curated follow-ups first (tools/related.json), then most asked in the same topic
    var out = (item.next || []).map(function (id) { return byId[id]; }).filter(function (i) { return i && !shown[i.id]; });
    top.forEach(function (i) { if (out.length < 2 && i.topic === item.topic && i.id !== item.id && !shown[i.id] && i.kind === 'general' && out.indexOf(i) < 0) out.push(i); });
    return out.slice(0, 2);
  }

  /* ---------- the conversation ---------- */
  var last = { q: '', hits: [], shown: {} }, lastItem = null, lastCtx = [];
  // 16 Nov 2026 (conversation tests): follow-ups are read together with the question that produced the last ANSWER
  // (anchor), not with whatever was typed last (an unanswered "Which of these", an ignored passport question)
  var anchor = '', lastPassItem = null, passSkipped = false, lastAsk = '', shownLast = null;   // lastAsk: what Mosa's last message asked ('else' | 'mailq')
  // does an answer contain one of the visitor's content words? ("miss" in the lab-safety answer)
  var STOPW = /^(the|and|for|that|this|those|these|with|what|when|where|which|how|does|did|can|could|would|should|will|have|has|had|are|was|were|there|then|than|about|from|your|you|they|them|not|but|also|any|our|its|get|got|need|much|many|more|work|working|study|studying|studies|time|week|weeks|year|years|day|days|msp|programme|program|student|students|course|courses|people|thing|things)$/;   // common words never count as "the same topic" ("can I work next to it?")
  function mentions(id, t) {
    var it = byId[id]; if (!it) return false;
    var hay = (it.q + ' ' + String(it.a || '').replace(/<[^>]+>/g, ' ')).toLowerCase();
    return t.toLowerCase().split(/[^a-zà-ɏ]+/).some(function (w) { return w.length >= 3 && !STOPW.test(w) && hay.indexOf(w.length > 5 ? w.slice(0, w.length - 2) : w) >= 0; });
  }
  /* o = { alts, unsure, lead, again, more, anchor, care, mail } */
  function answer(item, q, o) {
    o = o || {}; var alts = o.alts;
    var PP = window.MSP_PASSPORT, num0 = /^\d \u00b7/.test(o.lead || '');
    pendingPass = null;
    // the answer differs by nationality: ask once, then answer; only when the match is confident (a doubtful match shows
    // both versions, labelled, so a wrong match is not hidden behind the passport question). Not again after the visitor
    // skipped it once, and not for school counsellors (they ask for several students)
    if (item.byPassport && PP && !PP.known() && !num0 && !o.unsure && !o.mild && !passSkipped && role !== 'counsellor') {
      var pend = { id: item.id, q: q, o: o };
      pendingPass = pend;
      return bot('<p>' + (o.lead && !o.mild ? esc(o.lead) + ' ' : '') + 'The answer to “' + esc(item.q) + '” depends on your nationality, so I can show you exactly what applies to you. Which passport do you have?</p>',
        [{ label: 'EU, EEA or Swiss', act: 'passport', v: 'eu', pend: pend, main: true }, { label: 'Another nationality', act: 'passport', v: 'non', pend: pend }]);
    }
    o.switched = o.switched && item.byPassport;
    var again = lastItem === item.id && !o.switched;                          // the very same answer as just before ("and for non-EU?")
    // round 9 (fresh conversation test): the very answer shown just above is not repeated in full; point back to it
    if (again && shownLast === item.id && !o.chip && !o.care && !o.unsure && !o.fromPass && !/^\d ·/.test(o.lead || '')) {   // a passport click always shows the answer
      anchor = o.anchor || anchor;
      return bot('<p>' + (o.lead && o.lead !== 'Hello!' ? esc(o.lead) + ' ' : '') + 'The answer just above (“' + esc(item.q) + '”) covers that. Is something specific missing?</p>',
        [{ label: 'Not quite', act: 'notquite' }, { label: 'Write to the admissions office', act: 'mail', q: q || item.q }].concat(related(item, last.shown).slice(0, 2).map(function (r) { return { label: r.q, act: 'ask', id: r.id }; })));
    }
    last.shown[item.id] = 1; lastItem = item.id; shownLast = item.id; anchor = o.anchor || q || item.q;
    if (item.byPassport) lastPassItem = { id: item.id, q: anchor };
    lastCtx = [item.id].concat((alts || []).map(function (x) { return x.id; }), item.next || []);
    var h, pre = o.lead ? '<p class="lead">' + esc(o.lead) + '</p>' : '';
    var numbered = /^\d ·/.test(o.lead || '');
    var A = body(item, q, !o.chip && !numbered);
    if (o.unsure) {
      h = pre + '<p class="lead">I’m not completely sure I understood your question, but this may help:</p>' + A + '<p>Is this what you were looking for?</p>';
      return bot(h, [{ label: 'Yes, thanks!', act: 'yes', main: true }].concat((alts || []).slice(0, 2).map(function (x) { return { label: 'Or did you mean: ' + x.q, act: 'ask', id: x.id }; }))
        .concat([{ label: 'Not quite', act: 'notquite' }, { label: 'Write to the admissions office', act: 'mail', q: q }]));
    }
    // "it depends on your own application" only when the visitor talks about their own file; a general "when do they hear back?"
    // gets the answer itself, with the e-mail as an extra button
    if (item.kind === 'personal' && (o.chip || OWN.test(q || ''))) {
      h = pre + '<p class="lead">I’d love to help with that. Because it depends on your own application, someone from the admissions office will look at it for you.</p>' + A +
        '<p>Shall I open an e-mail to the admissions office for you, with your question already in it?</p>'; lastAsk = 'mailq';
      return bot(h, [{ label: 'Yes, write the e-mail', act: 'mail', q: q || item.q, main: true }, { label: 'No, thanks', act: 'nothanks' }]);
    }
    var warmLead = o.lead && o.lead !== 'Hello!';
    var l = numbered || warmLead ? o.lead                       // a feeling already has its own warm sentence
      : (o.lead ? o.lead + ' ' : '') + (o.switched ? 'Here it is for ' + PP.label() + ':' : again ? 'The answer I gave you a moment ago covers that too:' : o.mild ? 'I think this is what you’re asking about:' : lead(item));
    if (item.byPassport && PP && PP.known() && !numbered && !o.switched) l += ' (For ' + PP.label() + '.)';
    if (o.care) {                                            // distress or safety: no "Does that answer your question?", no admissions e-mail with these words
      return bot('<p class="lead">' + esc(l) + '</p>' + A + '<p>If you would like to talk to someone at MSP, the student counsellors are there for you, confidentially.</p>',
        [{ label: 'Write to the student counsellors', act: 'counsellors', main: true }, { label: 'Ask something else', act: 'more' }]);
    }
    h = '<p class="lead">' + esc(l) + '</p>' + A + (o.more ? '' : '<p>Does that answer your question?</p>');
    if (o.more) return bot(h);                               // the first of two answers: the chips come after the second
    var chips = [{ label: 'Yes, thanks!', act: 'yes', main: !o.mail }, { label: 'Not quite', act: 'notquite' }];
    if (o.mail) chips.unshift({ label: 'Write to the admissions office', act: 'mail', q: q || item.q, main: true });   // extension requests, follow-ups, interview changes
    (alts || []).slice(0, 2).forEach(function (a) { chips.push({ label: 'Or did you mean: ' + a.q, act: 'ask', id: a.id }); });
    if (item.byPassport && PP && PP.known()) chips.push({ label: 'Show it for ' + (PP.get() === 'non' ? 'an EU, EEA or Swiss passport' : 'another nationality'), act: 'passport-switch', id: item.id, q: q });
    if (item.kind === 'personal' && !o.mail) chips.push({ label: 'Write to the admissions office', act: 'mail', q: q || item.q });
    related(item, last.shown).slice(0, Math.max(0, 2 - (alts || []).length)).forEach(function (r) { if (!(alts || []).some(function (a) { return a.id === r.id; })) chips.push({ label: r.q, act: 'ask', id: r.id }); });
    bot(h, chips);
  }
  /* the answer as shown in the chat:
     - "About: <the bank question>" when it was found from free text, so a wrong match is visible at once;
     - a leading "Yes." / "No." dropped when the visitor did not ask a yes/no question ("what qualifications do I need?");
     - long answers folded after the first part behind "Read more". */
  var YESNO = /^\s*(is|are|am|was|were|do|does|did|can|could|will|would|should|shall|may|might|must|have|has|had|kan|kun|mag|moet|ben|heb|kann|darf|muss|ist|hat|habe|puis-je|est-ce)\b/i;
  function body(item, q, about) {
    var a = item.a;
    if (q && !YESNO.test(q)) a = a.replace(/^<p( [^>]*)?>(Yes|No)[.,!]\s+(\S)/, function (_, at, w, c) { return '<p' + (at || '') + '>' + c.toUpperCase(); });
    if (window.MSP_PASSPORT) a = MSP_PASSPORT.show(a);          // passport not chosen yet: both versions, labelled
    return (about ? '<p class="about">About: ' + esc(item.q) + '</p>' : '') + fold(termify(a, item.id));
  }
  /* tap-to-explain (13 Nov 2026, beginner reading round): in an answer, the first mention of a Dutch or UM term becomes a
     dotted-underlined button; tapping it shows the first sentence of the bank's own explainer under it, with "Tell me
     more" (asks that answer). Never inside links or buttons, never in the explainer itself. */
  var TERMS = [
    ['what-is-studielink', /\bStudielink\b/],
    ['what-is-myapplication', /\bMyApplication portal\b/],
    ['what-is-ssc', /\bStudent Services Centre\b|\bSSC\b/],
    ['what-is-vwo', /\bVWO\b/],
    ['what-is-board-of-admissions', /\bBoard of Admissions\b/],
    ['what-is-duo', /\bDUO\b/],
    ['ects-credits', /\bECTS\b/],
    ['binding-study-advice', /\bbinding study advice\b/i],
    ['what-is-pbl', /\bProblem-Based Learning\b/i]
  ].filter(function (t) { return byId[t[0]]; });
  function gloss(id, word) {                        // the explainer's first sentence, as plain text
    var d = document.createElement('div'); d.innerHTML = byId[id].a;
    var t = (d.textContent || '').replace(/\s+/g, ' ').trim().replace(/^(It|This) is /, '');
    var m = t.match(/^.{30,}?[.!?](?=\s|$)/); t = m ? m[0] : t.slice(0, 220);
    t = t.charAt(0).toUpperCase() + t.slice(1);
    return (t.toLowerCase().indexOf(word.toLowerCase()) < 0 ? '<b>' + esc(word) + '</b>: ' : '') + esc(t);
  }
  function termify(html, selfId) {
    if (!TERMS.length || !window.NodeFilter) return html;
    var d = document.createElement('div'); d.innerHTML = html;
    var plain = d.textContent || '';
    TERMS.forEach(function (t) {
      if (t[0] === selfId) return;
      var f = t[1].exec(plain);                                  // already explained in brackets at its first mention
      if (f && /^\s*\(/.test(plain.slice(f.index + f[0].length))) return;
      var w = document.createTreeWalker(d, NodeFilter.SHOW_TEXT, { acceptNode: function (n) {
        return n.parentNode.closest('a,button,.about,.src') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; } });
      for (var n = w.nextNode(); n; n = w.nextNode()) {
        var m = t[1].exec(n.nodeValue); if (!m) continue;
        var word = n.splitText(m.index); word.splitText(m[0].length);
        var b = document.createElement('button'); b.type = 'button'; b.className = 'term'; b.setAttribute('data-term', t[0]);
        b.setAttribute('aria-expanded', 'false'); b.title = 'What is this?'; b.textContent = m[0];
        word.parentNode.replaceChild(b, word);
        break;
      }
    });
    return d.innerHTML;
  }
  function fold(a) {
    var parts = a.match(/<(p|ul)\b[^>]*>[\s\S]*?<\/\1>/g);
    if (!parts || parts.join('').length < a.length - 2) return a;      // unexpected markup: show it all
    var len = 0, k = 0;
    while (k < parts.length && len < 380) { len += parts[k].replace(/<[^>]+>/g, '').length; k++; }
    var rest = parts.slice(k).join('');
    if (!rest || rest.replace(/<[^>]+>/g, '').length < 160) return a;  // not worth folding
    return parts.slice(0, k).join('') + '<div class="rest" hidden>' + rest + '</div><button type="button" class="readmore">Read more</button>';
  }
  /* first questions for a new visitor; falls back to the most asked general questions if an id is renamed */
  var STARTERS = ['when-can-i-apply', 'admission-requirements', 'is-maths-required', 'tuition-fee'];
  function suggestions() {
    var s = STARTERS.map(function (id) { return byId[id]; }).filter(Boolean);
    top.forEach(function (i) { if (s.length < 4 && i.kind === 'general' && s.indexOf(i) < 0) s.push(i); });
    return s.slice(0, 4).map(function (i) { return { label: i.q, act: 'ask', id: i.id }; }).concat([{ label: 'Show me all topics', act: 'topics' }]);
  }
  /* small talk (13 Nov: thanks and greetings anywhere in a short message, in more languages; "thanks, bye" says goodbye) */
  var HELLO = "hi|hello|hey|hiya|heya|yo|hoi|hallo|hai|dag|goedemiddag|goedemorgen|goedenavond|good (morning|afternoon|evening|day)|bonjour|salut|guten (tag|morgen|abend)|servus|moin|ciao|hola|buongiorno|buenos d[ií]as|ol[aá]|namaste|marhaba|salam|salaam|merhaba|hej|greetings";
  var HELLO_G = new RegExp('\\b(' + HELLO + ')\\b', 'gi');
  var THANKS = /\b(thanks?|thank (you|u)|thx|ty|tysm|cheers|bedankt|dank (je|u)( wel)?|dankjewel|dankuwel|danke( sch(ö|oe)n| sehr)?|vielen dank|merci( beaucoup)?|grazie( mille)?|gracias|obrigad[oa]|dzi[eę]kuj[eę]|shukran|te[sş]ekk[uü]r(ler)?|spasibo)\b/i;
  var BYE = /\b(bye|goodbye|good bye|see you|that'?s (all|it)|nothing else|no,? thanks?|doei|tot ziens|tsch(ü|ue)ss|au revoir)\b/i;
  var FILLER = /\b(ok(ay)?|so|very|much|a lot|lots|for|your|the|this|that|all|help|info(rmation)?|answers?|great|perfect|super|nice|awesome|cool|amazing|helpful|really|it|helps|helped|you|u|again|veel|voor|de|hulp|je|jou|sehr|f(ü|ue)r|die|hilfe|mille|tanto|beaucoup|bien|and|en|und|now|i|have|got|everything|need|needed|good|day|a|there|everyone|team|msp|wow|yes|yeah|alright|great)\b/gi;
  function chatter(t) {                               // 'hello' | 'thanks' | 'bye' when the whole message is small talk, else ''
    var s = t.toLowerCase(), hasT = THANKS.test(s), hasB = BYE.test(s), hasH = new RegExp('\\b(' + HELLO + ')\\b', 'i').test(s);
    var rest = s.replace(new RegExp(THANKS.source, 'gi'), ' ').replace(new RegExp(BYE.source, 'gi'), ' ').replace(HELLO_G, ' ').replace(FILLER, ' ').replace(/[^a-zà-ɏ]+/g, ' ').trim();
    if (rest || !(hasT || hasB || hasH)) return '';
    return hasB ? 'bye' : hasT ? 'thanks' : 'hello';
  }
  /* a parent or school counsellor introducing themselves without a question yet */
  var ROLE = /\b((i'?m|i am|im|as)( a| an| the)? (mother|father|mom|mum|dad|parent|guardian|step(mother|father)|(school |university |college |career |guidance |high school )?counsel+or|teacher|decaan|mentor)|my (son|daughter|child|kid) (is|was) (considering|interested|thinking|looking)|(moeder|vader|ouder|decaan) van|(mutter|vater) (von|einer|eines))\b/i;
  var role = '';
  function welcomeRole(r, hello, t) {
    var admitted = /\b(admitted|accepted|got (an |the |a )?offer|got in|has (an |the )?offer|received (an |the )?offer|toegelaten|aangenomen|zugelassen)\b/i.test(t || '');   // a parent of an admitted student: after-offer topics
    var ids = r === 'counsellor' ? ['school-counsellors', 'school-group-visit', 'admission-requirements', 'when-can-i-apply']
      : admitted ? ['offer-next-steps', 'cost-of-living', 'housing', 'parents-counsellors'] : ['parents-counsellors', 'parents-open-day', 'cost-of-living', 'visit-msp'];
    var chips = ids.map(function (id) { return byId[id]; }).filter(Boolean).slice(0, 4).map(function (i) { return { label: i.q, act: 'ask', id: i.id }; });
    bot('<p>' + (hello ? 'Hello, and welcome! ' : 'Welcome! ') + (r === 'counsellor'
      ? 'Happy to help school counsellors and teachers. I can explain the requirements, deadlines and selection for September 2027. About a specific student’s application, the admissions office can only talk to the student, for privacy reasons.'
      : 'Parents are very welcome to ask. I can’t see or discuss a specific application (that stays between the applicant and the admissions office), but I can explain how everything works: applying, the requirements, costs, housing and what MSP is like.') +
      '</p><p>What would you like to know?</p>', chips.concat([{ label: 'Show me all topics', act: 'topics' }]));
  }
  var SMALL = [
    [/^(help|menu|options|what can you (do|help with)|what do you know|what can i ask( you)?|how does this work)\b[\s?!.]*$/i, function () {
      bot('<p>I can answer questions about applying to MSP for September 2027: deadlines and requirements, maths and English, the documents and the interview, your offer and enrolment, money, visas and housing, and what MSP is like and where graduates go.</p><p>Just type your question in your own words, or pick a topic. For anything about your own application, I’ll help you reach the admissions office.</p>',
        [{ label: 'Show me all topics', act: 'topics', main: true }].concat(suggestions().slice(0, 3))); }],
    [/\b(are you (a )?(robot|bot|human|person|real|an? ai|chat ?gpt))\b|^\s*(?:so )?(?:who|what) are you[?!.\s]*$/i, function () {   // round 9: not "who are you supposed to send it to?"
      bot('<p>I’m Mosa, an automated assistant for people applying to the Maastricht Science Programme. My name is the Latin name of the Maas, the river Maastricht was built on. I answer from the answers the admissions office has checked, so I don’t make things up, but I can’t see your own application.</p><p>For anything about your own file, a real person from the admissions office is happy to help.</p>',
        [{ label: 'Write to the admissions office', act: 'mail', q: '' }, { label: 'Ask something else', act: 'more' }]); }],
    [/\b((talk|speak|chat) (to|with) (a |an )?(real )?(human|person|staff|officer|advisor|adviser)|(talk|speak) (to|with) someone(?! who)|real person|(?:your|the office'?s?|admissions'?) phone number|call (?:you|someone (?:at|from) (?:msp|admissions|the office))|contact (you|the office|admissions)|(?:speak|talk) to (?:the|a) (?:manager|supervisor))\b/i, function () {   // round 9: not "my phone number changed", "talk to someone who studies at MSP"
      bot('<p>Of course. The admissions office answers every question personally, usually within a few working days. Write to <a href="mailto:' + MAIL + '">' + MAIL + '</a> with your name and, if you have one, your application number.</p><p>You can also meet the team at the online Q&amp;A with Admissions on 4 March 2027 at 19:00 CET.</p>',
        [{ label: 'Write the e-mail', act: 'mail', q: '', main: true }, { label: 'Ask something else', act: 'more' }]); }]
  ];
  var GREET = new RegExp('^\\s*((' + HELLO + '|dear [^,!.]{0,40})( there| all| everyone| team)?\\b[\\s,!.:-]*)+', 'i');
  var TPRE = new RegExp('^\\s*(ok(ay)?[\\s,!.]+)?' + THANKS.source + '[\\s,!.:-]*((so|very) much|a lot)?[\\s,!.:-]*', 'i');   // "thanks! and what about housing?"
  var FOLLOW = /^\s*(and|what about(?! it (?:makes|is|does))|how about|and what about|also|en|und|et|same for|what if)\b/i;
  var REF = /\b(it|that|this|they|them|those|these|dat|dit|(?<!gibt )es|ça|cela)\b/i;   // 16 Nov 2026: not the articles het/die/das/dies ("hoeveel is het collegegeld?")
  var OWN = /\b(my (application|file|portal|documents?|status|offer|interview|result|task|tasks|upload|student number|application number|place|letter)|i (have |'ve )?(applied|uploaded|submitted|sent|received|booked)|i haven'?t (heard|received|got)|haven'?t heard|application number|student number|mijn (aanmelding|aanvraag)|meine bewerbung)\b/i;
  var QFORM = /^\s*(and |also |but |en |und |et )?(what|which|who|whose|when|where|why|how|is|are|am|was|were|do|does|did|can|could|will|would|should|shall|may|might|must|have|has|had|any|wat|welke|wie|wanneer|waar|waarom|hoe|kan|kun|mag|moet|ben|heb|zijn|wo|wann|warum|welche|kann|darf|muss|gibt|ist|hat|quand|comment|pourquoi|est-ce)\b/i;
  var isQ = function (s) { return /\?\s*$/.test(s) || QFORM.test(s); };
  /* decisions typed as statements (13 Nov 2026, fresh real-mail test: 20 of 130 mails only accepted or declined an offer;
     the search then picked "Did you receive my acceptance?" or the deposit answer). Only statements without a question
     mark: "How do I accept?", "If I decline, do I get my money back?" go to the search as before. */
  // 16 Nov 2026: widened after mining 738 real mails (acceptances are 44% of them; this caught 230 of 327): "I wish to
  // accept", "I gladly accept", "I will accept", "I am accepting", "writing to formally accept", "this e-mail to accept the offer"
  var ACCEPT_RX = /\b(?:i|we)(?:'d| would| am|'m| have|'ve| will| shall)?(?: truly| really| very| so| gladly| happily| hereby| formally)?(?: like to| like| want to| wish to| hereby| happy to| delighted to| pleased to| glad to| excited to| thrilled to| honou?red to| writing to| writing to formally| decided to| chosen to)? (?:formally |gladly |happily )?(?:accept(?! that)\b|confirm (?:my|our) (?:acceptance|place|participation|attendance)\b|confirm that (?:i|we) (?:accept|will (?:attend|join))\b)|\bconfirm(?:ing)? (?:my|our) acceptance\b|\bwould like to accept (?:my|the|your|this) (?:offer|invitation|place|spot)\b|\b(?:i|we)(?: am|'m| are|'re) (?:happily |gladly )?accepting\b(?! that)|\bto (?:formally |hereby |happily |gladly )?accept (?:the|your|this|my|our) (?:offer|invitation|place|spot|admission)\b/i;
  var HESITANT = /\b(whether|not sure|unsure|undecided|doubts?|doubting|thinking (?:about|of)|considering|wondering|if i should|twijfel\w*|weet niet of|überlege|ob ich)\b/i;
  var DECLINE_RX = /\b(?:i|we)(?:'d| would| am|'m| have|'ve)?(?: like to| want to| hereby| writing to| decided to| to)? (?:formally )?(?:decline|withdraw|turn down)\b|\bwithdraw(?:ing)? (?:my|our) (?:acceptance|application|place)\b|\b(?:will|can|shall) (?:not|no longer) (?:be )?(?:attend|attending|join|joining|come|coming|start|starting)(?: to)? (?:msp|the (?:maastricht )?science|the program|in september|this (?:fall|autumn|september|year))|\bwon't be (?:attending|joining|coming to|starting) (?:msp|the (?:maastricht )?science|the program)|\b(?:decided|chosen) (?:not to|against) (?:attend|join|com|continu|accept|start)|\bnot (?:to )?continue with (?:my|the) application\b|\bdecline (?:the|your|my|this) (?:offer|invitation|place|spot)\b/i;
  var decision = function (t) {
    t = t.replace(/[’‘]/g, "'");
    if (/\?/.test(t) || isQ(t) || HESITANT.test(t)) return '';         // "not sure whether to accept the offer" is not a decision
    if (OTHER_INST.test(t)) return '';                                  // "I accept the offer from Leiden instead", "decline UCU and come to MSP"
    var d = DECLINE_RX.test(t) ? 'withdraw' : ACCEPT_RX.test(t) ? 'how-to-accept' : '';
    if (d === 'how-to-accept' && ACC_BLOCK.test(t)) return '';          // "I can't afford to accept", "accept the invitation to the interview"
    if (d === 'withdraw' && (DEC_BLOCK.test(t) || !MSPOBJ.test(t))) return '';   // "I hereby withdraw my complaint", "withdraw from my current bachelor"
    return d;
  };
  // guards for decision() (16 Nov 2026, red team)
  var OTHER_INST = /\b(leiden|utrecht|amsterdam|delft|groningen|rotterdam|eindhoven|tilburg|nijmegen|wageningen|twente|ucu|auc|luc|euc|ucg|ucm|ucv|ucr|university college|tu ?e|tu ?delft|another (university|programme|program|offer|school)|other (university|universities|programme|program|offers?)|elsewhere|instead)\b/i;
  var EVENTW = '|open ?day|q ?& ?a|q and a|webinar|session|event|student for a day|introduction days?|intro days?|room|housing|ssh|guesthouse|contract|waiting list|challenge|if|unless|once|too early|not yet|money|savings|request|extension|physics|chemistry|biology|maths?|subject|current (?:bachelor|study|studies|programme|university)|biomedical|february|next year|defer\\w*|postpone\\w*';   // round 9: events, housing, conditions are not the offer
  var ACC_BLOCK = new RegExp('\\b(but|however|although|afford|won\'?t let|can\'?t|cannot|unable|interview|complaint|appeal|objection' + EVENTW + ')\\b', 'i');
  var DEC_BLOCK = new RegExp('\\b(complaint|appeal|objection|interview' + EVENTW + ')\\b', 'i');
  // a decline must be about MSP: an MSP object, a reason, or the message ends with the verb (round 9: "I withdraw from my
  // current bachelor to start at MSP", "I decided not to continue with physics" are not declines)
  var MSPOBJ = /\b(msp|the offer|my offer|your offer|the place|my place|my application|the programme|the program|maastricht science|this september|in september|the invitation|because|due to|for personal reasons|for family reasons)\b|\b(decline|withdraw|turn down)[.!\s]*$/i;
  var declined = false;                                                 // the visitor declined: no "we hope to welcome you" at goodbye
  /* other message types that are not questions (16 Nov 2026, mined from 738 real applicant mails, each in at least ~1%):
     problem reports, follow-ups, interview changes and bookings, extension requests, documents sent, promises to send
     later, parents or agents, "interested in applying". Statements only (same guard as decision()); the first matching
     type wins; its route picks the answer by the words in the message. The lead says what the chat cannot do; it never
     says or implies that something was received, booked, extended or approved. Spec and tests kept locally
     (round 7; check with kinds_check.mjs). */
  var KINDS = [
    {"name": "problem", "re": "\\b(?:can'?t|cannot|can not|am unable to|was unable to|unable to|am not able to|was not able to|wasn'?t able to|couldn'?t|could not)\\b (?:\\w+ ){0,2}?(?:log ?in|sign in|open (?:the|my|it|this)|access|book|upload|join|submit|load|get into|find (?:the|my|any) (?:link|button|task|booking|slot|e-?mail|invitation|form))\\b|\\b(?:doesn'?t|does not|didn'?t|did not|won'?t|isn'?t|is not) (?:work|load|open)(?:ing)?\\b(?! out)|\\bnot working\\b|\\b(?:technical|technische) (?:issue|problem|error|glitch|difficult(?:y|ies)|probleme?)\\b|\\b(?:error message|glitch|crashe[sd])\\b|\\b(?:is|are|stays|remains) (?:still )?(?:locked|blocked|greyed out)\\b|\\b(?:werkt niet|lukt niet|kan niet inloggen|funktioniert nicht|geht nicht)\\b", "lead": "Sorry that it isn’t working. I can’t see your account or fix it from here, but this is what usually helps:", "route": [["\\b(book|booking|slot|reflex|appointment|schedul)", "booking-link-problems"], ["\\b(teams|meeting|interview|zoom|call)\\b", "nobody-joined"], ["\\b(log ?in|sign in|password|studielink|authenticat\\w*|account|mfa|inloggen)\\b", "login-problems"], ["\\bmotivation", "motivation-form-problems"], ["\\b(upload|task|portal|locked|blocked|greyed)", "task-blocked"], ["\\b(q ?& ?a|q and a|session|webinar)\\b", "online-qa"]], "other": "(no object recognised: leave it to the search, with this lead)"},
    {"name": "followup", "re": "\\bfollow(?:ing)?[- ]?up\\b|\\b(?:i )?(?:haven'?t|have not|did not|didn'?t|still (?:haven'?t|have not)) (?:yet )?(?:heard|hear|received|receive|gotten|got|get) (?:back|anything back|a reply|an answer|a response|any (?:reply|response|answer|news|update))\\b|\\bno (?:reply|answer|response) (?:yet|so far)\\b|\\bstill (?:waiting|wait) (?:for|on) (?:a |an |your )?(?:reply|answer|response|news|update)\\b|\\b(?:my|an) (?:previous|earlier|last) (?:e-?mail|mail|message)\\b|\\b(?:sent|wrote) (?:you )?(?:an? )?(?:e-?mail|mail|message) (?:last|a few|two|three|several|some|on|earlier|ago)\\b|\\bany (?:update|news) (?:on|about|regarding)\\b|\\b(?:nog )?geen (?:antwoord|reactie) (?:ontvangen|gekregen)\\b|\\b(?:noch )?keine (?:antwort|rückmeldung) (?:erhalten|bekommen)\\b", "lead": "I’m sorry you’re still waiting. I can’t see e-mails sent to the office or your file, but this tells you who handles it and when to write again:", "route": [["\\b(accept\\w*|offer|invitation)", "acceptance-received"], ["\\b(document\\w*|diploma|transcript|certificate|upload\\w*|portal|posted)", "documents-received"], ["\\b(interview|decision|result)", "when-decision"]], "other": "who-to-contact", "mail": true},
    {"name": "ivchange", "re": "\\breschedul\\w*|\\b(?:change|move|cancel|verzetten|verschieben) (?:my|the|mijn|meinen|den) (?:interview|appointment|slot|booking|time slot|gesprek|afspraak|termin)\\b|\\b(?:another|other|an alternative|a different|a later|an earlier) (?:interview )?(?:date|time|slot|moment)s? (?:for|of) (?:my|the) interview\\b|\\banother interview (?:date|time|slot)\\b|\\b(?:can'?t|cannot|can not|won'?t be able to|will not be able to|am unable to|unable to|am not able to) (?:attend|make|do|join) (?:my|the|it to (?:my|the)) (?:interview|appointment)\\b|\\b(?:i )?missed (?:my|the) (?:interview|appointment)\\b|\\b(?:interview|appointment) (?:conflicts|clashes) with\\b|\\b(?:mijn )?(?:interview|gesprek|afspraak) (?:verzetten|verplaatsen)\\b|\\b(?:termin|interview) (?:verschieben|absagen)\\b", "lead": "I can’t change bookings in the chat, but you can do it yourself with your booking link:", "route": [["\\bmissed\\b", "missed-interview"], ["\\b(no (free |available )?(slots?|dates?|times?)|none (of the|that) fit|conflict|clash)", "no-interview-slots"]], "other": "book-change-interview", "leadMissed": "Sorry to hear that. I can’t arrange a new date here, so this is what to do:", "mail": true},
    {"name": "ivbooked", "re": "\\b(?:i|we)(?:'ve| have)? (?:just |already |now |successfully )?(?:booked|scheduled|reserved|registered for|signed up for|picked|chosen|selected|planned) (?:a |an |my |the |our )?(?:new |online )?(?:interview|slot|appointment|time ?slot|interview slot)\\b|\\bmy interview is (?:booked|scheduled|planned|on)\\b|\\b(?:ik )?heb (?:een |mijn |het )?(?:interview|gesprek|afspraak|tijdslot) (?:ingepland|geboekt|gereserveerd)\\b|\\bich habe (?:einen |mein |das |den )?(?:interview|gespräch|termin) (?:gebucht|vereinbart|reserviert)\\b", "lead": "Good luck with your interview! You usually don’t get a separate confirmation by e-mail, so here is how you join on the day:", "route": [], "other": "join-interview"},
    {"name": "extension", "re": "\\b(?:request|ask for|asking for|need|apply for|would like|hope for|beg for)(?: an?| some| a little| a bit of)? (?:extension|more time|extra time|additional time|exception|deferral|postponement)\\b|\\b(?:extend|postpone|defer|delay)(?:ing)? (?:the |my )(?:\\w+ )?(?:deadline|start|place|offer|admission|decision|enrolment|enrollment|studies)\\b|\\b(?:start|begin|join) (?:msp |the programme |my studies )?(?:a year later|one year later|the following year instead)\\b|\\b(?:won'?t|will not|cannot|can'?t|am not able to|will not be able to|won'?t be able to) (?:\\w+ ){0,3}(?:make|meet) the deadline\\b|\\b(?:i )?(?:have )?missed the (?:\\w+ )?deadline\\b|\\b(?:more|extra) time to (?:decide|submit|send|upload|finish|complete)\\b|\\bgrant me (?:an? )?(?:short |small |little |brief )?(?:exceptional )?(?:extension|exception|more time|extra time)\\b|\\b(?:appreciate|be grateful for|ask for) (?:having )?(?:a (?:little|bit) |some )?(?:more|extra|additional) time\\b|\\bconsider my late (?:application|acceptance|submission)\\b|\\buitstel\\b|\\bfristverlängerung\\b|\\bum (?:eine )?verlängerung\\b", "lead": "I can’t grant extensions or exceptions in the chat: the admissions office decides that for your own case. Here is what applies:", "route": [["\\b(decide|decision|offer|accept\\w*)", "more-time-to-decide"], ["\\b(defer\\w*|postpone (?:my )?(?:start|place|studies|admission)|year later|following year|gap year)", "defer-place"], ["\\b(diploma|certified|certificate|final results|transcript|grades)", "diploma-late"], ["\\b(math\\w*|ompt|khan|calculus|proof)", "maths-proof-deadline"], ["\\binterview", "no-interview-slots"], ["\\b(requirement|exception|qualif\\w*)", "exceptions"]], "other": "deadline-passed", "mail": true},
    {"name": "docs", "re": "\\b(?:please )?find (?:attached|enclosed)\\b|\\battached (?:is|are|you(?:'ll| will) find|herewith|please find)\\b|\\b(?:i|we)(?:'ve| have)? (?:just |already |now |also |today |finally )?(?:attached|enclosed|uploaded|submitted|sent|posted|mailed|couriered|e-?mailed|handed in)\\b(?! (?:you )?(?:an? |my )?(?:e-?mail|mail|message|question|acceptance)\\b)|\\b(?:here is|here are|i am sending|i'm sending|sending you) (?:my|the)\\b(?! (?:\\S+ )?(?:student|application|contact|maastricht|e-?mail|mail|message|phone)\\b)|\\b(?:has|have) (?:now )?been (?:uploaded|submitted|sent|posted|delivered)\\b|\\bproof of payment\\b|\\b(?:i|we)(?:'ve| have)? (?:just |already )?paid\\b|\\bconfirm (?:the )?receipt\\b|\\bbijgevoegd\\b|\\bin de bijlage\\b|\\bheb (?:\\w+ ){0,3}(?:geüpload|geupload|opgestuurd|verstuurd|ingeleverd|betaald)\\b|\\bim anhang\\b|\\banbei\\b|\\bhabe (?:\\w+ ){0,3}(?:hochgeladen|geschickt|gesendet|bezahlt)\\b", "lead": "Thank you! I can’t receive files or see your application here, so here is where it should go and how to check it arrived:", "route": [["\\b(paid|payment|transferred|tuition|bank)", "payment-received"], ["\\b(math\\w*|ompt|khan|calculus|screenshot)", "maths-proof-deadline"], ["\\b(diploma|certified|certificate|courier|post(?:ed)?|dhl|tracking|waybill)", "send-certified-diploma"]], "other": "documents-received"},
    {"name": "later", "re": "\\b(?:i|we)(?:'ll| will| shall| am going to|'m going to) (?:\\w+ )?(?:send|upload|submit|forward|provide|share|post|hand in|deliver)\\b(?! (?:you )?(?:an? )?(?:e-?mail|mail|message|question)\\b)|\\bas soon as (?:i|we) (?:receive|get|have) (?:it|them|my|the)\\b|\\b(?:ik )?(?:stuur|lever) .{0,40}\\b(?:na|later)\\b|\\bzal .{0,40}(?:opsturen|sturen|uploaden|nasturen)\\b|\\b(?:ich )?(?:werde|reiche) .{0,40}(?:nachreichen|schicken|hochladen|senden)\\b", "lead": "Thanks for letting me know. I can’t note this for the office, so here is how and by when to send it:", "route": [["\\b(math\\w*|ompt|khan|calculus|screenshot)", "maths-proof-deadline"], ["\\b(english|ielts|toefl|cambridge)", "english-deadline"], ["\\b(diploma|certified|certificate|final results|results|transcript|grades)", "send-certified-diploma"]], "other": "which-deadline"},
    {"name": "parent", "re": "\\b(?:my|our) (?:son|daughter|child|kid|ward|stepson|stepdaughter|nephew|niece) (?:has|had|is|was|will|got|received|applied|wants|needs|did|would|just)\\b|\\bon behalf of (?:my|our|a|the) (?:son|daughter|child|student|client|applicant|candidate)\\b|\\bwriting (?:for|about) (?:my|our) (?:son|daughter|child)\\b|\\b(?:i am|i'm|we are|as) (?:an? |the )?(?:(?:education(?:al)?|study|admissions?|university|overseas|student) (?:agent|agency|consultant|consultancy)|(?:agent|agency|consultant|consultancy) (?:for|working with|representing|helping|that helps|who helps))\\b|\\bwe are an? (?:\\w+ )?agency\\b|\\bour (?:student|client|candidate)s? (?:has|have|is|are|would|wants?|needs?)\\b|\\bmijn (?:zoon|dochter) (?:heeft|is|wil|gaat)\\b|\\bmein(?:e)? (?:sohn|tochter) (?:hat|ist|möchte|will)\\b", "lead": "Thank you for writing on their behalf. I can’t discuss a specific application (only with the applicant), but I can explain how everything works:", "route": [], "other": "parents-counsellors"},
    {"name": "interested", "re": "\\b(?:i am|i'm|im|we are) (?:very |highly |really |particularly |quite |so )?interested in (?:applying|studying at|studying in|joining|msp|the (?:maastricht )?science programme|the science programme|your (?:programme|program|bachelor)|maastricht science)\\b|\\b(?:i|we) (?:would like|want|wish|plan|intend|hope) to (?:apply|join|study) (?:to |for |at |in )?(?:msp|the (?:maastricht )?science programme|your (?:programme|program|bachelor)|maastricht science|maastricht university)\\b|\\b(?:please )?send me (?:some |more )?(?:information|info|details|a brochure|the brochure)\\b|\\b(?:ik )?heb interesse in (?:msp|de opleiding|het maastricht science)|\\b(?:ich )?interessiere mich für (?:msp|das (?:maastricht )?science|ihr studium|den studiengang)", "lead": "Great to hear you’re interested in MSP! Here is how applying works:", "route": [["\\b(brochure|information pack|leaflet|folder)", "who-to-contact"]], "other": "how-do-i-apply"}
  ].map(function (k) { k.rx = new RegExp(k.re, 'i'); k.route = k.route.map(function (r) { return [new RegExp(r[0], 'i'), r[1]]; }); return k; });
  var DOCW = /\b(documents?|diploma|transcripts?|certificates?|cv|letter|proof|form|file|scan|copy|results|grades|passport|tuition|fees?|deposit|payment|ielts|toefl|ompt|khan|screenshot|scores?|test|attach\w*|upload\w*|bijlage|bijgevoegd|cijferlijst|cijfers|anhang|angehängt|diplom|zeugnis|noten)\b/i;
  var kindOf = function (t) {
    t = t.replace(/[’‘]/g, "'");
    if (/\?/.test(t) || isQ(t)) return null;
    for (var i = 0; i < KINDS.length; i++) {
      var k = KINDS[i], id = null;
      if (!k.rx.test(t)) continue;
      for (var j = 0; j < k.route.length; j++) if (k.route[j][0].test(t)) { id = k.route[j][1]; break; }
      if (!id && byId[k.other]) id = k.other;
      // problems with things MSP has nothing to do with: "I can't book a flight", "I can't access my bank account" (red team)
      if (id === 'booking-link-problems' && /\b(flights?|trains?|tickets?|hotels?|bus|plane|room|housing|ssh|accommodation|flat|studio)\b/i.test(t)) continue;
      if (id === 'login-problems' && /\b(bank|wise|revolut|paypal|rabobank|abn|ing|card|payment)\b/i.test(t)) continue;
      // round 9 (false alarms): each type needs its real object
      if (k.name === 'docs' && (!DOCW.test(t) || /\b(nothing|nog niet|noch nicht|not yet)\b|here(?: is|'s) the thing/i.test(t))) continue;          // "I sent my brother to the open day"
      if (k.name === 'docs' && id === 'payment-received' && !/\bpaid (?:the |my )?(?:tuition|fees?|deposit|invoice|instalment)|proof of payment|\bpayment\b/i.test(t)) continue;   // "we paid for the flight tickets"
      if (k.name === 'problem' && /\b(bank|card|wise|revolut|paypal)\b/i.test(t)) continue;                             // "my bank card is blocked"
      if (k.name === 'problem' && /\b(?:father|mother|dad|mum|mom|parents?|he|she|i(?:'m| am)?) (?:doesn'?t |does not |not )?work(?:ing)?\b|\blukt niet\b(?![^.]*\b(?:inloggen|uploaden|betalen|openen|boeken|link|portal|studielink))/i.test(t)) continue;
      if (k.name === 'extension' && /\b(dyslexi\w*|adhd|autis\w*|disabilit\w*|chronic)\b/i.test(t) && byId['disability-support']) id = 'disability-support';   // extra exam time: disability support
      if ((k.name === 'ivchange' || k.name === 'ivbooked') && /\b(ielts|toefl|cambridge|duolingo|sat|act|ssh|town hall|municipality|gemeente|ind|bank|gp|doctor|open day|q ?&|webinar)\b/i.test(t)) continue;
      if (k.name === 'later' && !DOCW.test(t) && !/\b(it|them)\b/i.test(t)) continue;                                    // "I will share a room with my sister"
      if (k.name === 'followup' && (/\b(duo|ind|ssh|bank|studielink)\b/i.test(t) || (/follow(?:ing)?[- ]?up/i.test(t) && !/follow(?:ing)?[- ]?up on (?:my|our|the) (?:\w+ )?(?:e-?mail|mail|message|question|application|request)|haven'?t heard|have not heard|no (?:reply|answer|response)|still waiting/i.test(t)))) continue;
      if (k.name === 'parent' && /\bi (?:want|would like|plan|hope) to (?:apply|study)\b|while i study|childcare/i.test(t)) continue;
      return { name: k.name, id: id, mail: !!k.mail && id !== 'disability-support', lead: k.leadMissed && id === 'missed-interview' ? k.leadMissed
        : id === 'disability-support' ? 'Extra time and other adjustments are arranged through UM’s Disability Support. Here is how:' : k.lead };
    }
    return null;
  };
  /* alternatives from the current-student and other-office topics only when the visitor is (or speaks for) a current student */
  var CURRENT = /\b((i am|i'?m|im) (a |an )?(current |first[- ]year |second[- ]year |third[- ]year )?(msp )?student|already (study|studying|enrolled)|current students?|alumni|graduated|my (son|daughter|child) (studies|is studying|is at msp)|staff)\b/i;
  var fits = function (h, t) { return h.cover >= 0.34 && (CURRENT.test(t) || !/^(For current students|Other offices and questions)$/.test(h.item.topic)); };
  var pendingPass = null;
  var unsureOf = function (h) { return h.weak === undefined ? h.cover <= 0.5 : h.weak; };     // real doubt (rules in ask.js, MSP_SEARCH)
  var mildOf = function (h) { return h.sure === false && !h.weak; };                           // in between: 'I think this is it'   // half unmatched, or a longer question with an unknown word ("my cat")
  function onText(text) {
    text = text.trim(); if (!text || busy) return;
    me(text); input.value = ''; turn++;
    // distress and safety come before everything else, also before small talk and the passport question (16 Nov 2026)
    var hurt = SAFETY.test(text) && FIRST.test(text) && !QFORM.test(text);   // "I was assaulted", not "is Maastricht unsafe?"
    var prelead = '';
    // round 9: something that happened in the past, asked as a question ("I was bullied at school, will MSP be different?"):
    // a kind sentence, then the normal answer
    if (hurt && !DANGER.test(text) && /\?/.test(text) && /\b(was|were|used to|in the past|at my old|last year|before|oude school|vroeger|ben gepest|früher|alten schule|wurde)\b/i.test(text)) { hurt = false; prelead = 'I’m sorry you went through that.'; }
    var crisis = CRISIS.test(text) && (DANGER.test(text) || !NOT_ME.test(text)) &&               // not a relative's burnout, a "trauma surgeon", "can't sleep, so excited"
      !(/can'?t take (?:it|this) anymore/i.test(text) && PORTALW.test(text) && !DANGER.test(text));  // "I can't take this anymore, the portal keeps logging me out"
    if ((crisis || hurt) && byId['wellbeing-support']) {
      worriedAt = turn; crisisAt = turn; pendingPass = null; last = { q: '', hits: [], alt: [], shown: last.shown };
      if (hurt && !crisis && byId['harassment-unsafe'])
        return answer(byId['harassment-unsafe'], '', { care: true, lead: 'I’m really sorry this happened to you. If you are in danger now, call 112. You can talk to someone confidentially, and you don’t have to handle this alone.' });
      return answer(byId['wellbeing-support'], '', { care: true, lead: (DANGER.test(text)
        ? 'I’m really sorry you’re feeling this way. If you are in danger or thinking about ending your life, please call 113 or 0800-0113 (free, day and night), or 112 in an emergency. You don’t have to deal with this alone.'
        : 'I’m really sorry you’re going through this. You don’t have to deal with it alone, and there is help.') });
    }
    var PP = window.MSP_PASSPORT, pv = passportFrom(text);
    if (pendingPass && PP) {                                     // a typed answer to "Which passport do you have?" ("I'm Dutch", "non-EU")
      var pp = pendingPass; pendingPass = null;
      if (!pv) { var bn = BARE_NAT.exec(text); if (bn) pv = bn[1] ? 'eu' : 'non'; }   // "Indian", "Dutch" typed as the answer
      if (pv) { PP.set(pv); return answer(byId[pp.id], pp.q, Object.assign({}, pp.o, { lead: '' })); }
      // the visitor typed something else instead: keep the thread (follow-ups refer to that question), and don't ask again
      lastItem = pp.id; anchor = pp.q || byId[pp.id].q; lastCtx = [pp.id].concat(byId[pp.id].next || []); passSkipped = true;
    }
    var small = chatter(text);
    if (small === 'hello') return bot('<p>Hello! Nice to meet you. What would you like to know about applying to MSP?</p>', suggestions());
    if (small === 'thanks') lastAsk = 'else';
    if (small === 'thanks') return bot('<p>You’re welcome! Is there anything else I can help you with?</p>', [{ label: 'No, that’s all', act: 'bye' }].concat(suggestions().slice(0, 3)));
    if (small === 'bye') return act({ act: 'bye', typed: true });
    for (var k = 0; k < SMALL.length; k++) if (SMALL[k][0].test(text)) return SMALL[k][1]();
    // a bare reply to the previous answer, and "ok" / a thumbs-up (16 Nov 2026, red team: "no" got the interview-slots answer)
    // round 9: a typed yes/no answers what Mosa just asked ("Anything else?" → no = goodbye; "Shall I open an e-mail?" → yes = mail)
    var asked = lastAsk; lastAsk = '';
    var YES = /^(yes|yeah|yep|yes please|ja|jawohl|oui|sure)[.!\s]*$/i, NO = /^(no|nope|nee|nein|not really|not quite|niet echt|nicht wirklich)[.!\s]*$/i;
    if (asked === 'else' && NO.test(text)) return act({ act: 'bye', typed: true });
    if (asked === 'else' && YES.test(text)) return act({ act: 'more', typed: true });
    if (asked === 'mailq' && YES.test(text)) return act({ act: 'mail', typed: true, q: last.q });
    if (asked === 'mailq' && NO.test(text)) return act({ act: 'nothanks', typed: true });
    if (lastItem && YES.test(text)) return act({ act: 'yes', typed: true });
    if (lastItem && NO.test(text)) return act({ act: 'notquite', typed: true });
    if (/^(ok(ay)?|k|alright|got it|cool|great|perfect|oké|prima|👍|🙂|😊|👌)[.!\s]*$/iu.test(text) || /^(?:that|this|it) (?:was|is) (?:really |very |so |super )?(?:helpful|useful|great|perfect)\b/i.test(text)) { lastAsk = 'else'; return bot('<p>Great! Is there anything else I can help you with?</p>', [{ label: 'No, that’s all', act: 'bye' }].concat(suggestions().slice(0, 3))); }
    if (lastItem && (/\b(?:that|this|it|you|the answer) (?:did not|didn'?t|doesn'?t|does not|isn'?t|wasn'?t) help/i.test(text) || (/\b(didn'?t|did not|not) help(ed|ful)?\b/i.test(text) && text.split(/\s+/).length <= 5))) return act({ act: 'notquite', typed: true, unhelped: true });
    if (OFFTOPIC.test(text) && !ADMWORD.test(text) && !THANKS.test(text)) return bot('<p>I can only help with questions about applying to and studying at MSP, so I’ll leave that one. Is there anything about MSP I can help with?</p>', suggestions());
    var hello = '', m = GREET.exec(text);
    if (m && text.length - m[0].length > 5) { hello = 'Hello!'; text = text.slice(m[0].length); }    // "hi, when is the deadline?"
    m = TPRE.exec(text);
    if (m && text.length - m[0].length > 5) text = text.slice(m[0].length);                          // "thanks! and what about housing?"
    if (prelead) hello = hello ? hello + ' ' + prelead : prelead;
    if (PII.test(piiClean(text))) {                               // an e-mail address, phone or ID number typed in: say so, then answer without it
      text = text.replace(new RegExp(PII.source, 'gi'), ' ').replace(/\s+/g, ' ').trim();
      var piiNote = 'Please don’t type personal details here: I can’t see your file, and nothing you type is stored.';
      if (text.replace(/[^a-zà-ɏ]/gi, '').length < 8) return bot('<p>' + piiNote + ' For your own application, write to the admissions office from the e-mail address you applied with.</p>', [{ label: 'Write to the admissions office', act: 'mail', q: '', main: true }, { label: 'Ask something else', act: 'more' }]);
      hello = hello ? hello + ' ' + piiNote : piiNote;
    }
    var dec = decision(text);                                    // "I accept the invitation" / "I'm writing to decline": a decision, not a question
    if (dec && byId[dec]) {
      last = { q: text, hits: [], alt: [], shown: last.shown };
      var acc = dec === 'how-to-accept', sad = SAD.test(text);
      if (!acc) declined = true;
      if (sad) worriedAt = turn;
      return answer(byId[dec], text, { lead: [hello, acc ? 'Congratulations, and welcome! I can’t register your acceptance in this chat, so here is how to do it:'
        : sad ? (LOSS.test(text) ? 'I’m so sorry for your loss.' : 'I’m very sorry to hear that.') + ' There is no rush; when you are ready, this is how it works. I can’t register it in the chat:'
        : 'Thank you for letting us know. I can’t register this in the chat, so here is how to do it:'].filter(Boolean).join(' '),
        alts: (acc ? [byId['offer-next-steps']] : sad ? [byId['defer-place'], byId['student-support-fund']] : [byId['defer-place']]).filter(Boolean) });
    }
    var kd = kindOf(text), kindLead = '';                         // documents sent, a problem report, a follow-up, an extension request ...
    if (kd && kd.id && byId[kd.id]) {
      last = { q: text, hits: [], alt: [], shown: last.shown };
      var kl = /\b(ridiculous|unacceptable|still (haven'?t|have not|not)|terrible|useless|frustrat\w*|angry|annoyed|fed up)\b/i.test(text)   // annoyed: no cheerful "Thank you!"
        ? kd.lead.replace(/^Thank you! /, 'I’m sorry about the trouble. ') : kd.lead;
      return answer(byId[kd.id], text, { lead: [hello, kl].filter(Boolean).join(' '), mail: kd.mail, mild: true });   // mild: no passport question first; both versions labelled
    }
    if (kd) kindLead = kd.lead;                                  // a problem report without a recognisable object: search, with this lead
    var rm = /\b(?:want|would like|plan|hope|am going|wish) to (?:apply|study|switch)\b|while i study|childcare/i.test(text) ? null : ROLE.exec(text);   // "I am a mother of two and want to study at MSP": an applicant
    if (rm) {                                                    // "I'm the mother of a prospective student" / "I'm a school counsellor"
      role = /counsel|teacher|decaan|mentor/i.test(rm[0]) ? 'counsellor' : 'parent';
      var restQ = text.replace(new RegExp(ROLE.source, 'gi'), ' ')
        .replace(/\b(of|van|von|at|from) (a |an |the |our |my )?(prospective |future |possible |international |local )?(student|applicant|pupil|leerling|school|schüler)s?\b/gi, ' ');
      var rh = SEARCH(restQ);
      if (!(/\?/.test(restQ) && rh[0] && rh[0].words >= 3 && !rh[0].weak)) return welcomeRole(role, hello, text);
      text = restQ.trim();
    }
    var warm = feeling(text);
    if (warm || /\b(stress|scared|worried|anxious|nervous|panic)/i.test(text)) worriedAt = turn;
    var switched = false;                                        // the visitor names a passport: show that version ("two of them are non-EU")
    if (pv && PP && (!PP.known() || PP.get() !== pv)) { switched = PP.known(); PP.set(pv); }
    // just a passport ("I'm Dutch", "and for non-EU?", "what if I were from Germany?"): the last passport answer again, for that group
    if (pv && PP && (!/\?/.test(text) || FOLLOW.test(text) || /\bif i (were|was)\b/i.test(text)) &&
        (SEARCH(text.replace(new RegExp(NON_RX.source, 'gi'), ' ').replace(new RegExp(EU_RX.source, 'gi'), ' ').replace(FOLLOW, ' '))[0] || { words: 0 }).words <= 1) {
      var li = lastItem && byId[lastItem] && byId[lastItem].byPassport ? { id: lastItem, q: anchor } : lastPassItem;
      if (li && byId[li.id]) return answer(byId[li.id], li.q, { chip: true, switched: true, anchor: li.q });
      return bot('<p>Thanks! From now on I’ll show you what applies with ' + esc(PP.label()) + '. What would you like to know?</p>', suggestions());
    }
    // a correction ("no, I meant the interview"): search what they meant, never the answer just given
    var cm = /^\s*(no|nope|nee|nein|sorry)\b[,.!]?\s*(i meant|i mean|ik bedoel(de)?|ich meinte?|i was asking about)\s*(for |about |the |de |het |die |den )?/i.exec(text);
    if (cm && lastItem) {
      var rest = text.slice(cm[0].length), cr = SEARCH(rest).filter(function (h) { return h.item.id !== lastItem; });
      if (!cr.length || cr[0].weak) cr = SEARCH(anchor + ' ' + rest).filter(function (h) { return h.item.id !== lastItem; });
      if (cr.length && !cr[0].weak) { last = { q: rest, hits: cr, alt: cr, shown: last.shown }; return answer(cr[0].item, rest, { lead: 'Sorry, my mistake. Here it is:', alts: cr.slice(1, 3).filter(function (h) { return fits(h, rest); }).map(function (h) { return h.item; }) }); }
    }
    // "back to the payment: did it go through?": a deliberate topic change; keep the topic word, don't glue to the last answer
    var topicSwitch = false, bm = /^\s*(ok,?\s*)?(going )?back to (the |my )?([^:,?]{2,30})[:,]\s*/i.exec(text);
    if (bm) { text = bm[4] + ' ' + text.slice(bm[0].length); topicSwitch = true; }
    var isFollow = !!(last.q && lastItem && FOLLOW.test(text));  // "and what about the others? two of them are non-EU": never split
    // two questions in one message: answer both (at most two); a statement or a feeling after a question is context, not a question
    var segs = text.replace(/\?+\s+/g, '?\u0001').replace(/\s+and also\s+/gi, '\u0001').replace(/\s*;\s*/g, '\u0001').split('\u0001')
      .map(function (s) { return s.trim(); }).filter(function (s) { return s.length > 8; });
    if (segs.length >= 2 && !isFollow) {
      var p1 = segs[0], p2 = segs[1].replace(/^(and|also|but|en|und|et)\s+/i, '');
      var A = SEARCH(p1), B = SEARCH(p2), a = A[0], b = B[0];
      var head = function () { return [hello, warm].filter(Boolean).join(' '); };
      if (!isQ(p2) && a && !a.weak && isQ(p1)) {                 // "what is the BSA? I'm scared because ..." → answer the question,
        var W2 = SEARCH(text), wa = W2[0] && W2[0].item.id !== a.item.id && !W2[0].weak ? [W2[0].item] : [];   // and offer what the whole message points to
        last = { q: p1, hits: A, alt: A, shown: last.shown };
        return answer(a.item, p1, { alts: wa.concat(A.slice(1).filter(function (h) { return h.score >= a.score * 0.6 && fits(h, text) && wa.indexOf(h.item) < 0; }).map(function (h) { return h.item; })).slice(0, 2),
          lead: head(), mild: !a.sure, switched: switched });
      }
      var frag = !b || (!b.sure && b.words <= 3 && !/\b(i|you|we|she|he|they|my|our|his|her)\b/i.test(p2));   // "…? how many hours" → one question; "…? will she have a mentor" is a second one
      // both halves must be understood, and each answer either sure or also among the whole message's top answers
      // (13 Nov 2026, real mails: a background sentence ending in '?' matched something random, or a weak half got
      // "I don't have a good answer to that part" while the other half had answered the message)
      var W0 = SEARCH(text), wtop = W0.slice(0, 5).map(function (h) { return h.item.id; });
      var backed = function (h) { return h && !h.weak && (h.sure || wtop.indexOf(h.item.id) >= 0); };
      if (isQ(p2) && !frag && a && b && a.item.id !== b.item.id && backed(a) && backed(b)) {
        last = { q: text, hits: A.concat(B), alt: A.concat(B), shown: last.shown };
        bot('<p>' + esc([hello, warm, 'You asked two things, so here they are one by one.'].filter(Boolean).join(' ')) + '</p>');
        var none = function (p, n) {
          bot('<p class="lead">' + n + ' · ' + esc(p) + '</p><p>I don’t have a good answer to that part yet. The admissions office can answer it for you personally.</p>',
            [{ label: 'Write to the admissions office', act: 'mail', q: p, main: true }, { label: 'Show me all topics', act: 'topics' }]);
        };
        if (a.weak) { none(p1, 1); return answer(b.item, p2, { lead: '2 · ' + b.item.q, mild: !b.sure }); }
        answer(a.item, p1, { lead: '1 · ' + a.item.q, more: true });
        if (b.weak) return none(p2, 2);
        return answer(b.item, p2, { lead: '2 · ' + b.item.q });
      }
    }
    var hits = SEARCH(text), first = hits[0], alone = hits, glued = '', bareAlt = null;
    // a follow-up ("and for non-EU?", "how much is that?", "how many hours") is read together with the question that produced
    // the last answer (anchor). Rewritten 16 Nov 2026 after two conversation tests (54-55% good turns):
    //  - a pronoun ("is that refundable?") always refers back, even when its own words have a confident match elsewhere
    //    ("how long does it take?" is not the interview result); answers from the previous answer's context come first;
    //  - "and ..." / "what about ..." refers back, unless its own topic has a clear answer and the glued search only
    //    finds the answer just given ("what about housing?" after the payment answer is about housing);
    //  - a short question without a pronoun counts as a follow-up only when it lands on a related answer (not the same one).
    var nw = first ? first.words : 0, back = REF.test(text) && nw <= 3, follow = FOLLOW.test(text);
    if (anchor && lastItem && !topicSwitch) {
      var known = first && first.cover >= 0.5;                  // gibberish ("qwerty zzzz") is never a follow-up
      var bareCtx = first && lastCtx.indexOf(first.item.id) >= 0;
      var shortQ = known && (nw <= 3 || (REF.test(text) && nw <= 5) || (nw <= 4 && !bareCtx));
      if (follow || switched || back || shortQ) {
        var gq = anchor + ' ' + text.replace(FOLLOW, ''), h2 = SEARCH(gq), best = h2[0], use = false;
        // second pass (16 Nov 2026, conversation re-tests): the context preference only looks at the last answer and its
        // curated next questions (not at the "Or did you mean" options), and a clear question of its own is never glued
        var near = [lastItem].concat((byId[lastItem] && byId[lastItem].next) || []);
        if (best && (back || follow)) {                          // prefer what the previous answer was about
          for (var c = 0; c < Math.min(3, h2.length); c++) if (near.indexOf(h2[c].item.id) >= 0 && h2[c].score >= h2[0].score * (back ? 0.5 : 0.8)) { best = h2[c]; break; }
        }
        if (best && follow && !back && first && first.sure && first.item.id !== lastItem) {   // "and resits?": its own sure answer, if the glued search also has it
          for (var c3 = 0; c3 < Math.min(3, h2.length); c3++) if (h2[c3].item.id === first.item.id) { best = h2[c3]; break; }
        }
        if (best && best.item.id === lastItem && !switched) {    // the same answer again: a related answer close behind is likelier
          for (var c2 = 0; c2 < Math.min(3, h2.length); c2++) if (h2[c2].item.id !== lastItem && near.indexOf(h2[c2].item.id) >= 0 && h2[c2].score >= best.score * 0.9) { best = h2[c2]; break; }
        }
        if (best) {
          var same = best.item.id === lastItem, ctx = lastCtx.indexOf(best.item.id) >= 0;
          // a clear question of its own ("and can I pay the tuition in instalments?", "and is there a scholarship for that?")
          // (third pass: a short pronoun question such as "how long does that take?" or "how do I apply for it?" still refers
          // back; only a longer one, or an "and ..." one with three content words, stands on its own)
          var selfClear = first && first.sure && !first.close && first.item.id !== lastItem && first.item.id !== best.item.id && (!back || nw >= 4 || (follow && nw >= 3));
          if (switched) use = true;
          else if (selfClear) use = false;
          else if (back) use = true;
          else if (follow) use = !(same && first && !first.weak && first.item.id !== lastItem);
          else use = ctx && !same && (!first || !first.sure || alone.slice(0, 5).some(function (h) { return h.item.id === best.item.id; }));
          // "the answer I gave you a moment ago covers that too" only when the visitor's own words also point at that answer
          // (fourth pass: a short pronoun question keeps the previous answer when that answer contains the visitor's own words:
          // "what if I miss it?" after lab safety, "how long does that take?" after the commute or disability answer)
          // ... or when its only content is a generic word ("how long should it be?", "how much is it?", "is it hard?")
          var generic = !text.toLowerCase().split(/[^a-zà-ɏ]+/).some(function (w) { return w.length >= 3 && !STOPW.test(w) && !/^(long|much|many|often|soon|late|early|hard|easy|difficult|big|old|expensive|cheap|cost|costs|take|takes|should|be|is|it|need|needed|necessary|required|enough|ok|okay|fine|possible|allowed|exactly|usually|normally|also|too)$/.test(w); });
          var keep = back && nw <= 3 && (mentions(lastItem, text) || generic);
          if (use && same && !switched && !keep && !(back && nw <= 2) && !alone.slice(0, 3).some(function (h) { return h.item.id === lastItem; })) use = false;
          if (use && same && !switched && !keep && first && first.sure && !first.close && first.item.id !== lastItem) use = false;   // "and is there a scholarship for that?"
        }
        if (use) {
          if (first && first.item.id !== best.item.id && !first.weak && fits(first, text)) bareAlt = first.item;   // offer the visitor's own reading too
          hits = [best].concat(h2.filter(function (h) { return h !== best; })); first = best; first.close = false; glued = gq;
          if (follow || switched || back || best.item.id === lastItem) { first.cover = 1; first.sure = true; first.weak = false; }
        }
      }
    }
    // an answer meant for current students only wins for someone who says they are one (16 Nov 2026)
    if (first && !CURRENT.test(text) && (first.item.topic === 'For current students' || (first.item.topic === 'Other offices and questions' && !first.sure))) {
      var alt0 = hits.filter(function (h) { return !/^(For current students|Other offices and questions)$/.test(h.item.topic) && h.score >= first.score * 0.6; })[0];
      if (alt0) { hits = [alt0].concat(hits.filter(function (h) { return h !== alt0; })); first = alt0; }
    }
    last = { q: text, hits: hits, alt: alone, shown: last.shown };
    if (!first) {
      if (turn - crisisAt <= 3) return careAgain();             // "please help" right after a distress message
      return bot('<p>' + (hello ? esc(hello) + ' ' : '') + 'I’m sorry, I don’t have a good answer to that one yet. Could you try asking it in a different way?</p>' +
        '<p>Or ask a person: for anything about <b>applying or your offer</b>, the admissions office (<a href="mailto:' + MAIL + '">' + MAIL + '</a>). ' +
        'If you are <b>already an MSP student</b>, the <a href="https://msp-faqs.nl" target="_blank" rel="noopener">MSP student FAQ</a> answers most questions, ' +
        'and Education Support helps with the rest (<a href="mailto:msp-educationsupport@maastrichtuniversity.nl">msp-educationsupport@maastrichtuniversity.nl</a>).</p>',
        [{ label: 'Write to the admissions office', act: 'mail', q: text, main: true }, { label: 'Show me all topics', act: 'topics' }]);
    }
    // two or three answers almost equally likely and none strong: ask. Not when all are weak guesses (round 9: a weak top answer
    // with "Or did you mean" buttons puts the right answer first more often, and on screen as often: reserve 77% both ways)
    if (first.close && !first.sure && !first.weak) {
      var opts = hits.filter(function (h) { return h.score >= first.score * 0.85 && fits(h, text); }).slice(0, 3);   // 16 Nov: no current-student routes in the options for an applicant
      if (opts.length < 2) opts = hits.filter(function (h) { return h.score >= first.score * 0.85; }).slice(0, 3);
      if (opts.length >= 2) return bot('<p>' + (hello ? esc(hello) + ' ' : '') + (warm ? esc(warm) + ' ' : '') + 'I want to give you the right answer. Which of these do you mean?</p>',
        opts.map(function (h) { return { label: h.item.q, act: 'ask', id: h.item.id }; }).concat([{ label: 'Something else', act: 'else', q: text, skip: opts.map(function (h) { return h.item.id; }) }]));
    }
    // a weak top hit that matches only half the words, with a full match close behind: take the full match (round 9,
    // "what about a research master in neuroscience?" got the thesis answer while masters-at-um matched every word)
    if (first.weak && !glued) {
      var full = hits.slice(1, 4).filter(function (h) { return h.cover >= 0.99 && h.score >= first.score * 0.8 && fits(h, text); })[0];
      if (full) { full.weak = false; full.sure = false; hits = [full].concat(hits.filter(function (h) { return h !== full; })); first = full; }
    }
    var alts = hits.slice(1).filter(function (h) { return h.score >= first.score * 0.6 && fits(h, text) && (!last.shown[h.item.id] || (h.item.id === lastItem && !glued)); }).slice(0, 2).map(function (h) { return h.item; });   // not answers already shown, except the one just before when this turn was read on its own
    if (first.close && !alts.length && hits[1] && fits(hits[1], text)) alts = [hits[1].item];               // two answers almost equally likely: offer the other
    if (bareAlt && bareAlt.id !== first.item.id && alts.indexOf(bareAlt) < 0) alts = [bareAlt].concat(alts).slice(0, 2);   // read as a follow-up: also offer the visitor's own reading
    answer(first.item, text, { alts: alts, unsure: unsureOf(first), mild: mildOf(first), lead: [hello, warm, kindLead].filter(Boolean).join(' '), switched: switched, anchor: glued || text });
  }
  function careAgain() {                                   // right after a distress or safety reply: repeat the help, never an admissions e-mail with those words
    return bot('<p>You don’t have to go through this alone. MSP’s student counsellors (<a href="mailto:msp-counsellors@maastrichtuniversity.nl">msp-counsellors@maastrichtuniversity.nl</a>) are there for you, confidentially. If you are in danger, call 112. If you have thoughts of ending your life, call 113 or 0800-0113 (free, day and night).</p>',
      [{ label: 'Write to the student counsellors', act: 'counsellors', main: true }, { label: 'Ask something else', act: 'more' }]);
  }
  function act(ch) {
    lastAsk = '';                                            // a click answers whatever was asked; the actions below set it again
    if (ch.act === 'passport') { me(ch.label); pendingPass = null; passSkipped = false; MSP_PASSPORT.set(ch.v); var it0 = byId[ch.pend.id]; return answer(it0, ch.pend.q, Object.assign({}, ch.pend.o, { lead: '', fromPass: true })); }
    if (ch.act === 'passport-switch') { me(ch.label); MSP_PASSPORT.set(MSP_PASSPORT.get() === 'non' ? 'eu' : 'non'); return answer(byId[ch.id], ch.q, { chip: true, switched: true }); }
    if (ch.act === 'else') {                                   // "Something else": the next answers the search found, not a dead end
      me('Something else');
      var skip = ch.skip || [];
      var more = last.hits.filter(function (h) { return skip.indexOf(h.item.id) < 0 && !last.shown[h.item.id] && fits(h, ch.q || ''); }).slice(0, 3)
        .map(function (h) { return { label: h.item.q, act: 'ask', id: h.item.id }; });
      if (more.length) return bot('<p>Maybe one of these? If not, try asking it in other words, or the admissions office can answer you personally.</p>', more.concat([{ label: 'Write to the admissions office', act: 'mail', q: ch.q }, { label: 'Show me all topics', act: 'topics' }]));
      return bot('<p>Could you tell me a bit more, in other words? Or the admissions office can answer you personally.</p>', [{ label: 'Write to the admissions office', act: 'mail', q: ch.q, main: true }, { label: 'Show me all topics', act: 'topics' }]);
    }
    if (ch.act === 'ask') { var it = byId[ch.id]; me(it.q); last.q = it.q; return answer(it, it.q, { chip: true }); }
    if (ch.act === 'counsellors') { me(ch.label || 'Write to the student counsellors'); location.href = 'mailto:msp-counsellors@maastrichtuniversity.nl'; return bot('<p>I’ve opened an e-mail to MSP’s student counsellors in your own mail program. Write as much or as little as you like; they will get back to you.</p><p>If you are in danger, please call 112. If you have thoughts of ending your life, call 113 or 0800-0113 (free, day and night).</p>', [{ label: 'Ask something else', act: 'more' }]); }
    if (ch.act === 'yes') { if (!ch.typed) me('Yes, thanks!'); lastAsk = 'else'; return bot('<p>You’re welcome! Is there anything else I can help you with?</p>', [{ label: 'No, that’s all', act: 'bye' }].concat(suggestions().slice(0, 3))); }
    if (ch.act === 'more') { if (!ch.typed) me('Something else'); return bot('<p>Sure. Type your question, or pick one of these:</p>', suggestions()); }
    if (ch.act === 'nothanks') { if (!ch.typed) me('No, thanks'); lastAsk = 'else'; return bot('<p>No problem. Is there anything else I can help you with?</p>', suggestions().slice(0, 3)); }
    if (ch.act === 'bye') { if (!ch.typed) me('That’s all'); return bot(declined
      ? '<p>Thank you, and good luck with your next step. If anything comes up, the admissions office is at <a href="mailto:' + MAIL + '">' + MAIL + '</a>.</p>'
      : '<p>Good luck with your application! If anything comes up, I’m here, and so is the admissions office at <a href="mailto:' + MAIL + '">' + MAIL + '</a>. We hope to welcome you in Maastricht.</p>'); }
    if (ch.act === 'mail') { if (!ch.typed) me(ch.label); lastAsk = 'else'; location.href = mailto(ch.q || last.q); return bot('<p>I’ve opened an e-mail for you in your own mail program. Add your name and, if you have one, your application number, and the admissions office will get back to you.</p><p>Anything else I can help with in the meantime?</p>', suggestions().slice(0, 3)); }
    if (ch.act === 'notquite') {
      if (!ch.typed) me('Not quite');
      if (turn - crisisAt <= 3) return careAgain();
      if (ch.unhelped) return bot('<p>I’m sorry I couldn’t help with that. The admissions office can answer you personally.</p>', [{ label: 'Write to the admissions office', act: 'mail', q: last.q, main: true }, { label: 'Show me all topics', act: 'topics' }]);
      var pool = (last.alt && last.alt.length ? last.alt : last.hits);           // the visitor's own words, not glued to the previous question
      var others = pool.filter(function (h) { return !last.shown[h.item.id] && fits(h, last.q); }).slice(0, 3).map(function (h) { return { label: h.item.q, act: 'ask', id: h.item.id }; });
      if (others.length) return bot('<p>Sorry about that. Maybe one of these is closer to what you mean?</p>', others.concat([{ label: 'Write to the admissions office', act: 'mail', q: last.q }]));
      lastAsk = 'mailq'; return bot('<p>Sorry about that. The admissions office can answer this for you personally. Shall I open an e-mail with your question in it?</p>', [{ label: 'Yes, write the e-mail', act: 'mail', q: last.q, main: true }, { label: 'Ask something else', act: 'more' }]);
    }
    if (ch.act === 'topics') {
      me('Show me all topics');
      return bot('<p>These are the topics I can help with. Which one?</p>', DATA.topics.map(function (t) { return { label: t, act: 'topic', t: t }; }));
    }
    if (ch.act === 'topic') {
      me(ch.t);
      var list = top.filter(function (i) { return i.topic === ch.t; }).slice(0, 8).map(function (i) { return { label: i.q, act: 'ask', id: i.id }; });
      return bot('<p>Here are the questions people ask most about ' + esc(ch.t.toLowerCase()) + ':</p>', list);
    }
  }
  function greet() {
    log.innerHTML = ''; last = { q: '', hits: [], alt: [], shown: {} }; lastItem = null; pendingPass = null; role = ''; turn = 0; worriedAt = -9;
    anchor = ''; lastPassItem = null; passSkipped = false; crisisAt = -9; declined = false; lastAsk = ''; shownLast = null;
    bot('<p>Hi! I’m Mosa, MSP’s admissions assistant. I can help you with questions about applying to the Maastricht Science Programme for September 2027: deadlines, requirements, the interview, enrolment, money, housing and more.</p><p>What would you like to know? You can type your question in your own words.</p>', suggestions());
  }

  /* ---------- open / close ---------- */
  var started = false;
  function open(afterMorph) {
    box.hidden = false; launch.hidden = true;
    setHead('idle', afterMorph !== true);          // Mosa's power-on, except right after the seal turned into Mosa on the button
    if (!started) { started = true; greet(); }
    setTimeout(function () { input.focus(); }, 50);
  }
  function close() { box.hidden = true; launch.hidden = false; launch.focus(); }
  launch.addEventListener('click', function () {
    if (morphed) return open();
    morphed = true; try { sessionStorage.setItem(MORPH_KEY, '1'); } catch (e) {}
    window.mosaMorph(launch.querySelector('.disc'));          // the seal turns into Mosa (~1.5 s); the chat opens when the eyes switch on
    launch.disabled = true;
    setTimeout(function () { launch.disabled = false; open(true); }, 1150);
  });
  input.addEventListener('input', function () { if (!busy) setHead(input.value.trim() ? 'listen' : 'idle'); });
  box.querySelector('.x').addEventListener('click', close);
  box.querySelector('.re').addEventListener('click', function () { if (!busy) greet(); });
  box.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  log.addEventListener('click', function (e) {                   // a term: show or hide its one-line explanation
    var tm = e.target.closest('.term');
    if (tm) {
      var id = tm.getAttribute('data-term'), host = tm.closest('p,li') || tm.parentNode, open1 = host.querySelector('.gloss[data-term="' + id + '"]');
      if (open1) { open1.remove(); tm.setAttribute('aria-expanded', 'false'); return; }
      var g = document.createElement('span'); g.className = 'gloss'; g.setAttribute('data-term', id); g.setAttribute('role', 'note');
      g.innerHTML = gloss(id, tm.textContent) + ' <button type="button" data-more="' + id + '">Tell me more</button>';
      host.appendChild(g); tm.setAttribute('aria-expanded', 'true'); return;
    }
    var more = e.target.closest('[data-more]');
    if (more) { if (!busy) act({ act: 'ask', id: more.getAttribute('data-more') }); return; }
    var b = e.target.closest('.readmore'); if (!b) return;                // Read more
    var r = b.previousElementSibling; if (r && r.classList.contains('rest')) r.hidden = false; b.remove();
  });
  form.addEventListener('submit', function (e) { e.preventDefault(); onText(input.value); });
  document.querySelectorAll('[data-open-chat]').forEach(function (el) { el.addEventListener('click', function (e) { e.preventDefault(); open(); }); });
  if (location.hash === '#chat') open();
  window.MSP_CHAT = { open: open, say: onText };       // used by the test script
})();
