const STORE_KEY = 'saa-c03-progress';
let DATA = null;
let PROGRESS = null;

function loadProgress() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || { tests: {} }; }
  catch { return { tests: {} }; }
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
  else renderDashboard();
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
