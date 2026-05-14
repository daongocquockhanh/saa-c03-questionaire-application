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
  render('<h1>Dashboard</h1><p>Tests will be listed here.</p>');
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
