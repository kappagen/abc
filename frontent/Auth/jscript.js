
document.addEventListener('DOMContentLoaded', function() {

/* ══════════════════════════════
   NAVIGATION
══════════════════════════════ */
const titles = {
  dashboard:'Dashboard', recovery:'Recovery Tracker', physio:'Physiotherapy',
  learning:'Learning Hub', habits:'Habit Manager', medical:'Medical Records',
  therapy:'Therapy Sessions', achievements:'Achievements', feedback:'Feedback', settings:'Settings'
};

function navTo(pageId) {
  document.querySelectorAll('.sb-item').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

  // activate matching sidebar button
  const sbBtn = document.querySelector(`.sb-item[data-page="${pageId}"]`);
  if (sbBtn) sbBtn.classList.add('active');

  // show page
  const page = document.getElementById('page-' + pageId);
  if (page) page.classList.add('active');

  // update topbar title
  const titleEl = document.getElementById('tb-title');
  if (titleEl) titleEl.textContent = titles[pageId] || pageId;

  // close notifications
  const np = document.getElementById('notif-panel');
  if (np) np.classList.remove('open');

  // page-specific init
  if (pageId === 'habits')       renderHabits();
  if (pageId === 'medical')      renderRecs();
  if (pageId === 'achievements') renderAch();
}

// Wire sidebar buttons
document.querySelectorAll('.sb-item[data-page]').forEach(btn => {
  btn.addEventListener('click', function() { navTo(this.dataset.page); });
});

// Wire quick-action buttons with data-page
document.querySelectorAll('[data-page]:not(.sb-item)').forEach(btn => {
  btn.addEventListener('click', function() { navTo(this.dataset.page); });
});

// Topbar settings button
const settingsBtn = document.getElementById('settings-btn');
if (settingsBtn) settingsBtn.addEventListener('click', () => navTo('settings'));

/* ══════════════════════════════
   THEME
══════════════════════════════ */
function applyTheme(dark) {
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  const t = document.getElementById('t-dark');
  if (t) { dark ? t.classList.add('on') : t.classList.remove('on'); }
}

const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) themeToggle.addEventListener('click', () => {
  applyTheme(document.documentElement.getAttribute('data-theme') !== 'dark');
});

const tDark = document.getElementById('t-dark');
if (tDark) tDark.addEventListener('click', function() {
  this.classList.toggle('on');
  applyTheme(this.classList.contains('on'));
});

// Font size buttons
document.querySelectorAll('[data-font]').forEach(btn => {
  btn.addEventListener('click', function() {
    document.documentElement.setAttribute('data-fontsize', this.dataset.font);
  });
});

// Contrast toggle
const tContrast = document.getElementById('t-contrast');
if (tContrast) tContrast.addEventListener('click', function() {
  this.classList.toggle('on');
  document.documentElement.setAttribute('data-contrast', this.classList.contains('on') ? 'high' : 'normal');
});

// Motion toggle
const tMotion = document.getElementById('t-motion');
if (tMotion) tMotion.addEventListener('click', function() {
  this.classList.toggle('on');
  document.body.style.setProperty('--tr', this.classList.contains('on') ? '0s' : '0.22s cubic-bezier(.4,0,.2,1)');
});

// Notification toggles (simple on/off)
document.querySelectorAll('.toggle:not(#t-dark):not(#t-contrast):not(#t-motion):not(#fb-anon)').forEach(t => {
  t.addEventListener('click', function() { this.classList.toggle('on'); });
});

/* ══════════════════════════════
   NOTIFICATIONS
══════════════════════════════ */
const notifPanel   = document.getElementById('notif-panel');
const notifTrigger = document.getElementById('notif-trigger');
const notifClear   = document.getElementById('notif-clear');

if (notifTrigger) notifTrigger.addEventListener('click', e => {
  e.stopPropagation();
  notifPanel.classList.toggle('open');
});
if (notifClear) notifClear.addEventListener('click', () => {
  notifPanel.innerHTML = '<div style="padding:24px;text-align:center;color:var(--txt3);font-size:13px">No notifications</div>';
});
document.addEventListener('click', e => {
  if (notifPanel && notifTrigger && !notifPanel.contains(e.target) && !notifTrigger.contains(e.target)) {
    notifPanel.classList.remove('open');
  }
});

/* ══════════════════════════════
   TABS (Learning Hub)
══════════════════════════════ */
function switchTab(id) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  const btn = document.querySelector(`.tab-btn[data-tab="${id}"]`);
  if (btn) btn.classList.add('active');
  ['tab-courses','tab-manage','tab-assignments','tab-timer'].forEach(t => {
    const el = document.getElementById(t);
    if (el) el.style.display = t === id ? 'block' : 'none';
  });
  if (id === 'tab-manage') renderMcList();
}
document.querySelectorAll('.tab-btn[data-tab]').forEach(btn => {
  btn.addEventListener('click', function() { switchTab(this.dataset.tab); });
});

/* ══════════════════════════════
   MANAGE COURSES
══════════════════════════════ */
const courses = [
  {code:'CSL2060', name:'Software Engineering',        prof:'Prof. Rajiv Kumar', cred:'4', status:'Active',       grade:'A'},
  {code:'CSL2030', name:'Data Structures & Algorithms',prof:'Prof. Anita Singh',  cred:'4', status:'In Progress',  grade:'B+'},
  {code:'MAL2010', name:'Probability & Statistics',    prof:'Prof. Ranjit Das',   cred:'3', status:'Near Complete',grade:'A+'},
];
const statusBadge = {Active:'badge-violet','In Progress':'badge-amber','Near Complete':'badge-green',Completed:'badge-teal'};

function renderMcList() {
  const el = document.getElementById('mc-list'); if (!el) return;
  if (!courses.length) { el.innerHTML='<div style="padding:24px;text-align:center;color:var(--txt3);font-size:13px">No courses added yet.</div>'; return; }
  el.innerHTML = courses.map((c,i) => `
    <div style="display:flex;align-items:center;gap:12px;padding:14px 20px;border-bottom:1px solid var(--border)">
      <div style="flex:1;min-width:0">
        <div style="font-size:13px;font-weight:600;color:var(--txt1)">${c.code} — ${c.name}</div>
        <div style="font-size:11px;color:var(--txt3);margin-top:2px">${c.prof} · ${c.cred} Credits</div>
      </div>
      <span class="badge ${statusBadge[c.status]||'badge-blue'}">${c.status}</span>
      <span style="font-size:13px;font-weight:700;color:var(--emerald);width:28px;text-align:center">${c.grade}</span>
      <button data-remove="${i}" style="background:transparent;border:none;font-size:14px;cursor:pointer;color:var(--txt3);padding:4px 8px;border-radius:6px">✕</button>
    </div>`).join('');
  el.querySelectorAll('[data-remove]').forEach(btn => {
    btn.addEventListener('click', function() {
      const i = parseInt(this.dataset.remove);
      if (confirm(`Remove "${courses[i].code} — ${courses[i].name}"?`)) { courses.splice(i,1); renderMcList(); }
    });
  });
}

const addCourseBtn = document.getElementById('add-course-btn');
if (addCourseBtn) addCourseBtn.addEventListener('click', () => {
  const code   = document.getElementById('mc-code').value.trim();
  const name   = document.getElementById('mc-name').value.trim();
  const prof   = document.getElementById('mc-prof').value.trim();
  const cred   = document.getElementById('mc-cred').value || '3';
  const status = document.getElementById('mc-status').value;
  const grade  = document.getElementById('mc-grade').value;
  if (!code || !name) { alert('Please enter at least a course code and name.'); return; }
  courses.push({code, name, prof: prof||'TBD', cred, status, grade});
  ['mc-code','mc-name','mc-prof','mc-cred'].forEach(id => { document.getElementById(id).value=''; });
  renderMcList();
  showToast(`✓ ${code} added!`, 'var(--violet)');
});

/* ══════════════════════════════
   CHARTS
══════════════════════════════ */
const recData = [55,68,72,65,80,78,85];
const exData  = [2,3,2,3,3,2,3];
const days    = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

function buildBar(containerId, data, color, maxVal) {
  const el = document.getElementById(containerId); if (!el) return;
  el.innerHTML = data.map((v,i) => `
    <div class="bar-col">
      <div class="bar-body" style="height:${(v/maxVal)*100}%;background:${color};opacity:${v===Math.max(...data)?1:0.55}"></div>
      <div class="bar-lbl">${days[i]}</div>
    </div>`).join('');
}

function updateDonut(done, total) {
  const pct = total > 0 ? Math.round(done/total*100) : 0;
  const el = document.getElementById('dash-donut');
  if (el) el.style.background = `conic-gradient(var(--amber) ${pct}%, var(--border) 0%)`;
  const v = document.getElementById('donut-val'); if (v) v.textContent = done;
  const p = document.getElementById('hab-pct-badge'); if (p) p.textContent = pct + '%';
}

/* ══════════════════════════════
   PAIN SCALE
══════════════════════════════ */
function buildPainScale(containerId) {
  const el = document.getElementById(containerId); if (!el) return;
  const colors = ['#5BBF8A','#5BBF8A','#82C96A','#B8D44A','#D4C820','#F0B020','#F09020','#E07040','#DC5050','#DC3030'];
  el.innerHTML = Array.from({length:10},(_,i) => `
    <button class="pain-btn" data-val="${i+1}" style="border-color:${colors[i]}20">${i+1}</button>`).join('');
  el.querySelectorAll('.pain-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      el.querySelectorAll('.pain-btn').forEach(b => b.classList.remove('selected'));
      this.classList.add('selected');
      const msgs = ['','No pain','Minimal','Mild','Mild–moderate','Moderate','Moderate','Moderate–severe','Severe','Very severe','Maximum pain'];
      const m = document.getElementById('pain-msg');
      if (m) m.textContent = `Level ${this.dataset.val}: ${msgs[this.dataset.val]}`;
    });
  });
}

const logPainBtn = document.getElementById('log-pain-btn');
if (logPainBtn) logPainBtn.addEventListener('click', () => showToast('✓ Pain entry logged!', 'var(--teal)'));

/* ══════════════════════════════
   EXERCISES (Physio)
══════════════════════════════ */
function toggleEx(el) {
  el.classList.toggle('done');
  el.querySelector('.ex-check').textContent = el.classList.contains('done') ? '✓' : '';
}
document.querySelectorAll('.ex-item').forEach(item => {
  item.addEventListener('click', function() { toggleEx(this); });
});

const addExBtn = document.getElementById('add-ex-btn');
if (addExBtn) addExBtn.addEventListener('click', () => {
  const n = document.getElementById('ex-name-inp').value.trim();
  const t = document.getElementById('ex-time-inp').value.trim();
  const d = document.getElementById('ex-desc-inp').value.trim();
  if (!n) return;
  const list = document.getElementById('ex-list');
  const el = document.createElement('div');
  el.className = 'ex-item';
  el.innerHTML = `<div style="display:flex;align-items:center;gap:12px"><div class="ex-check"></div><div><div class="ex-name">${n}</div><div class="ex-meta">${t} · ${d}</div></div></div>`;
  el.addEventListener('click', function() { toggleEx(this); });
  list.appendChild(el);
  document.getElementById('ex-name-inp').value = '';
  document.getElementById('ex-time-inp').value = '';
  document.getElementById('ex-desc-inp').value = '';
});

const addPhysioBtn = document.getElementById('add-physio-btn');
if (addPhysioBtn) addPhysioBtn.addEventListener('click', () => {
  const inp = document.getElementById('ex-name-inp');
  if (inp) inp.focus();
});

/* ══════════════════════════════
   HABITS
══════════════════════════════ */
const habData = {
  medical:  [{t:'Morning Medication',d:false,s:21},{t:'Hydration Log (8 glasses)',d:false,s:7},{t:'Medication Reminder (PM)',d:false,s:14}],
  physical: [{t:'Morning Stretches (15 min)',d:false,s:21},{t:'Wheelchair mobility practice',d:false,s:5},{t:'Breathing exercises',d:false,s:10}],
  mental:   [{t:'Read / Study (1 hr)',d:false,s:14},{t:'LeetCode Problem',d:false,s:5},{t:'Journaling (5 min)',d:false,s:3}]
};

function renderHabits() {
  ['medical','physical','mental'].forEach(cat => {
    const el = document.getElementById('habits-' + cat); if (!el) return;
    el.innerHTML = habData[cat].map((h,i) => `
      <div class="hab-item ${h.d?'done':''}" data-cat="${cat}" data-idx="${i}">
        <div class="hab-check">${h.d?'✓':''}</div>
        <div class="hab-txt">${h.t}</div>
        <div class="hab-str">🔥 ${h.s}</div>
      </div>`).join('');
    el.querySelectorAll('.hab-item').forEach(item => {
      item.addEventListener('click', function() {
        const c = this.dataset.cat, idx = parseInt(this.dataset.idx);
        habData[c][idx].d = !habData[c][idx].d;
        renderHabits();
      });
    });
  });
  const total = Object.values(habData).flat().length;
  const done  = Object.values(habData).flat().filter(h => h.d).length;
  updateDonut(done, total);
  const badge = document.getElementById('hab-badge');
  if (badge) badge.textContent = done;
  const dtc = document.getElementById('done-today-count');
  if (dtc) dtc.textContent = done;
  // legend
  const leg = document.getElementById('hab-legend'); if (!leg) return;
  leg.innerHTML = [
    {l:'Medical',  c:'var(--rose)',    v:habData.medical.filter(h=>h.d).length  +'/'+habData.medical.length},
    {l:'Physical', c:'var(--emerald)', v:habData.physical.filter(h=>h.d).length +'/'+habData.physical.length},
    {l:'Mental',   c:'var(--violet)',  v:habData.mental.filter(h=>h.d).length   +'/'+habData.mental.length},
  ].map(x => `<div style="display:flex;align-items:center;gap:8px"><div style="width:10px;height:10px;border-radius:50%;background:${x.c};flex-shrink:0"></div><div style="font-size:12px;color:var(--txt2);flex:1">${x.l}</div><div style="font-size:12px;font-weight:600;color:var(--txt1)">${x.v}</div></div>`).join('');
}

const addHabBtn = document.getElementById('add-hab-btn');
if (addHabBtn) addHabBtn.addEventListener('click', () => {
  const inp = document.getElementById('new-hab-inp');
  const catSel = document.getElementById('new-hab-cat');
  const t = inp.value.trim(); if (!t) return;
  habData[catSel ? catSel.value : 'mental'].push({t, d:false, s:1});
  inp.value = '';
  renderHabits();
});
const habInp = document.getElementById('new-hab-inp');
if (habInp) habInp.addEventListener('keydown', e => { if (e.key==='Enter') addHabBtn && addHabBtn.click(); });

/* ══════════════════════════════
   MEDICAL RECORDS
══════════════════════════════ */
const recs = [
  {n:'MRI Report Feb 2026.pdf', tp:'pdf', dt:'2026-02-22'},
  {n:'X-Ray Scan Jan 2026.jpg', tp:'img', dt:'2026-01-10'},
  {n:'Physio Prescription.pdf', tp:'pdf', dt:'2026-01-05'},
  {n:'Discharge Summary.pdf',   tp:'doc', dt:'2025-12-01'},
];
const typeIco = {pdf:'📄', img:'🖼️', doc:'📑'};
const typeCls = {pdf:'var(--rose-lt)', img:'var(--blue-lt)', doc:'var(--gold-pale)'};

function renderRecs(f) {
  f = f || '';
  const w = document.getElementById('rec-wrap'); if (!w) return;
  const filtered = recs.filter(r => r.n.toLowerCase().includes(f.toLowerCase()));
  if (!filtered.length) { w.innerHTML='<div class="card card-pad" style="text-align:center;color:var(--txt3);padding:60px">No records found.</div>'; return; }
  w.innerHTML = '<div style="display:flex;flex-direction:column;gap:10px">' + filtered.map(r => `
    <div style="display:flex;align-items:center;gap:14px;padding:14px 16px;background:var(--surface);border:1px solid var(--border);border-radius:12px;cursor:pointer">
      <div style="width:38px;height:38px;border-radius:9px;background:${typeCls[r.tp]};display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">${typeIco[r.tp]}</div>
      <div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:500;color:var(--txt1)">${r.n}</div><div style="font-size:11px;color:var(--txt3);margin-top:2px">Uploaded ${r.dt}</div></div>
      <button style="background:transparent;border:none;font-size:14px;cursor:pointer;color:var(--txt3);padding:6px;border-radius:6px">⬇️</button>
    </div>`).join('') + '</div>';
}

const recSearch = document.getElementById('rec-search');
if (recSearch) recSearch.addEventListener('input', function() { renderRecs(this.value); });

const openRecBtn  = document.getElementById('open-rec-form');
const closeRecBtn = document.getElementById('close-rec-form');
const saveRecBtn  = document.getElementById('save-rec-btn');
const recForm     = document.getElementById('rec-form');
if (openRecBtn)  openRecBtn.addEventListener('click',  () => { recForm.style.display = 'block'; });
if (closeRecBtn) closeRecBtn.addEventListener('click', () => { recForm.style.display = 'none'; });
if (saveRecBtn)  saveRecBtn.addEventListener('click', () => {
  const n  = document.getElementById('rf-name').value.trim();
  const tp = document.getElementById('rf-type').value;
  const dt = document.getElementById('rf-date').value || new Date().toISOString().slice(0,10);
  if (!n) return;
  recs.unshift({n, tp, dt});
  document.getElementById('rf-name').value = '';
  recForm.style.display = 'none';
  renderRecs();
});

/* ══════════════════════════════
   ACHIEVEMENTS
══════════════════════════════ */
const badges = [
  {n:'First Steps',     d:'Log your first physio session',  i:'🫀', un:false},
  {n:'Problem Solver',  d:'Solve 5 coding problems',        i:'⚡', un:false},
  {n:'Code Warrior',    d:'Solve 10 coding problems',       i:'🏅', un:false},
  {n:'Consistent',      d:'3-day streak on any habit',      i:'🔥', un:true},
  {n:'Disciplined',     d:'7-day streak on any habit',      i:'⭐', un:true},
  {n:'Perfect Day',     d:'Complete all habits in one day', i:'🎯', un:false},
  {n:'Rising Star',     d:'Reach level 5',                  i:'🌟', un:false},
  {n:'Knowledge Seeker',d:'Log 5 physio sessions',          i:'📚', un:false},
];
function renderAch() {
  const pts = 0, lv = 1;
  const el = document.getElementById('ach-level'); if (el) el.textContent = 'Level ' + lv;
  const pe = document.getElementById('ach-pts');   if (pe) pe.textContent = pts + ' total points';
  const ba = document.getElementById('ach-bar');   if (ba) ba.style.width = (pts%100) + '%';
  const ca = document.getElementById('ach-cap');   if (ca) ca.textContent = (100-(pts%100)) + ' pts to next level';
  const gd = document.getElementById('badges-wrap'); if (!gd) return;
  gd.innerHTML = badges.map(b => `
    <div style="display:flex;align-items:center;gap:14px;padding:16px 18px;background:${b.un?'rgba(77,200,160,0.04)':'var(--surface)'};border:1px solid ${b.un?'rgba(77,200,160,0.3)':'var(--border)'};border-radius:13px">
      <div style="width:42px;height:42px;border-radius:11px;background:${b.un?'var(--gold-pale)':'var(--border)'};display:flex;align-items:center;justify-content:center;font-size:20px;filter:${b.un?'none':'grayscale(0.8)'};opacity:${b.un?1:0.5}">${b.i}</div>
      <div><div style="font-size:13px;font-weight:600;color:var(--txt1)">${b.n}</div><div style="font-size:11px;color:var(--txt3);margin-top:2px">${b.d}</div></div>
      ${b.un ? '<span class="badge badge-teal" style="margin-left:auto">Unlocked</span>' : ''}
    </div>`).join('');
  const lc = document.getElementById('locked-cnt');
  if (lc) lc.textContent = badges.filter(b => !b.un).length;
}

/* ══════════════════════════════
   POMODORO
══════════════════════════════ */
let pomoMin=25, pomoSec=0, pomoTotal=1500, pomoRunning=false, pomoTimer=null, pomoDone=0, pomoMode='FOCUS';
function pad(n) { return String(n).padStart(2,'0'); }

function setPomo(min, lbl) {
  clearInterval(pomoTimer); pomoRunning = false;
  const ps = document.getElementById('pomo-start');
  if (ps) ps.textContent = '▶ Start';
  pomoMin=min; pomoSec=0; pomoTotal=min*60; pomoMode=lbl;
  const pt = document.getElementById('pomo-time'); if (pt) pt.textContent = pad(min)+':00';
  const pl = document.getElementById('pomo-lbl');  if (pl) pl.textContent = lbl;
  const pr = document.getElementById('pomo-ring'); if (pr) pr.style.setProperty('--pomo-pct','0%');
}

const pomoStart = document.getElementById('pomo-start');
if (pomoStart) pomoStart.addEventListener('click', () => {
  if (pomoRunning) { clearInterval(pomoTimer); pomoRunning=false; pomoStart.textContent='▶ Start'; return; }
  pomoRunning=true; pomoStart.textContent='⏸ Pause';
  pomoTimer = setInterval(() => {
    if (pomoSec===0) {
      if (pomoMin===0) {
        clearInterval(pomoTimer); pomoRunning=false; pomoStart.textContent='▶ Start';
        pomoDone++; const pc=document.getElementById('pomo-count'); if(pc) pc.textContent=pomoDone;
        logStudy(); return;
      }
      pomoMin--; pomoSec=59;
    } else pomoSec--;
    const pt=document.getElementById('pomo-time'); if(pt) pt.textContent=pad(pomoMin)+':'+pad(pomoSec);
    const elapsed=(pomoTotal-(pomoMin*60+pomoSec))/pomoTotal*100;
    const pr=document.getElementById('pomo-ring'); if(pr) pr.style.setProperty('--pomo-pct',elapsed+'%');
  }, 1000);
});

const pomoReset = document.getElementById('pomo-reset');
if (pomoReset) pomoReset.addEventListener('click', () => setPomo(25,'FOCUS'));

document.querySelectorAll('[data-pomo]').forEach(btn => {
  btn.addEventListener('click', function() {
    const [min, lbl] = this.dataset.pomo.split('|');
    setPomo(parseInt(min), lbl);
  });
});

function logStudy() {
  const el = document.getElementById('study-log'); if (!el) return;
  if (el.children.length===1 && el.children[0].textContent.includes('No sessions')) el.innerHTML='';
  const now = new Date();
  const d = document.createElement('div');
  d.style.cssText = 'padding:9px 12px;background:var(--violet-lt);border-radius:9px;font-size:12px;color:var(--txt2)';
  d.textContent = `✓ ${pomoMode} session completed at ${now.getHours()}:${pad(now.getMinutes())}`;
  el.prepend(d);
}

/* ══════════════════════════════
   FEEDBACK
══════════════════════════════ */
let fbRating = 0;

document.querySelectorAll('.fb-cat-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.fb-cat-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
  });
});
document.querySelectorAll('.fb-type-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.fb-type-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
  });
});
document.querySelectorAll('.star-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    fbRating = parseInt(this.dataset.v);
    const labels = ['','Poor','Fair','Good','Very Good','Excellent'];
    document.querySelectorAll('.star-btn').forEach((s,i) => {
      s.textContent = i < fbRating ? '⭐' : '☆';
      s.style.transform = i < fbRating ? 'scale(1.15)' : 'scale(1)';
    });
    const msg = document.getElementById('star-msg');
    if (msg) msg.textContent = `${fbRating}/5 — ${labels[fbRating]}`;
  });
});

const fbAnon = document.getElementById('fb-anon');
if (fbAnon) fbAnon.addEventListener('click', function() { this.classList.toggle('on'); });

const submitFbBtn = document.getElementById('submit-fb-btn');
if (submitFbBtn) submitFbBtn.addEventListener('click', () => {
  const title = document.getElementById('fb-title').value.trim();
  const msg   = document.getElementById('fb-msg').value.trim();
  if (!title || !msg) { alert('Please fill in both the title and message.'); return; }
  const cat   = (document.querySelector('.fb-cat-btn.active') || {}).dataset?.cat || 'general';
  const type  = (document.querySelector('.fb-type-btn.active') || {}).dataset?.type || 'positive';
  const anon  = fbAnon && fbAnon.classList.contains('on');
  const dateStr = new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'});
  const typeIcos  = {positive:'👍', negative:'🐛', suggestion:'💡'};
  const typeBgs   = {positive:'var(--emerald-lt)', negative:'var(--rose-lt)', suggestion:'var(--blue-lt)'};
  const typeBadge = {positive:'badge-green', negative:'badge-rose', suggestion:'badge-blue'};
  const typeLabel = {positive:'Positive', negative:'Issue', suggestion:'Suggestion'};
  const hist = document.getElementById('fb-history');
  const el = document.createElement('div');
  el.style.cssText = 'display:flex;gap:12px;padding:14px 20px;border-top:1px solid var(--border);animation:pageIn .3s ease';
  el.innerHTML = `
    <div style="width:34px;height:34px;border-radius:9px;background:${typeBgs[type]};display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0">${typeIcos[type]}</div>
    <div style="flex:1"><div style="font-size:13px;font-weight:500;color:var(--txt1)">${title}</div>
    <div style="font-size:11px;color:var(--txt3);margin-top:2px">${cat.charAt(0).toUpperCase()+cat.slice(1)} · ${dateStr}${fbRating?' · '+'⭐'.repeat(fbRating):''}${anon?' · Anonymous':''}</div></div>
    <span class="badge ${typeBadge[type]}">${typeLabel[type]}</span>`;
  if (hist) hist.appendChild(el);
  document.getElementById('fb-title').value = '';
  document.getElementById('fb-msg').value = '';
  fbRating = 0;
  document.querySelectorAll('.star-btn').forEach(s => { s.textContent='⭐'; s.style.transform='scale(1)'; });
  const sm = document.getElementById('star-msg'); if (sm) sm.textContent='Tap a star to rate';
  showToast('✓ Feedback submitted successfully!', 'var(--teal)');
});

/* ══════════════════════════════
   SETTINGS — font size
══════════════════════════════ */
document.querySelectorAll('.font-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    document.documentElement.setAttribute('data-fontsize', this.dataset.size);
  });
});

/* ══════════════════════════════
   TOAST HELPER
══════════════════════════════ */
function showToast(msg, bg) {
  const t = document.createElement('div');
  t.style.cssText = `position:fixed;bottom:28px;right:28px;background:${bg};color:#fff;padding:12px 22px;border-radius:12px;font-size:13px;font-weight:600;z-index:9999;box-shadow:0 4px 20px rgba(0,0,0,0.2);animation:pageIn .3s ease`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3200);
}

/* ══════════════════════════════
   INIT
══════════════════════════════ */
buildBar('recovery-chart', recData, 'linear-gradient(180deg,var(--teal),rgba(45,184,154,0.4))', 100);
buildBar('ex-chart', exData, 'linear-gradient(180deg,var(--emerald),rgba(52,168,83,0.4))', 5);
buildPainScale('journal-pain');
renderHabits();
renderRecs();
renderAch();

// Fire animation
const style = document.createElement('style');
style.textContent = '@keyframes flicker{0%,100%{transform:scale(1) rotate(-3deg)}50%{transform:scale(1.1) rotate(3deg)}}';
document.head.appendChild(style);


// Sensation toggle buttons (therapy page)
document.querySelectorAll('.sensation-btn').forEach(btn => {
  btn.addEventListener('click', function() { this.classList.toggle('active-sensation'); });
});

// Notification on/off toggles (settings)
document.querySelectorAll('.notif-toggle').forEach(t => {
  t.addEventListener('click', function() { this.classList.toggle('on'); });
});

}); 