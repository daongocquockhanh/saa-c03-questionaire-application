import { MODULES } from './modules.js';

const STORE_KEY = 'saa-c03-progress';
let DATA = null;
let PROGRESS = null;

function loadProgress() {
  let p;
  try { p = JSON.parse(localStorage.getItem(STORE_KEY)) || {}; }
  catch { p = {}; }
  if (!p.tests) p.tests = {};
  if (!p.modules) p.modules = {};
  return p;
}
function saveProgress() {
  localStorage.setItem(STORE_KEY, JSON.stringify(PROGRESS));
}

async function loadData() {
  const res = await fetch('tests.json');
  if (!res.ok) throw new Error('Failed to load tests.json');
  return res.json();
}

function render(html) {
  // Trusted: all callers pass static template literals with numeric route args only.
  // Future tasks (6, 7, 8) will replace these renderers with proper DOM construction.
  document.getElementById('root').innerHTML = html;
}

function route() {
  const hash = location.hash || '#/dashboard';
  const [, screen, arg] = hash.split('/');
  if (screen === 'test' && arg) renderRunner(Number(arg));
  else if (screen === 'result' && arg) renderResult(Number(arg));
  else if (screen === 'theory') renderTheory(arg || null);
  else if (screen === 'modules') renderModule(arg || null);
  else if (screen === 'sources') renderSources();
  else renderDashboard();
  updateTopbar(screen || 'dashboard');
}

function updateTopbar(screen) {
  const el = document.getElementById('topbar-right');
  if (!el) return;
  el.innerHTML = `
    <a href="#/dashboard" class="nav-link ${screen === 'dashboard' ? 'active' : ''}">Practice Tests</a>
    <a href="#/modules" class="nav-link ${screen === 'modules' ? 'active' : ''}">Modules</a>
    <a href="#/theory" class="nav-link ${screen === 'theory' ? 'active' : ''}">Theory</a>
    <a href="#/sources" class="nav-link ${screen === 'sources' ? 'active' : ''}">Sources</a>
  `;
}

const SOURCES_EN = [
  { name: 'Stéphane Maarek — AWS SAA-C03 (Udemy)', badge: 'Paid', note: 'Most popular SAA-C03 course. Concise, exam-focused. Best starting point.', url: 'https://www.udemy.com/course/aws-certified-solutions-architect-associate-saa-c03/' },
  { name: 'Adrian Cantrill — SAA-C03', badge: 'Paid', note: 'Deepest course, lots of hands-on demos. For thorough learners.', url: 'https://learn.cantrill.io/p/aws-certified-solutions-architect-associate-saa-c03' },
  { name: 'freeCodeCamp — AWS SAA full course (YouTube)', badge: 'Free', note: 'Free ~13-hour SAA-C03 course on YouTube.', url: 'https://www.youtube.com/c/Freecodecamp' },
  { name: 'AWS Skill Builder — Exam Prep SAA-C03', badge: 'Free', note: 'Official AWS prep + free official practice question set.', url: 'https://skillbuilder.aws/' },
  { name: 'Tutorials Dojo (Jon Bonso)', badge: 'Paid', note: 'Practice exams + cheat sheets. Closest to the real exam. Use in practice phase.', url: 'https://tutorialsdojo.com/aws-certified-solutions-architect-associate-saa-c03/' },
  { name: 'AWS — official certification page', badge: 'Free', note: 'Exam guide, sample questions, booking. Read the official exam guide.', url: 'https://aws.amazon.com/certification/certified-solutions-architect-associate/' },
];

const SOURCES_VI = [
  { name: 'VNTechies — Khoá học AWS SAA-C03', badge: 'Free', note: 'Khóa học SAA-C03 online tiếng Việt miễn phí. Điểm khởi đầu tốt.', url: 'https://vntechies.dev/courses/aws/saa/gioi-thieu' },
  { name: 'Udemy — AWS SAA Associate (Tiếng Việt)', badge: 'Paid', note: 'Khóa video tiếng Việt đầy đủ, 200+ câu hỏi luyện thi có giải thích tiếng Việt.', url: 'https://www.udemy.com/course/aws-certified-solutions-architect-associate-tieng-viet/' },
  { name: 'Khóa học Hạt dẻ — AWS SAA (Luu Ho Phuong)', badge: 'Paid', note: 'Khóa học tiếng Việt giá rẻ, dạy hoàn toàn bằng tiếng Việt.', url: 'https://khoahochatde.com/cua-hang/aws-certified-solutions-architect/' },
  { name: 'VTI Academy — Ôn thi AWS SAA-C03', badge: 'Paid', note: 'Lộ trình: nền tảng → hands-on lab → tư duy kiến trúc → đề luyện thi.', url: 'https://vtiacademy.edu.vn/khoa-hoc-on-thi-aws-saa-c03.html' },
  { name: 'CodeGym — Luyện thi chứng chỉ AWS', badge: 'Paid', note: 'Khóa luyện thi chứng chỉ AWS tiếng Việt.', url: 'https://codegym.vn/khoa-hoc/khoa-luyen-thi-chung-chi-aws/' },
  { name: 'Viblo — Kinh nghiệm thi SAA-C03', badge: 'Free', note: 'Bài chia sẻ kinh nghiệm thi thật từ người đã pass. Đọc 2–3 bài.', url: 'https://viblo.asia/p/chia-se-kinh-nghiem-thi-saa-c03-aws-certified-solutions-architect-associate-saa-c03-5OXLAXevJGr' },
];

function sourceCard(s) {
  return `<li class="source-item">
    <div class="source-head">
      <a href="${s.url}" target="_blank" rel="noopener">${escapeHtml(s.name)}</a>
      <span class="badge ${s.badge === 'Free' ? 'pass' : 'in-progress'}">${s.badge}</span>
    </div>
    <p class="muted">${escapeHtml(s.note)}</p>
  </li>`;
}

function renderSources() {
  render(`
    <h1>Learning Sources</h1>
    <p class="muted">Curated courses and resources to study for the AWS SAA-C03 exam. External links — verify pricing on each site.</p>
    <div class="sources-grid">
      <section class="card">
        <h2>🇬🇧 English</h2>
        <ul class="source-list">${SOURCES_EN.map(sourceCard).join('')}</ul>
      </section>
      <section class="card">
        <h2>🇻🇳 Tiếng Việt</h2>
        <ul class="source-list">${SOURCES_VI.map(sourceCard).join('')}</ul>
      </section>
    </div>
    <p class="muted">Gợi ý: học lý thuyết bằng tiếng Việt, nhưng luyện câu hỏi và làm quen với tiếng Anh — đề thi thật là tiếng Anh.</p>
  `);
  window.scrollTo(0, 0);
}

function renderDashboard() {
  const totalPassed = Object.values(PROGRESS.tests).filter(t => t.bestPercent >= DATA.passPercent).length;
  const cards = DATA.tests.map(t => {
    const p = PROGRESS.tests[t.id] || { status: 'not-started' };
    const status = p.status || 'not-started';
    const score = p.bestScore != null ? `Best: ${p.bestScore}/${t.questionIds.length} (${p.bestPercent}%)` : 'No attempts yet';
    const passBadge = p.bestPercent >= DATA.passPercent
      ? '<span class="badge pass">Pass ✓</span>'
      : p.bestPercent != null ? '<span class="badge fail">Fail ✗</span>' : '';
    const last = p.lastAttempt ? `Last: ${new Date(p.lastAttempt).toLocaleDateString()}` : '';
    const action = status === 'in-progress' ? 'Resume' : status === 'done' ? 'Retake' : 'Start';
    return `
      <div class="card test-card">
        <div class="test-card-header">
          <h3>${t.title}</h3>
          <span class="badge ${status}">${status.replace('-', ' ')}</span>
        </div>
        <p>${score} ${passBadge}</p>
        <p class="muted">${last}</p>
        <a href="#/test/${t.id}"><button class="primary">${action}</button></a>
      </div>
    `;
  }).join('');
  render(`
    <h1>Practice Tests</h1>
    <p>${totalPassed} of ${DATA.totalTests} tests passed.</p>
    <div class="test-grid">${cards}</div>
    <p><a href="#" id="reset-link">Reset all progress</a></p>
  `);
  document.getElementById('reset-link').addEventListener('click', e => {
    e.preventDefault();
    if (confirm('Erase all progress?')) {
      PROGRESS = { tests: {} };
      saveProgress();
      route();
    }
  });
}
let RUNNER = null;

function startOrResumeRunner(testId) {
  const test = DATA.tests.find(t => t.id === testId);
  const persisted = PROGRESS.tests[testId]?.inProgressState;
  if (persisted) {
    RUNNER = { ...persisted, testId };
  } else {
    const durationMs = DATA.durationMinutes * 60 * 1000;
    RUNNER = {
      testId,
      current: 0,
      answers: Object.fromEntries(test.questionIds.map(id => [id, []])),
      flags: {},
      startedAt: Date.now(),
      endsAt: Date.now() + durationMs,
    };
    PROGRESS.tests[testId] = PROGRESS.tests[testId] || {};
    PROGRESS.tests[testId].status = 'in-progress';
    PROGRESS.tests[testId].inProgressState = RUNNER;
    saveProgress();
  }
}

function persistRunnerState() {
  PROGRESS.tests[RUNNER.testId].inProgressState = RUNNER;
  saveProgress();
}

function getQuestion(id) {
  return DATA.questions.find(q => q.id === id);
}

function formatTimeLeft(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(total / 3600)).padStart(2, '0');
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function tickTimer() {
  const el = document.getElementById('timer');
  if (!el || !RUNNER) return;
  const left = RUNNER.endsAt - Date.now();
  el.textContent = formatTimeLeft(left);
  el.classList.toggle('warning', left < 10 * 60 * 1000);
  if (left <= 0) submitTest();
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function renderRunner(testId) {
  const test = DATA.tests.find(t => t.id === testId);
  if (!test) { render('<p>Test not found.</p>'); return; }
  if (!RUNNER || RUNNER.testId !== testId) startOrResumeRunner(testId);

  const qId = test.questionIds[RUNNER.current];
  const q = getQuestion(qId);
  const selected = RUNNER.answers[qId] || [];
  const inputType = q.isMultiSelect ? 'checkbox' : 'radio';
  const helper = q.isMultiSelect
    ? `<p class="muted">${/Choose three/i.test(q.prompt + ' ' + q.scenario) ? 'Choose three.' : 'Choose two.'}</p>`
    : '';

  const opts = q.options.map(o => `
    <label class="option">
      <input type="${inputType}" name="opt" value="${o.letter}" ${selected.includes(o.letter) ? 'checked' : ''} />
      <span><strong>${o.letter}.</strong> ${escapeHtml(o.text)}</span>
    </label>
  `).join('');

  const grid = test.questionIds.map((id, idx) => {
    const ans = (RUNNER.answers[id] || []).length > 0;
    const flagged = RUNNER.flags[id];
    const cls = ['grid-cell',
      idx === RUNNER.current ? 'current' : '',
      ans ? 'answered' : '',
      flagged ? 'flagged' : ''].filter(Boolean).join(' ');
    return `<button class="${cls}" data-idx="${idx}">${idx + 1}</button>`;
  }).join('');

  render(`
    <div class="runner">
      <div class="runner-topbar">
        <div>${escapeHtml(test.title)}</div>
        <div>Question ${RUNNER.current + 1} of ${test.questionIds.length}</div>
        <div class="timer" id="timer">${formatTimeLeft(RUNNER.endsAt - Date.now())}</div>
      </div>
      <section class="question">
        <p class="scenario">${escapeHtml(q.scenario).replace(/\n/g, '<br>')}</p>
        <p class="prompt"><strong>${escapeHtml(q.prompt)}</strong></p>
        ${helper}
        <form id="opts">${opts}</form>
      </section>
      <footer class="runner-footer">
        <button id="prev" ${RUNNER.current === 0 ? 'disabled' : ''}>Previous</button>
        <button id="flag">${RUNNER.flags[qId] ? '★ Flagged' : '☆ Flag'}</button>
        <button id="next" ${RUNNER.current === test.questionIds.length - 1 ? 'disabled' : ''}>Next</button>
        <button id="review" class="primary">Review &amp; Submit</button>
      </footer>
      <aside class="grid">${grid}</aside>
    </div>
  `);

  document.getElementById('opts').addEventListener('change', e => {
    const letter = e.target.value;
    if (q.isMultiSelect) {
      const set = new Set(RUNNER.answers[qId]);
      e.target.checked ? set.add(letter) : set.delete(letter);
      RUNNER.answers[qId] = [...set].sort();
    } else {
      RUNNER.answers[qId] = [letter];
    }
    persistRunnerState();
    renderRunner(testId);
  });
  document.getElementById('prev').addEventListener('click', () => { RUNNER.current--; persistRunnerState(); renderRunner(testId); });
  document.getElementById('next').addEventListener('click', () => { RUNNER.current++; persistRunnerState(); renderRunner(testId); });
  document.getElementById('flag').addEventListener('click', () => {
    RUNNER.flags[qId] = !RUNNER.flags[qId];
    persistRunnerState();
    renderRunner(testId);
  });
  document.getElementById('review').addEventListener('click', () => renderReview(testId));
  document.querySelectorAll('.grid-cell').forEach(btn =>
    btn.addEventListener('click', () => { RUNNER.current = Number(btn.dataset.idx); persistRunnerState(); renderRunner(testId); }));

  if (window.__KEY_HANDLER__) document.removeEventListener('keydown', window.__KEY_HANDLER__);
  const keyHandler = e => {
    if (e.target.tagName === 'INPUT') return;
    if (e.key === 'ArrowLeft' && RUNNER && RUNNER.current > 0) { RUNNER.current--; persistRunnerState(); renderRunner(testId); }
    if (e.key === 'ArrowRight' && RUNNER && RUNNER.current < test.questionIds.length - 1) { RUNNER.current++; persistRunnerState(); renderRunner(testId); }
    if (e.key === 'f' && RUNNER) { RUNNER.flags[qId] = !RUNNER.flags[qId]; persistRunnerState(); renderRunner(testId); }
  };
  window.__KEY_HANDLER__ = keyHandler;
  document.addEventListener('keydown', keyHandler);

  if (!window.__TIMER_ID__) window.__TIMER_ID__ = setInterval(tickTimer, 1000);
}

function renderReview(testId) {
  const test = DATA.tests.find(t => t.id === testId);
  const rows = test.questionIds.map((id, idx) => {
    const answered = (RUNNER.answers[id] || []).length > 0;
    const flagged = RUNNER.flags[id];
    return `<li><a href="#" data-idx="${idx}">Q${idx + 1}</a> — ${answered ? 'Answered' : '<em>Unanswered</em>'} ${flagged ? '★' : ''}</li>`;
  }).join('');
  render(`
    <h1>Review &amp; Submit</h1>
    <ol>${rows}</ol>
    <p><button id="back">Back to test</button> <button id="submit" class="primary">Submit Test</button></p>
  `);
  document.querySelectorAll('a[data-idx]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    RUNNER.current = Number(a.dataset.idx);
    renderRunner(testId);
  }));
  document.getElementById('back').addEventListener('click', () => renderRunner(testId));
  document.getElementById('submit').addEventListener('click', () => {
    if (confirm('Submit this test now?')) submitTest();
  });
}

function submitTest() {
  const test = DATA.tests.find(t => t.id === RUNNER.testId);
  let correct = 0;
  for (const id of test.questionIds) {
    const q = getQuestion(id);
    const given = (RUNNER.answers[id] || []).slice().sort();
    const exp = (q.correctAnswers || []).slice().sort();
    if (given.length && given.length === exp.length && given.every((v, i) => v === exp[i])) correct++;
  }
  const total = test.questionIds.length;
  const pct = Math.round((correct / total) * 100);
  const attempt = {
    score: correct,
    total,
    percent: pct,
    answers: RUNNER.answers,
    flags: RUNNER.flags,
    startedAt: RUNNER.startedAt,
    finishedAt: Date.now(),
  };
  const prev = PROGRESS.tests[test.id] || {};
  PROGRESS.tests[test.id] = {
    status: 'done',
    bestScore: Math.max(prev.bestScore || 0, correct),
    bestPercent: Math.max(prev.bestPercent || 0, pct),
    lastAttempt: new Date().toISOString(),
    attempts: (prev.attempts || 0) + 1,
    inProgressState: null,
    lastResult: attempt,
  };
  saveProgress();
  clearInterval(window.__TIMER_ID__);
  window.__TIMER_ID__ = null;
  RUNNER = null;
  location.hash = `#/result/${test.id}`;
}
function renderResult(testId) {
  const test = DATA.tests.find(t => t.id === testId);
  const prog = PROGRESS.tests[testId];
  if (!prog || !prog.lastResult) { render('<p>No result yet.</p>'); return; }
  const r = prog.lastResult;
  const pass = r.percent >= DATA.passPercent;
  const durationMin = Math.round((r.finishedAt - r.startedAt) / 60000);

  const byDomain = { 1: { correct: 0, total: 0 }, 2: { correct: 0, total: 0 }, 3: { correct: 0, total: 0 }, 4: { correct: 0, total: 0 } };
  for (const id of test.questionIds) {
    const q = getQuestion(id);
    const given = (r.answers[id] || []).slice().sort();
    const exp = q.correctAnswers.slice().sort();
    const isRight = given.length && given.length === exp.length && given.every((v, i) => v === exp[i]);
    byDomain[q.domain].total++;
    if (isRight) byDomain[q.domain].correct++;
  }

  const domainNames = { 1: 'Secure', 2: 'Resilient', 3: 'High-Performing', 4: 'Cost-Optimized' };
  const domainBars = Object.entries(byDomain).map(([d, v]) => {
    const pct = v.total ? Math.round((v.correct / v.total) * 100) : 0;
    return `<div class="domain-row"><span>D${d} ${domainNames[d]}</span><div class="bar"><div class="bar-fill" style="width:${pct}%"></div></div><span>${v.correct}/${v.total} (${pct}%)</span></div>`;
  }).join('');

  const filters = `
    <div class="filters">
      <button data-filter="all" class="primary">All</button>
      <button data-filter="wrong">Wrong only</button>
      <button data-filter="flagged">Flagged only</button>
    </div>`;

  const rows = test.questionIds.map((id, idx) => {
    const q = getQuestion(id);
    const given = (r.answers[id] || []).slice().sort();
    const exp = q.correctAnswers.slice().sort();
    const isRight = given.length && given.length === exp.length && given.every((v, i) => v === exp[i]);
    const flagged = r.flags && r.flags[id];
    const optHtml = q.options.map(o => {
      const isGiven = given.includes(o.letter);
      const isCorrect = exp.includes(o.letter);
      const cls = isCorrect ? 'opt-correct' : isGiven ? 'opt-wrong' : '';
      return `<li class="${cls}"><strong>${o.letter}.</strong> ${escapeHtml(o.text)}${isCorrect ? ' ✓' : ''}${isGiven && !isCorrect ? ' ✗' : ''}</li>`;
    }).join('');
    const refs = (q.references || []).map(u => `<li><a href="${u}" target="_blank" rel="noopener">${u}</a></li>`).join('');
    return `
      <details class="card result-q" data-wrong="${!isRight}" data-flagged="${!!flagged}">
        <summary>
          Q${idx + 1} — ${isRight ? '<span class="badge pass">Correct</span>' : '<span class="badge fail">Incorrect</span>'}
          ${flagged ? '★' : ''} <span class="muted">D${q.domain} ${domainNames[q.domain]}</span>
        </summary>
        <p class="scenario">${escapeHtml(q.scenario).replace(/\n/g, '<br>')}</p>
        <p><strong>${escapeHtml(q.prompt)}</strong></p>
        <ul class="opts">${optHtml}</ul>
        <p><strong>Your answer:</strong> ${given.join(', ') || '—'} <strong>Correct:</strong> ${exp.join(', ') || 'N/A'}</p>
        ${q.explanation ? `<p class="explanation">${escapeHtml(q.explanation).replace(/\n/g, '<br>')}</p>` : ''}
        ${refs ? `<ul class="refs">${refs}</ul>` : ''}
      </details>`;
  }).join('');

  render(`
    <h1>${escapeHtml(test.title)} — Result</h1>
    <div class="card result-summary">
      <div class="score"><strong>${r.score} / ${r.total}</strong> (${r.percent}%)</div>
      <div>${pass ? '<span class="badge pass">Pass ✓</span>' : '<span class="badge fail">Fail ✗</span>'}</div>
      <div class="muted">Time taken: ${durationMin} min</div>
    </div>
    <div class="card">
      <h3>By domain</h3>
      ${domainBars}
    </div>
    ${filters}
    <div id="result-list">${rows}</div>
    <p><a href="#/dashboard"><button>Back to Dashboard</button></a> <a href="#/test/${testId}"><button class="primary">Retake</button></a></p>
  `);

  document.querySelectorAll('.filters button').forEach(b => b.addEventListener('click', () => {
    const f = b.dataset.filter;
    document.querySelectorAll('.filters button').forEach(x => x.classList.toggle('primary', x === b));
    document.querySelectorAll('.result-q').forEach(card => {
      const wrong = card.dataset.wrong === 'true';
      const flagged = card.dataset.flagged === 'true';
      card.style.display = (f === 'all') || (f === 'wrong' && wrong) || (f === 'flagged' && flagged) ? '' : 'none';
    });
  }));
}

function initSplash() {
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
  const modal = document.getElementById('splash-modal');
  if (!modal) return;
  const acked = localStorage.getItem('saa-c03-splash-ack');
  if (!acked) modal.classList.remove('hidden');
  const btn = document.getElementById('splash-dismiss');
  if (btn) btn.addEventListener('click', () => {
    localStorage.setItem('saa-c03-splash-ack', new Date().toISOString());
    modal.classList.add('hidden');
  });
}

// ---- Theory section ----
let THEORY_SECTIONS = null;

function svgFlow(title, nodes) {
  const W = 168, H = 50, GAP = 30;
  let x = 12;
  const parts = [];
  nodes.forEach((n, i) => {
    if (i > 0) {
      parts.push(`<line x1="${x - GAP}" y1="${37}" x2="${x}" y2="${37}" stroke="#8896aa" stroke-width="2" marker-end="url(#arrowhead)"/>`);
    }
    parts.push(`<rect x="${x}" y="12" width="${W}" height="${H}" rx="6" fill="#eef4ff" stroke="#4a8eff" stroke-width="1.5"/>`);
    parts.push(`<text x="${x + W / 2}" y="42" text-anchor="middle" font-size="12.5" fill="#1a2a3a">${escapeHtml(n)}</text>`);
    x += W + GAP;
  });
  const total = x;
  return `<figure class="diagram">
    <svg viewBox="0 0 ${total} 74" preserveAspectRatio="xMidYMid meet" role="img">
      <defs><marker id="arrowhead" markerWidth="8" markerHeight="8" refX="7" refY="3.5" orient="auto">
        <path d="M0,0 L8,3.5 L0,7 Z" fill="#8896aa"/></marker></defs>
      ${parts.join('')}
    </svg>
    <figcaption>${escapeHtml(title)}</figcaption>
  </figure>`;
}

function svgFanout() {
  return `<figure class="diagram">
    <svg viewBox="0 0 540 200" preserveAspectRatio="xMidYMid meet" role="img">
      <defs><marker id="ah2" markerWidth="8" markerHeight="8" refX="7" refY="3.5" orient="auto">
        <path d="M0,0 L8,3.5 L0,7 Z" fill="#8896aa"/></marker></defs>
      <rect x="12" y="78" width="150" height="44" rx="6" fill="#fff3cd" stroke="#d9a300" stroke-width="1.5"/>
      <text x="87" y="105" text-anchor="middle" font-size="13" fill="#1a2a3a">SNS Topic</text>
      <line x1="162" y1="100" x2="230" y2="40" stroke="#8896aa" stroke-width="2" marker-end="url(#ah2)"/>
      <line x1="162" y1="100" x2="230" y2="100" stroke="#8896aa" stroke-width="2" marker-end="url(#ah2)"/>
      <line x1="162" y1="100" x2="230" y2="160" stroke="#8896aa" stroke-width="2" marker-end="url(#ah2)"/>
      <rect x="234" y="18" width="120" height="42" rx="6" fill="#eef4ff" stroke="#4a8eff" stroke-width="1.5"/>
      <text x="294" y="44" text-anchor="middle" font-size="12.5" fill="#1a2a3a">SQS Queue 1</text>
      <rect x="234" y="79" width="120" height="42" rx="6" fill="#eef4ff" stroke="#4a8eff" stroke-width="1.5"/>
      <text x="294" y="105" text-anchor="middle" font-size="12.5" fill="#1a2a3a">SQS Queue 2</text>
      <rect x="234" y="140" width="120" height="42" rx="6" fill="#eef4ff" stroke="#4a8eff" stroke-width="1.5"/>
      <text x="294" y="166" text-anchor="middle" font-size="12.5" fill="#1a2a3a">SQS Queue 3</text>
      <line x1="354" y1="39" x2="412" y2="39" stroke="#8896aa" stroke-width="2" marker-end="url(#ah2)"/>
      <line x1="354" y1="100" x2="412" y2="100" stroke="#8896aa" stroke-width="2" marker-end="url(#ah2)"/>
      <line x1="354" y1="161" x2="412" y2="161" stroke="#8896aa" stroke-width="2" marker-end="url(#ah2)"/>
      <rect x="416" y="18" width="112" height="42" rx="6" fill="#e8f6ec" stroke="#28a745" stroke-width="1.5"/>
      <text x="472" y="44" text-anchor="middle" font-size="12.5" fill="#1a2a3a">Consumer</text>
      <rect x="416" y="79" width="112" height="42" rx="6" fill="#e8f6ec" stroke="#28a745" stroke-width="1.5"/>
      <text x="472" y="105" text-anchor="middle" font-size="12.5" fill="#1a2a3a">Consumer</text>
      <rect x="416" y="140" width="112" height="42" rx="6" fill="#e8f6ec" stroke="#28a745" stroke-width="1.5"/>
      <text x="472" y="166" text-anchor="middle" font-size="12.5" fill="#1a2a3a">Consumer</text>
    </svg>
    <figcaption>Fan-out: SNS → nhiều SQS → nhiều consumer</figcaption>
  </figure>`;
}

function svgDR() {
  const rows = [
    ['Backup & Restore', 'Giờ – ngày', 'Giờ', 'Thấp nhất'],
    ['Pilot Light', 'Chục phút', 'Phút', 'Trung bình'],
    ['Warm Standby', 'Phút', 'Giây – phút', 'Cao'],
    ['Multi-Site (Hot)', 'Gần 0', 'Gần 0', 'Cao nhất'],
  ];
  let bars = '';
  rows.forEach((r, i) => {
    const y = 40 + i * 42;
    const w = 60 + i * 110;
    bars += `<text x="12" y="${y + 18}" font-size="12.5" fill="#1a2a3a">${escapeHtml(r[0])}</text>`;
    bars += `<rect x="170" y="${y}" width="${w}" height="26" rx="4" fill="#4a8eff" opacity="${0.45 + i * 0.18}"/>`;
    bars += `<text x="${178}" y="${y + 17}" font-size="11" fill="#fff">RTO ${escapeHtml(r[1])} · RPO ${escapeHtml(r[2])}</text>`;
    bars += `<text x="${170 + w + 8}" y="${y + 17}" font-size="11" fill="#666">${escapeHtml(r[3])}</text>`;
  });
  return `<figure class="diagram">
    <svg viewBox="0 0 560 232" preserveAspectRatio="xMidYMid meet" role="img">
      <text x="12" y="22" font-size="12.5" fill="#666">Càng xuống dưới: RTO/RPO càng nhỏ, chi phí càng cao →</text>
      ${bars}
    </svg>
    <figcaption>Disaster Recovery: 4 chiến lược theo RTO / RPO / chi phí</figcaption>
  </figure>`;
}

function svgVPC() {
  return `<figure class="diagram">
    <svg viewBox="0 0 560 240" preserveAspectRatio="xMidYMid meet" role="img">
      <rect x="8" y="8" width="544" height="224" rx="8" fill="#f5f8ff" stroke="#4a8eff" stroke-width="1.5"/>
      <text x="20" y="28" font-size="12.5" fill="#4a8eff" font-weight="700">VPC (CIDR riêng)</text>
      <rect x="24" y="40" width="250" height="180" rx="6" fill="#e8f6ec" stroke="#28a745" stroke-width="1.5"/>
      <text x="36" y="60" font-size="12" fill="#28a745" font-weight="700">Public Subnet</text>
      <rect x="40" y="72" width="100" height="38" rx="5" fill="#fff" stroke="#28a745"/>
      <text x="90" y="95" text-anchor="middle" font-size="11.5" fill="#1a2a3a">Internet GW</text>
      <rect x="156" y="72" width="100" height="38" rx="5" fill="#fff" stroke="#28a745"/>
      <text x="206" y="95" text-anchor="middle" font-size="11.5" fill="#1a2a3a">NAT Gateway</text>
      <rect x="40" y="128" width="216" height="38" rx="5" fill="#fff" stroke="#28a745"/>
      <text x="148" y="151" text-anchor="middle" font-size="11.5" fill="#1a2a3a">ALB / Bastion</text>
      <rect x="286" y="40" width="250" height="180" rx="6" fill="#fdf0e6" stroke="#d9822b" stroke-width="1.5"/>
      <text x="298" y="60" font-size="12" fill="#d9822b" font-weight="700">Private Subnet</text>
      <rect x="302" y="72" width="216" height="38" rx="5" fill="#fff" stroke="#d9822b"/>
      <text x="410" y="95" text-anchor="middle" font-size="11.5" fill="#1a2a3a">EC2 / App tier</text>
      <rect x="302" y="128" width="216" height="38" rx="5" fill="#fff" stroke="#d9822b"/>
      <text x="410" y="151" text-anchor="middle" font-size="11.5" fill="#1a2a3a">RDS Multi-AZ</text>
      <text x="302" y="200" font-size="11" fill="#666">Private subnet ra Internet 1 chiều qua NAT GW</text>
    </svg>
    <figcaption>VPC: Public subnet (IGW, NAT) và Private subnet</figcaption>
  </figure>`;
}

function svgBars(title, caption, rows) {
  // rows: [label, widthFactor 0..1, innerText, noteRight]
  const rowH = 38, top = 14, maxW = 300, labelW = 150;
  let body = '';
  rows.forEach((r, i) => {
    const y = top + i * rowH;
    const w = Math.max(40, r[1] * maxW);
    body += `<text x="10" y="${y + 22}" font-size="12" fill="#1a2a3a">${escapeHtml(r[0])}</text>`;
    body += `<rect x="${labelW}" y="${y + 4}" width="${w}" height="26" rx="4" fill="#4a8eff" opacity="${0.45 + i * 0.13}"/>`;
    body += `<text x="${labelW + 8}" y="${y + 21}" font-size="11" fill="#fff">${escapeHtml(r[2])}</text>`;
    if (r[3]) body += `<text x="${labelW + w + 8}" y="${y + 21}" font-size="11" fill="#666">${escapeHtml(r[3])}</text>`;
  });
  const h = top + rows.length * rowH + 8;
  return `<figure class="diagram">
    <svg viewBox="0 0 560 ${h}" preserveAspectRatio="xMidYMid meet" role="img">${body}</svg>
    <figcaption>${escapeHtml(caption)}</figcaption>
  </figure>`;
}

function svgELB() {
  const types = [
    ['Application LB', 'Layer 7 — HTTP/HTTPS, routing path/host/header', '#4a8eff'],
    ['Network LB', 'Layer 4 — TCP/UDP/TLS, static IP, latency thấp', '#28a745'],
    ['Gateway LB', 'Layer 3 — firewall ảo, IDS/IPS', '#d9822b'],
  ];
  let body = '';
  types.forEach((t, i) => {
    const y = 14 + i * 56;
    body += `<rect x="10" y="${y}" width="180" height="44" rx="6" fill="#fff" stroke="${t[2]}" stroke-width="1.5"/>`;
    body += `<text x="100" y="${y + 28}" text-anchor="middle" font-size="13" fill="#1a2a3a" font-weight="700">${escapeHtml(t[0])}</text>`;
    body += `<text x="206" y="${y + 28}" font-size="11.5" fill="#555">${escapeHtml(t[1])}</text>`;
  });
  return `<figure class="diagram">
    <svg viewBox="0 0 560 184" preserveAspectRatio="xMidYMid meet" role="img">${body}</svg>
    <figcaption>3 loại Elastic Load Balancer theo tầng OSI</figcaption>
  </figure>`;
}

function svgRDS() {
  return `<figure class="diagram">
    <svg viewBox="0 0 560 210" preserveAspectRatio="xMidYMid meet" role="img">
      <defs><marker id="ah3" markerWidth="8" markerHeight="8" refX="7" refY="3.5" orient="auto">
        <path d="M0,0 L8,3.5 L0,7 Z" fill="#8896aa"/></marker></defs>
      <text x="10" y="20" font-size="12.5" fill="#4a8eff" font-weight="700">Multi-AZ — tăng AVAILABILITY</text>
      <rect x="10" y="30" width="150" height="40" rx="6" fill="#eef4ff" stroke="#4a8eff"/>
      <text x="85" y="55" text-anchor="middle" font-size="12" fill="#1a2a3a">Primary (AZ-a)</text>
      <line x1="160" y1="50" x2="220" y2="50" stroke="#8896aa" stroke-width="2" marker-end="url(#ah3)"/>
      <text x="170" y="44" font-size="9.5" fill="#666">sync</text>
      <rect x="222" y="30" width="150" height="40" rx="6" fill="#f0f0f0" stroke="#999"/>
      <text x="297" y="55" text-anchor="middle" font-size="12" fill="#1a2a3a">Standby (AZ-b)</text>
      <text x="384" y="54" font-size="11" fill="#666">failover tự động</text>
      <text x="10" y="115" font-size="12.5" fill="#28a745" font-weight="700">Read Replica — scale READ</text>
      <rect x="10" y="125" width="150" height="40" rx="6" fill="#eef4ff" stroke="#4a8eff"/>
      <text x="85" y="150" text-anchor="middle" font-size="12" fill="#1a2a3a">Primary</text>
      <line x1="160" y1="145" x2="220" y2="125" stroke="#8896aa" stroke-width="2" marker-end="url(#ah3)"/>
      <line x1="160" y1="145" x2="220" y2="165" stroke="#8896aa" stroke-width="2" marker-end="url(#ah3)"/>
      <text x="168" y="135" font-size="9.5" fill="#666">async</text>
      <rect x="222" y="105" width="150" height="36" rx="6" fill="#e8f6ec" stroke="#28a745"/>
      <text x="297" y="128" text-anchor="middle" font-size="12" fill="#1a2a3a">Read Replica 1</text>
      <rect x="222" y="150" width="150" height="36" rx="6" fill="#e8f6ec" stroke="#28a745"/>
      <text x="297" y="173" text-anchor="middle" font-size="12" fill="#1a2a3a">Read Replica 2</text>
      <text x="384" y="148" font-size="11" fill="#666">tối đa 15, có thể</text>
      <text x="384" y="163" font-size="11" fill="#666">cross-region</text>
    </svg>
    <figcaption>RDS Multi-AZ (HA, standby sync) vs Read Replica (scale đọc, async)</figcaption>
  </figure>`;
}

function diagramsForSection(title) {
  const t = title.toLowerCase();
  if (t.includes('decoupling') || t.includes('patterns')) {
    return [
      svgFlow('3-tier web', ['Internet', 'ALB', 'Web ASG', 'App ASG', 'RDS Multi-AZ']),
      svgFlow('Serverless web', ['CloudFront', 'API Gateway', 'Lambda', 'DynamoDB']),
      svgFlow('Async processing', ['API Gateway', 'SQS', 'Lambda / ECS', 'Database']),
      svgFanout(),
      svgFlow('Event-driven', ['Source event', 'EventBridge rule', 'Lambda']),
      svgFlow('Streaming analytics', ['Kinesis Data Streams', 'Firehose', 'S3', 'Athena']),
      svgFlow('Static site + CDN', ['Route 53', 'CloudFront', 'S3 (static)']),
    ].join('');
  }
  if (t.includes('disaster recovery')) return svgDR();
  if (t.includes('vpc')) return svgVPC();
  if (t.startsWith('ii.') || t.includes('iam')) {
    return svgFlow('IAM — đánh giá quyền', ['Request', 'Mặc định: DENY', 'Explicit DENY → chặn', 'Explicit ALLOW → cho phép']);
  }
  if (t.includes('ec2')) {
    return svgBars('', 'EC2 pricing: chi phí giảm dần ↓, ràng buộc tăng dần', [
      ['On-Demand', 1.0, 'Linh hoạt nhất', 'đắt nhất'],
      ['Savings Plans', 0.55, 'Cam kết $/giờ', '~ -66%'],
      ['Reserved (RI)', 0.5, 'Cam kết 1–3 năm', 'tới -72%'],
      ['Spot', 0.15, 'AWS thu hồi 2 phút', 'tới -90%'],
    ]);
  }
  if (t.includes('ebs') || t.includes('efs')) {
    return svgBars('', 'EBS volume — IOPS/throughput giảm dần, giá rẻ dần', [
      ['io2 Block Express', 1.0, 'SSD, mission-critical', 'đắt'],
      ['gp3 / gp2', 0.6, 'SSD đa năng', 'cân bằng'],
      ['st1', 0.4, 'HDD throughput cao', 'big data'],
      ['sc1', 0.2, 'HDD lạnh', 'rẻ nhất'],
    ]);
  }
  if (t.includes('elb')) return svgELB();
  if (t.startsWith('vii.') || t.includes('s3 (simple')) {
    return svgBars('', 'S3 storage classes: chi phí lưu trữ giảm dần, độ trễ lấy tăng dần', [
      ['S3 Standard', 1.0, 'Truy cập thường xuyên', 'ms'],
      ['Standard-IA', 0.55, 'Ít truy cập', 'ms'],
      ['Glacier Instant', 0.35, 'Archive tức thời', 'ms'],
      ['Glacier Flexible', 0.2, 'Archive', 'phút–giờ'],
      ['Glacier Deep Archive', 0.1, 'Rẻ nhất', '12 giờ'],
    ]);
  }
  if (t.includes('rds') || t.includes('aurora') || t.includes('dynamodb')) return svgRDS();
  if (t.includes('bảo mật') || t.includes('security')) {
    return svgFlow('Envelope encryption', ['KMS key (CMK)', 'mã hóa Data Key', 'Data Key mã hóa dữ liệu', 'Ciphertext + Data Key đã mã hóa']);
  }
  if (t.includes('messaging') || t.includes('streaming')) {
    return [
      svgFlow('SQS — hàng đợi, decoupling', ['Producer', 'SQS Queue', 'Consumer (poll)']),
      svgFlow('SNS — pub/sub, 1→nhiều', ['Publisher', 'SNS Topic', 'Nhiều Subscriber']),
      svgFlow('Kinesis — stream real-time', ['Producer', 'Data Streams (shard)', 'Firehose / Lambda', 'S3 / đích']),
    ].join('');
  }
  return '';
}

function mdInline(s) {
  return escapeHtml(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
}

function parseMarkdownBody(lines) {
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (/^#{3}\s/.test(line)) { out.push(`<h3>${mdInline(line.replace(/^#{3}\s/, ''))}</h3>`); i++; continue; }
    if (/^#{4}\s/.test(line)) { out.push(`<h4>${mdInline(line.replace(/^#{4}\s/, ''))}</h4>`); i++; continue; }
    if (/^---+\s*$/.test(line)) { out.push('<hr>'); i++; continue; }
    if (/^>\s?/.test(line)) { out.push(`<blockquote>${mdInline(line.replace(/^>\s?/, ''))}</blockquote>`); i++; continue; }
    if (/^\s*\|.*\|\s*$/.test(line)) {
      const rows = [];
      while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) { rows.push(lines[i]); i++; }
      const cells = r => r.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());
      const head = cells(rows[0]);
      const bodyRows = rows.slice(2);
      let t = '<table><thead><tr>' + head.map(h => `<th>${mdInline(h)}</th>`).join('') + '</tr></thead><tbody>';
      bodyRows.forEach(r => { t += '<tr>' + cells(r).map(c => `<td>${mdInline(c)}</td>`).join('') + '</tr>'; });
      t += '</tbody></table>';
      out.push(t);
      continue;
    }
    if (/^\s*([-*]|\d+\.)\s/.test(line)) {
      const ordered = /^\s*\d+\.\s/.test(line);
      const items = [];
      while (i < lines.length && /^\s*([-*]|\d+\.)\s/.test(lines[i])) {
        const indented = /^\s{2,}/.test(lines[i]);
        const text = lines[i].replace(/^\s*([-*]|\d+\.)\s/, '');
        items.push(`<li class="${indented ? 'sub' : ''}">${mdInline(text)}</li>`);
        i++;
      }
      out.push(`<${ordered ? 'ol' : 'ul'}>${items.join('')}</${ordered ? 'ol' : 'ul'}>`);
      continue;
    }
    if (line.trim() === '') { i++; continue; }
    const para = [];
    while (i < lines.length && lines[i].trim() !== '' && !/^(#{1,4}\s|>|\s*\||\s*([-*]|\d+\.)\s|---+\s*$)/.test(lines[i])) {
      para.push(lines[i]); i++;
    }
    out.push(`<p>${mdInline(para.join(' '))}</p>`);
  }
  return out.join('\n');
}

function parseTheory(md) {
  const lines = md.split('\n');
  const sections = [];
  let intro = [];
  let current = null;
  for (const line of lines) {
    if (/^##\s/.test(line)) {
      if (current) sections.push(current);
      current = { title: line.replace(/^##\s/, '').trim(), lines: [] };
    } else if (current) {
      current.lines.push(line);
    } else if (!/^#\s/.test(line)) {
      intro.push(line);
    }
  }
  if (current) sections.push(current);
  return sections.map((s, idx) => ({
    id: String(idx),
    title: s.title,
    html: diagramsForSection(s.title) + parseMarkdownBody(s.lines),
  }));
}

async function loadTheory() {
  if (THEORY_SECTIONS) return THEORY_SECTIONS;
  const res = await fetch('theory.md');
  if (!res.ok) throw new Error('Could not load theory.md');
  THEORY_SECTIONS = parseTheory(await res.text());
  return THEORY_SECTIONS;
}

const SECTION_QUIZ = [
  { m: 'iam', kw: ['IAM role', 'IAM policy', 'IAM user', 'least privilege', ' STS', 'AssumeRole', 'permission boundary', 'service control polic'] },
  { m: 'ec2', kw: ['EC2 instance', 'Spot Instance', 'Reserved Instance', 'Savings Plan', 'placement group', 'On-Demand Instance', 'Dedicated Host'] },
  { m: 'ebs', kw: ['Amazon EBS', 'Amazon EFS', 'FSx', 'Elastic Block Store', 'Elastic File System', 'instance store', 'Provisioned IOPS'] },
  { m: 'elb', kw: ['Load Balancer', 'Application Load Balancer', 'Network Load Balancer', 'Auto Scaling group', 'target group'] },
  { m: 'vpc', kw: ['VPC', 'subnet', 'NAT gateway', 'internet gateway', 'VPC peering', 'Transit Gateway', 'VPC endpoint', 'security group', 'network ACL'] },
  { m: 's3 (simple', kw: ['Amazon S3', 'S3 bucket', 'S3 Glacier', 'S3 Lifecycle', 'object storage', 'S3 Standard'] },
  { m: 'cloudfront', kw: ['CloudFront', 'Global Accelerator', 'edge location', 'content delivery'] },
  { m: 'route 53', kw: ['Route 53', 'routing policy', 'DNS', 'hosted zone', 'failover routing', 'latency routing'] },
  { m: 'rds', kw: ['Amazon RDS', 'Amazon Aurora', 'DynamoDB', 'ElastiCache', 'read replica', 'Multi-AZ', 'database'] },
  { m: 'serverless', kw: ['AWS Lambda', 'API Gateway', 'Step Functions', 'AppSync', 'serverless'] },
  { m: 'containers', kw: ['Amazon ECS', 'Amazon EKS', 'Fargate', 'container', 'Amazon ECR', 'Kubernetes'] },
  { m: 'messaging', kw: ['Amazon SQS', 'Amazon SNS', 'EventBridge', 'Kinesis', 'Amazon MQ', 'Kafka', 'MSK', 'message queue'] },
  { m: 'migration', kw: ['DataSync', 'Storage Gateway', 'Snowball', 'Database Migration Service', 'Transfer Family', 'migrate'] },
  { m: 'analytics', kw: ['Amazon Athena', 'AWS Glue', 'Amazon Redshift', 'Amazon EMR', 'QuickSight', 'OpenSearch', 'Lake Formation'] },
  { m: 'bảo mật', kw: ['AWS KMS', 'Secrets Manager', 'AWS WAF', 'AWS Shield', 'GuardDuty', 'Amazon Macie', 'encrypt', 'CloudTrail', 'AWS Config', 'Amazon Inspector'] },
  { m: 'monitoring', kw: ['CloudWatch', 'X-Ray', 'Trusted Advisor', 'metric', 'CloudWatch alarm'] },
  { m: 'tối ưu chi phí', kw: ['cost-effective', 'Savings Plan', 'AWS Budgets', 'Cost Explorer', 'reduce cost', 'cost-optimiz'] },
  { m: 'disaster recovery', kw: ['disaster recovery', 'RTO', 'RPO', 'pilot light', 'warm standby', 'AWS Backup', 'cross-Region'] },
  { m: 'identity bổ sung', kw: ['Cognito', 'Directory Service', 'Active Directory', 'Resource Access Manager', 'SAML'] },
  { m: 'compute bổ sung', kw: ['Elastic Beanstalk', 'AWS Batch', 'Outposts', 'Local Zones', 'Wavelength', 'Lightsail'] },
  { m: 'databases chuyên biệt', kw: ['Neptune', 'DocumentDB', 'Keyspaces', 'Timestream', 'QLDB', 'MemoryDB', 'Quantum Ledger'] },
  { m: 'ai/ml', kw: ['Rekognition', 'Comprehend', 'Textract', 'Transcribe', 'Translate', 'SageMaker', 'Forecast', 'Polly'] },
  { m: 'management', kw: ['CloudFormation', 'Systems Manager', 'Service Catalog', 'Session Manager', 'Control Tower', 'AppConfig'] },
  { m: 'aws backup', kw: ['AWS Backup', 'Recycle Bin', 'Data Lifecycle Manager', 'snapshot', 'backup vault', 'Object Lock'] },
  { m: 'kiến thức bổ sung', kw: ['WorkSpaces', 'AppStream', 'Amplify', 'CodePipeline', 'CodeDeploy', 'CodeCommit', 'CodeBuild', 'Local Zone', 'Wavelength', 'CORS', 'edge location', 'multiple AWS Regions'] },
];

function sampleQuestionsForSection(title) {
  const t = title.toLowerCase();
  const entry = SECTION_QUIZ.find(e => t.includes(e.m));
  if (!entry || !DATA || !DATA.questions) return '';
  const scored = [];
  for (const q of DATA.questions) {
    const text = (q.scenario + ' ' + q.prompt + ' ' + q.options.map(o => o.text).join(' '));
    let score = 0;
    for (const k of entry.kw) if (text.toLowerCase().includes(k.toLowerCase())) score++;
    if (score > 0) scored.push({ q, score });
  }
  if (!scored.length) return '';
  scored.sort((a, b) => b.score - a.score || a.q.id - b.q.id);
  const picks = scored.slice(0, 4).map(s => s.q);
  const cards = picks.map((q, idx) => {
    const exp = q.correctAnswers.slice().sort();
    const opts = q.options.map(o => {
      const correct = exp.includes(o.letter);
      return `<li class="${correct ? 'opt-correct' : ''}"><strong>${o.letter}.</strong> ${escapeHtml(o.text)}${correct ? ' ✓' : ''}</li>`;
    }).join('');
    return `<details class="card sample-q">
      <summary>Câu hỏi mẫu ${idx + 1} <span class="muted">(Q${q.number})</span></summary>
      <p class="scenario">${escapeHtml(q.scenario).replace(/\n/g, '<br>')}</p>
      <p><strong>${escapeHtml(q.prompt)}</strong></p>
      <ul class="opts">${opts}</ul>
      <p><strong>Đáp án:</strong> ${exp.join(', ')}</p>
      ${q.explanation ? `<p class="explanation">${escapeHtml(q.explanation).replace(/\n/g, '<br>')}</p>` : ''}
    </details>`;
  }).join('');
  return `<div class="sample-block"><h3>📝 Câu hỏi mẫu từ ngân hàng 897 câu</h3>${cards}</div>`;
}

async function renderTheory(sectionId) {
  let sections;
  try { sections = await loadTheory(); }
  catch (e) { render(`<p>Error: ${e.message}</p>`); return; }
  const current = sections.find(s => s.id === sectionId) || sections[0];
  const toc = sections.map(s =>
    `<li><a href="#/theory/${s.id}" class="${s.id === current.id ? 'active' : ''}">${escapeHtml(s.title)}</a></li>`
  ).join('');
  const curIdx = sections.findIndex(s => s.id === current.id);
  const prev = curIdx > 0 ? sections[curIdx - 1] : null;
  const next = curIdx < sections.length - 1 ? sections[curIdx + 1] : null;
  render(`
    <div class="theory">
      <aside class="theory-toc">
        <h3>Nội dung</h3>
        <ol>${toc}</ol>
      </aside>
      <article class="theory-content">
        <h2>${escapeHtml(current.title)}</h2>
        ${current.html}
        ${sampleQuestionsForSection(current.title)}
        <nav class="theory-nav">
          ${prev ? `<a href="#/theory/${prev.id}">← ${escapeHtml(prev.title)}</a>` : '<span></span>'}
          ${next ? `<a href="#/theory/${next.id}">${escapeHtml(next.title)} →</a>` : '<span></span>'}
        </nav>
      </article>
    </div>
  `);
  window.scrollTo(0, 0);
}

// ---- Study Modules ----
let MQUIZ = null;

function svgShared() {
  return `<figure class="diagram">
    <svg viewBox="0 0 560 180" preserveAspectRatio="xMidYMid meet" role="img">
      <rect x="10" y="14" width="265" height="152" rx="6" fill="#fdf0e6" stroke="#d9822b" stroke-width="1.5"/>
      <text x="142" y="36" text-anchor="middle" font-size="12.5" font-weight="700" fill="#d9822b">AWS — Security OF the cloud</text>
      <text x="24" y="62" font-size="11.5" fill="#1a2a3a">• Phần cứng, data center vật lý</text>
      <text x="24" y="84" font-size="11.5" fill="#1a2a3a">• Network vật lý</text>
      <text x="24" y="106" font-size="11.5" fill="#1a2a3a">• Virtualization layer</text>
      <text x="24" y="128" font-size="11.5" fill="#1a2a3a">• Managed service infrastructure</text>
      <rect x="285" y="14" width="265" height="152" rx="6" fill="#eef4ff" stroke="#4a8eff" stroke-width="1.5"/>
      <text x="417" y="36" text-anchor="middle" font-size="12.5" font-weight="700" fill="#4a8eff">Khách hàng — Security IN the cloud</text>
      <text x="299" y="62" font-size="11.5" fill="#1a2a3a">• Dữ liệu, mã hóa dữ liệu</text>
      <text x="299" y="84" font-size="11.5" fill="#1a2a3a">• IAM / phân quyền</text>
      <text x="299" y="106" font-size="11.5" fill="#1a2a3a">• Patch OS trên EC2</text>
      <text x="299" y="128" font-size="11.5" fill="#1a2a3a">• Cấu hình Security Group</text>
    </svg>
    <figcaption>Shared Responsibility Model</figcaption>
  </figure>`;
}

function moduleDiagrams(id) {
  switch (id) {
    case 'M1': return svgFlow('Hạ tầng AWS', ['Region (vùng địa lý)', 'Availability Zones (3+)', 'Data centers']) + svgShared();
    case 'M2': return svgFlow('IAM — đánh giá quyền', ['Request', 'Mặc định: DENY', 'Explicit DENY → chặn', 'Explicit ALLOW → cho phép']);
    case 'M3': return svgVPC();
    case 'M4': return svgELB() + svgBars('', 'EC2 pricing: chi phí giảm dần, ràng buộc tăng dần', [['On-Demand', 1.0, 'Linh hoạt nhất', 'đắt nhất'], ['Savings Plans', 0.55, 'Cam kết $/giờ', '~ -66%'], ['Reserved (RI)', 0.5, 'Cam kết 1–3 năm', 'tới -72%'], ['Spot', 0.15, 'AWS thu hồi 2 phút', 'tới -90%']]);
    case 'M5': return svgBars('', 'S3 storage classes: chi phí giảm dần, độ trễ lấy tăng dần', [['S3 Standard', 1.0, 'Thường xuyên', 'ms'], ['Standard-IA', 0.55, 'Ít truy cập', 'ms'], ['Glacier Instant', 0.35, 'Archive tức thời', 'ms'], ['Glacier Flexible', 0.2, 'Archive', 'phút–giờ'], ['Glacier Deep Archive', 0.1, 'Rẻ nhất', '12 giờ']]);
    case 'M6': return svgRDS();
    case 'M7': return svgFlow('Serverless web', ['CloudFront', 'API Gateway', 'Lambda', 'DynamoDB']);
    case 'M8': return svgFanout();
    case 'M9': return svgFlow('Edge delivery', ['Người dùng', 'Route 53', 'CloudFront edge', 'Origin: S3 / ALB']);
    case 'M10': return svgFlow('Envelope encryption', ['KMS key (CMK)', 'mã hóa Data Key', 'Data Key mã hóa dữ liệu', 'Ciphertext lưu trữ']);
    case 'M11': return svgDR();
    case 'M12': return svgFlow('Kiến trúc 3-tier', ['Route 53 / CloudFront', 'ALB', 'Web ASG', 'App ASG', 'RDS Multi-AZ']);
    default: return '';
  }
}

function moduleQuestions(mod) {
  if (!DATA || !DATA.questions) return [];
  const scored = [];
  for (const q of DATA.questions) {
    const text = (q.scenario + ' ' + q.prompt + ' ' + q.options.map(o => o.text).join(' ')).toLowerCase();
    let score = 0;
    for (const k of mod.quizKw) if (text.includes(k.toLowerCase())) score++;
    if (score > 0) scored.push({ q, score });
  }
  scored.sort((a, b) => b.score - a.score || a.q.id - b.q.id);
  return scored.slice(0, 10).map(s => s.q);
}

function moduleProgress(id) {
  return (PROGRESS.modules && PROGRESS.modules[id]) || {};
}

function isCorrect(q, given) {
  const g = given.slice().sort();
  const e = (q.correctAnswers || []).slice().sort();
  return g.length > 0 && g.length === e.length && g.every((v, i) => v === e[i]);
}

function renderModule(arg) {
  if (arg) { renderModuleDetail(arg); return; }
  const done = MODULES.filter(m => moduleProgress(m.id).quizTotal).length;
  const pct = Math.round((done / MODULES.length) * 100);
  const cards = MODULES.map(m => {
    const p = moduleProgress(m.id);
    const score = p.quizTotal ? `Quiz: ${p.quizScore}/${p.quizTotal}` : 'Chưa làm quiz';
    const badge = p.quizTotal ? '<span class="badge done">Đã học</span>' : '<span class="badge not-started">Chưa học</span>';
    return `<a class="card module-card" href="#/modules/${m.id}">
      <div class="test-card-header"><h3>${m.id}. ${escapeHtml(m.title)}</h3>${badge}</div>
      <p class="muted">${score}</p>
    </a>`;
  }).join('');
  render(`
    <h1>Lộ trình 12 Module — SAA-C03</h1>
    <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
    <p class="muted">${done}/${MODULES.length} module đã hoàn thành quiz (${pct}%)</p>
    <div class="test-grid">${cards}</div>
  `);
  window.scrollTo(0, 0);
}

function renderModuleDetail(id) {
  const idx = MODULES.findIndex(m => m.id === id);
  if (idx < 0) { render('<p>Module not found.</p>'); return; }
  const mod = MODULES[idx];
  const questions = moduleQuestions(mod);
  if (!MQUIZ || MQUIZ.moduleId !== id) {
    MQUIZ = { moduleId: id, mode: 'review', answers: {}, checked: {}, submitted: false };
  }
  const prev = idx > 0 ? MODULES[idx - 1] : null;
  const next = idx < MODULES.length - 1 ? MODULES[idx + 1] : null;
  render(`
    <div class="module-detail">
      <p><a href="#/modules">← Tất cả module</a></p>
      <h1>${mod.id}. ${escapeHtml(mod.title)}</h1>
      <section class="card"><h2>Lý thuyết</h2>${mod.theory}</section>
      <section class="card"><h2>Sơ đồ</h2>${moduleDiagrams(mod.id)}</section>
      <section class="card">
        <div class="quiz-head">
          <h2>Câu hỏi luyện tập (${questions.length})</h2>
          <div class="mode-toggle">
            <button id="mode-review" class="${MQUIZ.mode === 'review' ? 'primary' : ''}">Review mode</button>
            <button id="mode-exam" class="${MQUIZ.mode === 'exam' ? 'primary' : ''}">Exam mode</button>
          </div>
        </div>
        <p class="muted">${MQUIZ.mode === 'review' ? 'Review: chọn đáp án rồi bấm Kiểm tra để xem ngay kết quả.' : 'Exam: làm hết rồi bấm Nộp bài để chấm điểm.'}</p>
        <div id="quiz-body">${questions.map((q, i) => renderQuizItem(q, i)).join('')}</div>
        ${MQUIZ.mode === 'exam' && !MQUIZ.submitted ? '<p><button id="quiz-submit" class="primary">Nộp bài</button></p>' : ''}
        ${MQUIZ.submitted ? `<p class="quiz-result">Điểm: <strong>${quizScore(questions)}/${questions.length}</strong></p>` : ''}
      </section>
      <nav class="theory-nav">
        ${prev ? `<a href="#/modules/${prev.id}">← ${prev.id}. ${escapeHtml(prev.title)}</a>` : '<span></span>'}
        ${next ? `<a href="#/modules/${next.id}">${next.id}. ${escapeHtml(next.title)} →</a>` : '<span></span>'}
      </nav>
    </div>
  `);
  wireQuiz(mod, questions);
  window.scrollTo(0, 0);
}

function renderQuizItem(q, i) {
  const given = MQUIZ.answers[q.id] || [];
  const revealed = MQUIZ.submitted || MQUIZ.checked[q.id];
  const exp = (q.correctAnswers || []).slice().sort();
  const inputType = q.isMultiSelect ? 'checkbox' : 'radio';
  const opts = q.options.map(o => {
    const sel = given.includes(o.letter);
    const correct = exp.includes(o.letter);
    let cls = 'quiz-opt';
    if (revealed) {
      if (correct) cls += ' opt-correct';
      else if (sel) cls += ' opt-wrong';
    } else if (sel) cls += ' selected';
    return `<label class="${cls}">
      <input type="${inputType}" name="q${q.id}" value="${o.letter}" ${sel ? 'checked' : ''} ${revealed ? 'disabled' : ''} data-qid="${q.id}" />
      <span><strong>${o.letter}.</strong> ${escapeHtml(o.text)}${revealed && correct ? ' ✓' : ''}</span>
    </label>`;
  }).join('');
  const result = revealed
    ? `<p class="quiz-verdict ${isCorrect(q, given) ? 'ok' : 'bad'}">${isCorrect(q, given) ? '✓ Đúng' : '✗ Sai'} — Đáp án: ${exp.join(', ')}</p>
       ${q.explanation ? `<p class="explanation">${escapeHtml(q.explanation).replace(/\n/g, '<br>')}</p>` : ''}`
    : '';
  const checkBtn = (MQUIZ.mode === 'review' && !revealed)
    ? `<button class="quiz-check" data-qid="${q.id}">Kiểm tra</button>` : '';
  return `<div class="quiz-item">
    <p class="quiz-q"><strong>Câu ${i + 1}.</strong> ${escapeHtml(q.scenario ? q.scenario + ' ' : '')}${escapeHtml(q.prompt)}${q.isMultiSelect ? ' <em>(Chọn nhiều)</em>' : ''}</p>
    ${opts}
    ${checkBtn}
    ${result}
  </div>`;
}

function quizScore(questions) {
  let n = 0;
  for (const q of questions) if (isCorrect(q, MQUIZ.answers[q.id] || [])) n++;
  return n;
}

function saveModuleResult(mod, questions) {
  if (!PROGRESS.modules) PROGRESS.modules = {};
  const wrong = questions.filter(q => !isCorrect(q, MQUIZ.answers[q.id] || [])).map(q => q.number);
  PROGRESS.modules[mod.id] = {
    quizScore: quizScore(questions),
    quizTotal: questions.length,
    wrong,
    date: new Date().toISOString(),
  };
  saveProgress();
}

function wireQuiz(mod, questions) {
  document.getElementById('mode-review')?.addEventListener('click', () => {
    MQUIZ = { moduleId: mod.id, mode: 'review', answers: {}, checked: {}, submitted: false };
    renderModuleDetail(mod.id);
  });
  document.getElementById('mode-exam')?.addEventListener('click', () => {
    MQUIZ = { moduleId: mod.id, mode: 'exam', answers: {}, checked: {}, submitted: false };
    renderModuleDetail(mod.id);
  });
  document.querySelectorAll('#quiz-body input').forEach(inp => {
    inp.addEventListener('change', e => {
      const qid = Number(e.target.dataset.qid);
      const q = questions.find(x => x.id === qid);
      const letter = e.target.value;
      if (q.isMultiSelect) {
        const set = new Set(MQUIZ.answers[qid] || []);
        e.target.checked ? set.add(letter) : set.delete(letter);
        MQUIZ.answers[qid] = [...set].sort();
      } else {
        MQUIZ.answers[qid] = [letter];
      }
    });
  });
  document.querySelectorAll('.quiz-check').forEach(btn => {
    btn.addEventListener('click', () => {
      MQUIZ.checked[Number(btn.dataset.qid)] = true;
      if (questions.length && questions.every(q => MQUIZ.checked[q.id]) && !MQUIZ.submitted) {
        MQUIZ.submitted = true;
        saveModuleResult(mod, questions);
      }
      renderModuleDetail(mod.id);
    });
  });
  document.getElementById('quiz-submit')?.addEventListener('click', () => {
    MQUIZ.submitted = true;
    saveModuleResult(mod, questions);
    renderModuleDetail(mod.id);
  });
}

window.addEventListener('hashchange', route);
window.addEventListener('DOMContentLoaded', async () => {
  initSplash();
  try {
    DATA = await loadData();
    PROGRESS = loadProgress();
    route();
  } catch (e) {
    render(`<p>Error: ${e.message}</p>`);
  }
});
