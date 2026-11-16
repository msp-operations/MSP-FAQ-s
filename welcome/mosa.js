// Mosa, the scout probe of Ask MSP (v2, 12 Nov 2026; named Mosa 13 Nov, was Pip: Latin for the Maas). One SVG drawing, built from the MSP seal:
// globe = body, the seal's three orbits = panel seams, the centre facet = visor, leaf = solar sail, molecule = antenna.
// Only the seal's colours: navy #000831 and soft blue #BEDDF7 (UM Staalblauw / Zachtblauw), plus white.
//
// mosaSVG({ theme, state, mini, guides, still })
//   theme : 'navy' (default, for white pages) | 'white' (for dark backgrounds)
//   state : 'idle' | 'standby' | 'listen' | 'think' | 'happy' | 'handover' | 'demo' (cycles idle > think > happy)
//   mini  : simplified drawing for 40 px and smaller (no solar cells, no travelling light, thicker seams)
//   guides: construction drawing (art faded, the seal's circles and orbits dashed); implies still
//   still : no floating motion (face animations keep running)
//   crop  : tight frame without the ground shadow, for the header and the chat button (use with still)
//   head  : head only (globe + visor, no sail, antenna, pods or thruster), for avatars of 40 px and smaller (use with mini, still)
//   intro : plays the power-on once (sail unfolds, a light runs along the seams, the eyes switch on), ~1.2 s;
//           replay it with mosaReplay(svgOrContainer), e.g. each time the chat opens. Skip it when motion is reduced.
// Browser: window.mosaSVG(...). Node: require('./mosa.js').mosaSVG(...).
(function (root) {
  let n = 0;
  const THEMES = {
    navy: { b0: '#3a50ab', b1: '#16267e', b2: '#020b3e', seam: '#BEDDF7', seamOp: 0.85, sail: '#000831', cell: '#BEDDF7', cellOp: 0.7,
      part: '#000831', node: '#000831', beacon: '#BEDDF7', beaconHi: '#ffffff', pod: '#000831', podLight: '#BEDDF7',
      rimOp: 0.45, specOp: 0.16, light: '#e6f3ff', shadow: '#000831', shadowOp: 0.12, visorHi: 0.04 },
    white: { b0: '#ffffff', b1: '#f2f7fd', b2: '#c9dbef', seam: '#000831', seamOp: 0.28, sail: '#BEDDF7', cell: '#000831', cellOp: 0.45,
      part: '#BEDDF7', node: '#BEDDF7', beacon: '#ffffff', beaconHi: '#BEDDF7', pod: '#BEDDF7', podLight: '#000831',
      rimOp: 0, specOp: 0.9, light: '#4f84d6', shadow: '#BEDDF7', shadowOp: 0.2, visorHi: 0.07 },
  };
  const EYE = '#d6eafb', GLOW = '#BEDDF7';
  const LEAF = 'M0 -80 C3 -101 21 -114 46 -113 C42 -93 23 -80 0 -80 Z';
  const SPL = '.45 0 .55 1;.45 0 .55 1';
  const ease = (type, values, dur) =>
    `<animateTransform attributeName="transform" type="${type}" values="${values}" keyTimes="0;.5;1" calcMode="spline" keySplines="${SPL}" dur="${dur}" repeatCount="indefinite"/>`;
  const show = (values, keys, dur) =>
    `<animate attributeName="opacity" values="${values}" keyTimes="${keys}" calcMode="discrete" dur="${dur}" repeatCount="indefinite"/>`;
  const BLINK = '0;.2;.22;.24;.86;.88;.9;1';
  const eye = (x, y, dur) => `<g transform="translate(${x} ${y})"><g>` +
    `<animateTransform attributeName="transform" type="scale" values="1 1;1 1;1 .1;1 1;1 1;1 .1;1 1;1 1" keyTimes="${BLINK}" dur="${dur}" repeatCount="indefinite"/>` +
    `<rect x="-6" y="-10" width="12" height="20" rx="6" fill="${EYE}"/></g></g>`;

  const FACES = {
    idle: (dur = '8s', look = '0;.45;.5;.68;.73;1') =>
      `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 0;4 0;4 0;0 0;0 0" keyTimes="${look}" dur="${dur}" repeatCount="indefinite"/>` +
      eye(-13, 0, dur) + eye(13, 0, dur) + `</g>`,
    standby: () =>
      `<g><animate attributeName="opacity" values=".6;.95;.6" keyTimes="0;.5;1" calcMode="spline" keySplines="${SPL}" dur="4s" repeatCount="indefinite"/>` +
      `<path d="M-14 6 Q-19 9 -23 15" stroke="${GLOW}" stroke-width="2.2" fill="none" stroke-linecap="round"/>` +
      `<path d="M-14 6 C-12 -6 -2 -13 10 -13 C8 -2 -1 5 -14 6 Z" fill="${GLOW}"/>` +
      `<path d="M-10 2 Q-1 -5 7 -10" stroke="#00041a" stroke-width="1.4" fill="none" stroke-linecap="round"/>` +
      `<path d="M15 -11 L23 -3 L16 6" stroke="${GLOW}" stroke-width="2" fill="none" stroke-linejoin="round"/>` +
      `<circle cx="15" cy="-11" r="4.6" fill="${GLOW}"/><circle cx="23" cy="-3" r="3.2" fill="${GLOW}"/><circle cx="16" cy="6" r="3.9" fill="${GLOW}"/></g>`,
    listen: () =>
      eye(-13, -6, '6s') + eye(13, -6, '6s') +
      `<g stroke="${EYE}" stroke-width="3" stroke-linecap="round">` +
      [-10, -5, 0, 5, 10].map((x, i) => {
        const d = (0.55 + i * 0.13).toFixed(2) + 's', lo = 12 + (i % 3) * 2, hi = 24 - (i % 3) * 2;
        return `<line x1="${x}" x2="${x}" y1="16" y2="20"><animate attributeName="y1" values="16;${lo};16" dur="${d}" repeatCount="indefinite"/>` +
          `<animate attributeName="y2" values="20;${hi};20" dur="${d}" repeatCount="indefinite"/></line>`;
      }).join('') + `</g>`,
    think: () =>
      `<rect x="-1" y="-34" width="2" height="68" fill="${EYE}" opacity=".35"><animate attributeName="x" values="-38;36;-38" dur="2.4s" repeatCount="indefinite"/></rect>` +
      [-12, 0, 12].map((x, i) => `<circle cx="${x}" cy="1" r="4.2" fill="${EYE}"><animate attributeName="cy" values="2;-5;2;2" keyTimes="0;.25;.5;1" dur="1s" begin="${(i * 0.16).toFixed(2)}s" repeatCount="indefinite"/></circle>`).join(''),
    happy: () =>
      `<g fill="none" stroke="${EYE}" stroke-linecap="round" stroke-linejoin="round"><path d="M-21 2 L-13 -7 L-5 2" stroke-width="4.6"/><path d="M5 2 L13 -7 L21 2" stroke-width="4.6"/>` +
      `<path d="M-6 12 Q0 17 6 12" stroke-width="3"/></g>`,
    handover: () =>
      `<g transform="translate(5 -6)">${eye(-13, 0, '7s')}${eye(13, 0, '7s')}</g>` +
      `<g fill="none" stroke="${EYE}" stroke-width="2" stroke-linejoin="round"><rect x="1" y="13" width="16" height="11" rx="1.5"/><path d="M1.5 14 L9 20 L16.5 14"/>` +
      `<animate attributeName="opacity" values="1;.35;1" dur="1.8s" repeatCount="indefinite"/></g>`,
  };
  FACES.demo = () =>
    `<g>${show('1;0;1', '0;.5;.78', '12s')}${FACES.idle('12s', '0;.3;.33;.42;.45;1')}</g>` +
    `<g opacity="0">${show('0;1;0', '0;.5;.66', '12s')}${FACES.think()}</g>` +
    `<g opacity="0">${show('0;1;0', '0;.66;.78', '12s')}${FACES.happy()}</g>`;

  function mosaSVG(o) {
    o = o || {};
    const theme = THEMES[o.theme] ? o.theme : 'navy', t = THEMES[theme];
    const u = 'mosa' + (++n) + theme[0];
    const mini = !!o.mini, guides = !!o.guides, still = !!o.still || guides, head = !!o.head, intro = !!o.intro && !guides;
    const face = (FACES[o.state] || FACES.idle)();

    const defs = `<defs>
<radialGradient id="${u}b" cx="34%" cy="28%" r="80%"><stop offset="0" stop-color="${t.b0}"/><stop offset=".55" stop-color="${t.b1}"/><stop offset="1" stop-color="${t.b2}"/></radialGradient>
<linearGradient id="${u}v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1445"/><stop offset="1" stop-color="#00030f"/></linearGradient>
<filter id="${u}g" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<filter id="${u}s" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="5"/></filter>
<clipPath id="${u}c"><circle r="62"/></clipPath>
<clipPath id="${u}1"><ellipse rx="74.5" ry="31.5"/></clipPath>
<clipPath id="${u}2"><ellipse rx="74.5" ry="31.5" transform="rotate(60)"/></clipPath>
<clipPath id="${u}3"><ellipse rx="74.5" ry="31.5" transform="rotate(120)"/></clipPath>
<clipPath id="${u}l"><path d="${LEAF}"/></clipPath>
</defs>`;

    const ground = mini ? '' :
      `<ellipse cx="0" cy="104" rx="38" ry="5.5" fill="${t.shadow}" opacity="${t.shadowOp}">${still ? '' :
        `<animate attributeName="rx" values="38;30;38" keyTimes="0;.5;1" calcMode="spline" keySplines="${SPL}" dur="3.2s" repeatCount="indefinite"/>`}</ellipse>`;

    const thruster =
      `<ellipse cx="0" cy="76" rx="15" ry="7" fill="${GLOW}" opacity=".6" filter="url(#${u}s)"><animate attributeName="opacity" values=".4;.85;.4" dur="1.6s" repeatCount="indefinite"/></ellipse>` +
      `<path d="M-14 55 L14 55 L10 68 L-10 68 Z" fill="${t.part}"/>` +
      `<ellipse cx="0" cy="69" rx="8" ry="2.4" fill="#ffffff" opacity=".9"/>`;

    const pods =
      `<rect x="-71" y="-13" width="12" height="30" rx="6" fill="${t.pod}"/><rect x="59" y="-13" width="12" height="30" rx="6" fill="${t.pod}"/>` +
      `<rect x="-67.5" y="-6" width="3" height="16" rx="1.5" fill="${t.podLight}"/><rect x="64.5" y="-6" width="3" height="16" rx="1.5" fill="${t.podLight}"/>`;

    const cells = mini ? '' :
      `<g clip-path="url(#${u}l)" stroke="${t.cell}" stroke-opacity="${t.cellOp}" stroke-width="1.3"><g transform="rotate(-35.6 0 -80) translate(0 -80)">` +
      [11, 21, 31, 41, 51].map(x => `<line x1="${x}" y1="-20" x2="${x}" y2="20"/>`).join('') +
      `<line x1="-5" y1="-7" x2="62" y2="-7"/><line x1="-5" y1="7" x2="62" y2="7"/></g></g>`;
    const sail = `<g>${still ? '' : ease('rotate', '-3 0 -61;3 0 -61;-3 0 -61', '4.4s')}` +
      `<line x1="0" y1="-58" x2="0" y2="-81" stroke="${t.part}" stroke-width="4.5" stroke-linecap="round"/>` +
      `<path d="${LEAF}" fill="${t.sail}"/>${cells}` +
      `<path d="M3 -82 L44 -111.5" stroke="${t.cell}" stroke-opacity="${mini ? 0.6 : 0.95}" stroke-width="1.8" stroke-linecap="round"/></g>`;

    const antenna =
      `<path d="M42 -40 L58 -54 L69 -62 L62 -75" stroke="${t.part}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>` +
      `<circle cx="58" cy="-54" r="4.6" fill="${t.node}"/><circle cx="69" cy="-62" r="3.4" fill="${t.node}"/>` +
      `<circle cx="62" cy="-75" r="6.2" fill="${t.beacon}" stroke="${t.part}" stroke-width="2.2">` +
      `<animate attributeName="fill" values="${t.beacon};${t.beaconHi};${t.beacon};${t.beacon}" keyTimes="0;.12;.3;1" dur="2.6s" repeatCount="indefinite"/></circle>`;

    const body = `<circle r="62" fill="url(#${u}b)"/>`;
    const seams = `<g clip-path="url(#${u}c)" fill="none" stroke="${t.seam}" stroke-opacity="${mini ? Math.min(1, t.seamOp + 0.15) : t.seamOp}" stroke-width="${mini ? 5 : 3}">` +
      `<ellipse rx="76" ry="33"/><ellipse rx="76" ry="33" transform="rotate(60)"/><ellipse rx="76" ry="33" transform="rotate(120)"/></g>`;
    const travel = mini ? '' :
      `<g clip-path="url(#${u}c)"><g transform="rotate(60)"><circle r="2.6" fill="${t.light}" filter="url(#${u}g)">` +
      `<animateMotion path="M-76 0 A76 33 0 1 1 76 0 A76 33 0 1 1 -76 0" dur="6s" repeatCount="indefinite"/></circle></g></g>`;
    const shine = (mini || !t.rimOp ? '' : `<path d="M55.4 20.2 A59 59 0 0 1 15.3 57" stroke="${GLOW}" stroke-opacity="${t.rimOp}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`) +
      `<ellipse cx="-29" cy="-37" rx="14" ry="7" transform="rotate(-38 -29 -37)" fill="#ffffff" opacity="${t.specOp}"/>`;
    const visor = `<g clip-path="url(#${u}1)"><g clip-path="url(#${u}2)"><g clip-path="url(#${u}3)">` +
      `<rect x="-40" y="-40" width="80" height="80" fill="url(#${u}v)"/><ellipse cx="-12" cy="-25" rx="22" ry="7" fill="#ffffff" opacity="${t.visorHi}"/>` +
      `<g>${intro ? `<animateTransform attributeName="transform" type="scale" values="1 0;1 0;1 1.18;1 1" keyTimes="0;.55;.8;1" dur="1.2s" begin="0s" fill="freeze"/>` : ''}` +
      `<g filter="url(#${u}g)">${face}</g></g>` +
      (intro ? `<rect x="-40" y="-40" width="80" height="80" fill="${GLOW}" opacity="0"><animate attributeName="opacity" values="0;0;.35;0" keyTimes="0;.5;.62;1" dur="1.2s" begin="0s" fill="freeze"/></rect>` : '') +
      `</g></g></g>`;
    // power-on: a light runs once along the three seams
    const sweep = !intro ? '' :
      `<g clip-path="url(#${u}c)" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round" filter="url(#${u}g)" opacity="0">` +
      `<animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.1;.75;1" dur="1.1s" begin=".1s" fill="freeze"/>` +
      [0, 60, 120].map((r, i) => `<ellipse rx="76" ry="33" transform="rotate(${r})" pathLength="100" stroke-dasharray="16 100">` +
        `<animate attributeName="stroke-dashoffset" values="${i * 12};${i * 12 - 116}" dur="1.1s" begin=".1s" fill="freeze"/></ellipse>`).join('') + `</g>`;
    // power-on: the leaf sail unfolds from the mast
    const sailIn = !intro ? sail :
      `<g><animateTransform attributeName="transform" type="rotate" values="-75 0 -58;10 0 -58;0 0 -58" keyTimes="0;.7;1" calcMode="spline" keySplines=".3 0 .4 1;.4 0 .6 1" dur=".9s" begin="0s" fill="freeze"/>${sail}</g>`;

    const guideArt = !guides ? '' :
      `<g fill="none" stroke="#3f6fd1" stroke-width="1.2" stroke-dasharray="4 4">` +
      `<line x1="-100" y1="0" x2="100" y2="0" stroke-dasharray="2 6"/><line x1="0" y1="-120" x2="0" y2="100" stroke-dasharray="2 6"/>` +
      `<circle r="62"/><ellipse rx="76" ry="33"/><ellipse rx="76" ry="33" transform="rotate(60)"/><ellipse rx="76" ry="33" transform="rotate(120)"/>` +
      `<path d="${LEAF}"/><circle cx="62" cy="-75" r="11"/></g>` +
      `<g fill="#3f6fd1" font-family="Hanken Grotesk, Arial, sans-serif" font-size="9" font-weight="700">` +
      `<text x="-96" y="-58">1</text><text x="80" y="-8">2</text><text x="-5" y="45">3</text><text x="50" y="-114">4</text><text x="80" y="-82">5</text></g>`;

    const art = `<g opacity="${guides ? 0.3 : 1}">${head ? '' : thruster + pods + sailIn + antenna}${body}${seams}${travel}${sweep}${shine}${visor}</g>`;
    const moving = still ? art + guideArt :
      `<g>${ease('translate', '0 0;0 -8;0 0', '3.2s')}<g>${ease('rotate', '-2 0 0;2 0 0;-2 0 0', '6.4s')}${art}</g></g>`;
    const vb = head ? '-66 -66 132 132' : o.crop ? '-76 -118 152 192' : '-110 -124 220 240';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" role="img" aria-label="Mosa, the scout probe of Ask MSP">${defs}${head || o.crop ? '' : ground}${moving}</svg>`;
  }

  // Replays the power-on of a Mosa drawn with intro:true (pass the <svg> or an element that contains it).
  function mosaReplay(el) {
    const s = svgOf(el);
    if (s && s.setCurrentTime) s.setCurrentTime(0);
  }
  function svgOf(el) { return el && (el.tagName && el.tagName.toLowerCase() === 'svg' ? el : el.querySelector && el.querySelector('svg')); }

  // ---------- The seal that turns into Mosa ----------
  // mosaMorphSVG({ sealSrc, float }) draws the real MSP seal (the PNG at sealSrc, navy on transparent) on a white disc.
  // mosaMorph(el) starts the change (about 1.5 s): the text ring spins away, the globe becomes Mosa's body, the seal's
  // leaf flies up and becomes the solar sail, the molecule moves out and becomes the antenna, the visor appears and the
  // eyes switch on. Ends as navy Mosa, idle. float:true lets Mosa hover afterwards. viewBox -100..100 (square).
  // The seal's geometry was measured on msp-seal-navy.png (480x484): globe centre (241, 241.5), radius 173, ring to 241.
  const SEAL_LEAF = 'M-14.3 5.6 C-12.5 -4 4 -7.5 15.7 -6 C9 8 -8 13 -14.3 5.6 Z';
  function mosaMorphSVG(o) {
    o = o || {};
    const t = THEMES.navy, u = 'pm' + (++n), src = o.sealSrc || 'msp-seal-navy.png';
    const S = 62 / 173, IW = (480 * S).toFixed(2), IH = (484 * S).toFixed(2), IX = (-241 * S).toFixed(2), IY = (-241.5 * S).toFixed(2);
    const LOGO_NAVY = '#051c3c', K = '.4 0 .2 1';
    const at = s => `${u}m.begin+${s}s`;
    const go = (attr, from, to, start, dur) =>
      `<animate attributeName="${attr}" from="${from}" to="${to}" begin="${at(start)}" dur="${dur}s" fill="freeze" calcMode="spline" keyTimes="0;1" keySplines="${K}"/>`;
    const goT = (type, from, to, start, dur) =>
      `<animateTransform attributeName="transform" type="${type}" from="${from}" to="${to}" begin="${at(start)}" dur="${dur}s" fill="freeze" calcMode="spline" keyTimes="0;1" keySplines="${K}"/>`;

    const defs = `<defs>
<radialGradient id="${u}b" cx="34%" cy="28%" r="80%"><stop offset="0" stop-color="${t.b0}"/><stop offset=".55" stop-color="${t.b1}"/><stop offset="1" stop-color="${t.b2}"/></radialGradient>
<linearGradient id="${u}v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1445"/><stop offset="1" stop-color="#00030f"/></linearGradient>
<filter id="${u}g" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<filter id="${u}s" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="5"/></filter>
<clipPath id="${u}c"><circle r="62"/></clipPath>
<clipPath id="${u}gc"><circle r="63.6"/></clipPath>
<clipPath id="${u}1"><ellipse rx="74.5" ry="31.5"/></clipPath>
<clipPath id="${u}2"><ellipse rx="74.5" ry="31.5" transform="rotate(60)"/></clipPath>
<clipPath id="${u}3"><ellipse rx="74.5" ry="31.5" transform="rotate(120)"/></clipPath>
<clipPath id="${u}l"><path d="${LEAF}"/></clipPath>
<mask id="${u}rm"><circle r="100" fill="#fff"/><circle r="63.6" fill="#000"/></mask>
</defs>`;

    // Mosa's parts, each starting in its seal position
    const thruster = `<g opacity="0">${go('opacity', 0, 1, 0.8, 0.3)}${goT('translate', '0 -10', '0 0', 0.8, 0.35)}` +
      `<ellipse cx="0" cy="76" rx="15" ry="7" fill="${GLOW}" opacity=".6" filter="url(#${u}s)"><animate attributeName="opacity" values=".4;.85;.4" dur="1.6s" begin="${at(1.1)}" repeatCount="indefinite"/></ellipse>` +
      `<path d="M-14 55 L14 55 L10 68 L-10 68 Z" fill="${t.part}"/><ellipse cx="0" cy="69" rx="8" ry="2.4" fill="#ffffff" opacity=".9"/></g>`;
    const pod = (x, lx, dx) => `<g opacity="0">${go('opacity', 0, 1, 0.75, 0.3)}${goT('translate', `${dx} 0`, '0 0', 0.75, 0.35)}` +
      `<rect x="${x}" y="-13" width="12" height="30" rx="6" fill="${t.pod}"/><rect x="${lx}" y="-6" width="3" height="16" rx="1.5" fill="${t.podLight}"/></g>`;
    const body = `<circle r="62" fill="url(#${u}b)"/><circle r="62" fill="${LOGO_NAVY}">${go('opacity', 1, 0, 0.3, 0.45)}</circle>`;
    const seams = `<g clip-path="url(#${u}c)" fill="none" stroke="#ffffff" stroke-width="3">${go('stroke', '#ffffff', '#BEDDF7', 0.3, 0.45)}` +
      `<animate attributeName="stroke-opacity" from="1" to="${t.seamOp}" begin="${at(0.3)}" dur=".45s" fill="freeze"/>` +
      `<ellipse rx="76" ry="33"/><ellipse rx="76" ry="33" transform="rotate(60)"/><ellipse rx="76" ry="33" transform="rotate(120)"/></g>`;
    const shine = `<g opacity="0">${go('opacity', 0, 1, 0.45, 0.4)}` +
      `<path d="M55.4 20.2 A59 59 0 0 1 15.3 57" stroke="${GLOW}" stroke-opacity="${t.rimOp}" stroke-width="2.5" fill="none" stroke-linecap="round"/>` +
      `<ellipse cx="-29" cy="-37" rx="14" ry="7" transform="rotate(-38 -29 -37)" fill="#ffffff" opacity="${t.specOp}"/></g>`;
    const travel = `<g clip-path="url(#${u}c)" opacity="0">${go('opacity', 0, 1, 1.2, 0.3)}<g transform="rotate(60)"><circle r="2.6" fill="${t.light}" filter="url(#${u}g)">` +
      `<animateMotion path="M-76 0 A76 33 0 1 1 76 0 A76 33 0 1 1 -76 0" dur="6s" repeatCount="indefinite"/></circle></g></g>`;
    const visor = `<g opacity="0">${go('opacity', 0, 1, 0.85, 0.3)}` +
      `<g clip-path="url(#${u}1)"><g clip-path="url(#${u}2)"><g clip-path="url(#${u}3)">` +
      `<rect x="-40" y="-40" width="80" height="80" fill="url(#${u}v)"/><ellipse cx="-12" cy="-25" rx="22" ry="7" fill="#ffffff" opacity="${t.visorHi}"/>` +
      `<g transform="scale(1 0)"><animateTransform attributeName="transform" type="scale" values="1 0;1 1.18;1 1" keyTimes="0;.65;1" begin="${at(1.05)}" dur=".4s" fill="freeze"/>` +
      `<g filter="url(#${u}g)">${FACES.idle()}</g></g>` +
      `<rect x="-40" y="-40" width="80" height="80" fill="${GLOW}" opacity="0"><animate attributeName="opacity" values="0;.35;0" begin="${at(1.05)}" dur=".5s" fill="freeze"/></rect>` +
      `</g></g></g></g>`;
    // stem -> mast, leaf -> sail
    const mast = `<path d="M-14.3 5.6 Q-21 7 -22.4 17.7" stroke="#ffffff" stroke-width="2.6" fill="none" stroke-linecap="round">` +
      go('d', 'M-14.3 5.6 Q-21 7 -22.4 17.7', 'M0 -80 Q0 -69 0 -58', 0.3, 0.75) + go('stroke', '#ffffff', t.part, 0.4, 0.5) + go('stroke-width', 2.6, 4.5, 0.3, 0.75) + `</path>`;
    const sail = `<path d="${SEAL_LEAF}" fill="#ffffff">${go('d', SEAL_LEAF, LEAF, 0.3, 0.75)}${go('fill', '#ffffff', t.sail, 0.45, 0.5)}</path>` +
      `<g opacity="0">${go('opacity', 0, 1, 0.95, 0.3)}<g clip-path="url(#${u}l)" stroke="${t.cell}" stroke-opacity="${t.cellOp}" stroke-width="1.3">` +
      `<g transform="rotate(-35.6 0 -80) translate(0 -80)">${[11, 21, 31, 41, 51].map(x => `<line x1="${x}" y1="-20" x2="${x}" y2="20"/>`).join('')}` +
      `<line x1="-5" y1="-7" x2="62" y2="-7"/><line x1="-5" y1="7" x2="62" y2="7"/></g></g>` +
      `<path d="M3 -82 L44 -111.5" stroke="${t.cell}" stroke-opacity=".95" stroke-width="1.8" stroke-linecap="round"/></g>`;
    // molecule -> antenna (big atom -> beacon)
    const BOND0 = 'M26 12.4 L26 12.4 L37.3 -0.5 L22.8 -15.6', BOND1 = 'M42 -40 L58 -54 L69 -62 L62 -75';
    const node = (x0, y0, r0, x1, y1, r1, f1, extra) => `<circle cx="${x0}" cy="${y0}" r="${r0}" fill="#ffffff"${extra || ''}>` +
      go('cx', x0, x1, 0.35, 0.75) + go('cy', y0, y1, 0.35, 0.75) + go('r', r0, r1, 0.35, 0.75) + go('fill', '#ffffff', f1, 0.5, 0.5);
    const antenna = `<path d="${BOND0}" stroke="#ffffff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">` +
      go('d', BOND0, BOND1, 0.35, 0.75) + go('stroke', '#ffffff', t.part, 0.5, 0.5) + go('stroke-width', 2, 3.2, 0.35, 0.75) + `</path>` +
      node(26, 12.4, 5.2, 58, -54, 4.6, t.node) + `</circle>` +
      node(37.3, -0.5, 3.9, 69, -62, 3.4, t.node) + `</circle>` +
      node(22.8, -15.6, 6.45, 62, -75, 6.2, t.beacon, ` stroke="${t.part}" stroke-width="0"`) + go('stroke-width', 0, 2.2, 0.7, 0.4) +
      `<animate attributeName="fill" values="${t.beacon};${t.beaconHi};${t.beacon};${t.beacon}" keyTimes="0;.12;.3;1" dur="2.6s" begin="${at(1.5)}" repeatCount="indefinite"/></circle>`;

    // Mosa ends a little smaller and lower than the seal, so the sail stays inside a round button
    const mosa = `<g>${goT('translate', '0 0', '0 12', 0.3, 0.75)}<g>${goT('scale', '1', '0.85', 0.3, 0.75)}` +
      (o.float ? `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -8;0 0" keyTimes="0;.5;1" calcMode="spline" keySplines="${SPL}" dur="3.2s" begin="${at(1.6)}" repeatCount="indefinite"/>` : '<g>') +
      thruster + pod(-71, -67.5, 10) + pod(59, 64.5, -10) + body + seams + travel + shine + visor + mast + sail + antenna + `</g></g></g>`;
    // the real seal on top: globe (on a white disc, so its cuts show white) and the text ring, which spins away
    const seal = `<g clip-path="url(#${u}gc)">${go('opacity', 1, 0, 0.05, 0.3)}<circle r="64" fill="#ffffff"/>` +
      `<image href="${src}" x="${IX}" y="${IY}" width="${IW}" height="${IH}"/></g>` +
      `<g mask="url(#${u}rm)"><g>${go('opacity', 1, 0, 0.1, 0.4)}<g>${goT('rotate', '0', '110', 0, 0.55)}<g>${goT('scale', '1', '1.22', 0, 0.55)}` +
      `<image href="${src}" x="${IX}" y="${IY}" width="${IW}" height="${IH}"/></g></g></g></g>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-100 -100 200 200" role="img" aria-label="The MSP seal, which turns into Mosa" data-morph="${u}m">` +
      `${defs}<set id="${u}m" attributeName="visibility" to="visible" begin="indefinite"/>${mosa}${seal}</svg>`;
  }
  // Starts the change from seal to Mosa (once). Pass the <svg> or an element that contains it.
  function mosaMorph(el) {
    const s = svgOf(el), id = s && s.getAttribute('data-morph'), trig = id && s.getElementById(id);
    if (trig && !s.hasAttribute('data-morphed')) { s.setAttribute('data-morphed', ''); trig.beginElement(); }
  }

  root.mosaSVG = mosaSVG;
  root.mosaReplay = mosaReplay;
  root.mosaMorphSVG = mosaMorphSVG;
  root.mosaMorph = mosaMorph;
  if (typeof module !== 'undefined' && module.exports) module.exports = { mosaSVG, mosaReplay, mosaMorphSVG, mosaMorph };
})(typeof window !== 'undefined' ? window : globalThis);
