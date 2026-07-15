// ─────────────────────────────────────────────────────────────────────────
//  Builds content.json (what the app shows) from the master FAQ document.
//  Source:  ESD/_Inventory/Knowledge Base/MSP Student FAQ - MASTER.md
//  Run:     node tools/convert.mjs
//  Edit the OFFICES / topic maps below only when adding a new office or topic.
//  To change an ANSWER, edit the master document, not this file.
// ─────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';

const SRC = 'c:/dev/ESD/_Inventory/Knowledge Base/MSP Student FAQ - MASTER.md';
const OUT = 'c:/dev/MSP-FAQ-s/content.json';

const raw = fs.readFileSync(SRC, 'utf8');
const lines = raw.split(/\r?\n/);

// Office (## header substring) -> {key, name, mailbox}
const OFFICES = [
  { m: 'Admissions',                        key: 'admissions', name: 'Admissions',                    mailbox: 'msp-admissions@maastrichtuniversity.nl' },
  { m: 'Introduction Days and Life',        key: 'intro',      name: 'MSP (Introduction)',            mailbox: 'msp-educationsupport@maastrichtuniversity.nl' },
  { m: 'Education Support Department',       key: 'esd',        name: 'Education Support Department',   mailbox: 'msp-educationsupport@maastrichtuniversity.nl' },
  { m: 'Student Service Centre',            key: 'ssc',        name: 'Student Service Centre',        mailbox: 'study@maastrichtuniversity.nl' },
  { m: 'Board of Examiners',               key: 'boe',        name: 'Board of Examiners',            mailbox: 'msp-boe@maastrichtuniversity.nl' },
  { m: 'Bachelor Thesis Research',         key: 'btr',        name: 'BTR Office',                    mailbox: 'msp-btr@maastrichtuniversity.nl' },
  { m: 'Study Advising and Student Counsellor', key: 'counsellor', name: 'Student Counsellor',        mailbox: 'msp-counsellors@maastrichtuniversity.nl' },
  { m: 'Exams Office',                      key: 'exams',      name: 'Exams Office',                  mailbox: 'msp-exams@maastrichtuniversity.nl' },
  { m: 'International Relations Office',    key: 'iro',        name: 'International Relations Office', mailbox: 'msp-educationsupport@maastrichtuniversity.nl' },
  { m: 'Academic Advising',                key: 'aa',         name: 'Academic Advising',             mailbox: 'msp-academicadvising@maastrichtuniversity.nl' },
  { m: 'ICTS',                             key: 'icts',       name: 'ICTS Servicedesk',              mailbox: '' },
  { m: 'Other MSP topics',                 key: 'msp',        name: 'MSP',                           mailbox: 'msp-educationsupport@maastrichtuniversity.nl' },
  { m: 'Forms and useful links',           key: 'forms',      name: 'Forms & Links',                 mailbox: '' },
];

// Topic assignment. Default per office, with category + keyword overrides.
const OFFICE_TOPIC = {
  admissions: 'Getting In', intro: 'Getting Started', esd: 'Courses & Registration',
  ssc: 'Money & Practical', boe: 'Exams & Grades', btr: 'Thesis (BTR)',
  counsellor: 'Wellbeing & Support', exams: 'Exams & Grades', iro: 'Going Abroad',
  aa: 'Courses & Registration', icts: 'IT & Accounts',
  msp: 'Getting Started', forms: 'Forms & Links',
};
const CAT_TOPIC = {
  'Documentation & Certificates': 'Graduation & Diploma',
  'Documentation and Certificates': 'Graduation & Diploma',
  'Student Services & Support': 'Wellbeing & Support',
  'Graduation Requirements': 'Graduation & Diploma',
  'Financial Matters': 'Money & Practical',
  'Registration and Re-registration': 'Money & Practical',
  'Academic Performance and Support': 'Exams & Grades',
};
function topicFor(officeKey, category, q) {
  const t = q.toLowerCase();
  if (category === 'Questions Redirected to Other Offices') {
    if (/exam|grade|resit/.test(t)) return 'Exams & Grades';
    if (/wifi|ict|password|login|authentication|mfa|print/.test(t)) return 'IT & Accounts';
    return 'Courses & Registration';
  }
  if (CAT_TOPIC[category]) return CAT_TOPIC[category];
  return OFFICE_TOPIC[officeKey] || 'General';
}

const TAG_WORDS = ['waiver','resit','grade','transcript','diploma','graduation','abroad','exchange','btr','thesis','housing','visa','tuition','bsa','exam','timetable','registration','attendance','canvas','wifi','password','insurance','cum laude','fraud','appeal','deadline','ects','scholarship','municipality'];

const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'').slice(0,60);

const isHeading = l => /^##\s+/.test(l);
const isSub = l => /^###\s+/.test(l);
const qMatch = l => { const m = l.trim().match(/^\*\*(.+?)\*\*$/); return m ? m[1].trim() : null; };

let office = null, category = null, entries = [], cur = null;
const seenIds = new Set();

function flush() {
  if (!cur) return;
  let ans = cur.aLines.join('\n').trim();
  const notes = [];
  ans = ans.replace(/\[NEEDS MARTIJN:([^\]]*)\]/g, (_, g) => { notes.push(g.trim()); return ''; })
           .replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  if (ans) {
    let id = slug(cur.q); let n = 2; while (seenIds.has(id)) id = slug(cur.q) + '-' + n++;
    seenIds.add(id);
    const hay = (cur.q + ' ' + ans).toLowerCase();
    const tags = TAG_WORDS.filter(w => hay.includes(w));
    entries.push({ id, q: cur.q, a: ans, topic: cur.topic, office: cur.office, category: cur.category, tags, note: notes.join(' | ') || undefined });
  }
  cur = null;
}

for (const line of lines) {
  if (isHeading(line)) {
    flush();
    const title = line.replace(/^##\s+/, '').trim();
    if (/^contents$/i.test(title)) { office = null; continue; }
    const o = OFFICES.find(o => title.includes(o.m));
    office = o || null; category = null; continue;
  }
  if (isSub(line)) { flush(); category = line.replace(/^###\s+/, '').trim(); continue; }
  if (!office) continue;
  const q = qMatch(line);
  if (q) { flush(); cur = { q, aLines: [], office: office.key, category: category || '', topic: topicFor(office.key, category || '', q) }; continue; }
  if (cur) cur.aLines.push(line);
}
flush();

const officesOut = {};
for (const o of OFFICES) officesOut[o.key] = { name: o.name, mailbox: o.mailbox };

// topic ordering + emoji
const TOPICS = [
  ['Getting In','🎓'],['Getting Started','🧭'],['Courses & Registration','📚'],
  ['Exams & Grades','📝'],['Thesis (BTR)','🔬'],['Going Abroad','✈️'],
  ['Graduation & Diploma','🎉'],['Wellbeing & Support','💬'],['Money & Practical','💶'],
  ['IT & Accounts','💻'],['Forms & Links','🔗'],['General','❓'],
];
const present = new Set(entries.map(e => e.topic));
const topics = TOPICS.filter(([t]) => present.has(t)).map(([name, emoji]) => ({
  name, emoji, count: entries.filter(e => e.topic === name).length,
}));

const out = { meta: { title: 'MSP Student FAQ', ay: '2025-2026', generated: new Date().toISOString().slice(0,10), count: entries.length }, topics, offices: officesOut, faqs: entries };
fs.writeFileSync(OUT, JSON.stringify(out, null, 2), 'utf8');

console.log('Entries:', entries.length);
console.log('With internal notes (NEEDS MARTIJN):', entries.filter(e => e.note).length);
console.log('\nBy topic:');
for (const t of topics) console.log('  ' + t.count.toString().padStart(3) + '  ' + t.name);
console.log('\nBy office:');
for (const o of OFFICES) { const c = entries.filter(e => e.office === o.key).length; if (c) console.log('  ' + c.toString().padStart(3) + '  ' + o.name); }
