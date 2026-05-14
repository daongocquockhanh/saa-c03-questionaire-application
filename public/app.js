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
function renderRunner(testId) {
  render(`<h1>Test ${testId}</h1><p>Runner placeholder.</p>`);
}
function renderResult(testId) {
  render(`<h1>Result ${testId}</h1><p>Result placeholder.</p>`);
}

window.addEventListener('hashchange', route);
window.addEventListener('DOMContentLoaded', async () => {
  try {
    DATA = await loadData();
    PROGRESS = loadProgress();
    route();
  } catch (e) {
    render(`<p>Error: ${e.message}</p>`);
  }
});
