// Pure helpers for the Review / Redo page and flag lists. Browser code in
// app.js does the rendering and localStorage wiring; these are unit-tested in
// scripts/review.test.js.

// Ids whose last result was not fully correct (wrong or partial), sorted.
// stats shape: { [id]: { verdict: 'correct'|'partial'|'wrong', given: [...] } }
export function wrongPool(stats) {
  const s = stats || {};
  return Object.keys(s)
    .filter((id) => s[id] && s[id].verdict !== 'correct')
    .map(Number)
    .sort((a, b) => a - b);
}

// Dedupe a list of ids and sort numerically.
export function normalizeFlagList(arr) {
  return [...new Set(arr || [])].map(Number).sort((a, b) => a - b);
}

// Add the id if absent, remove it if present. Returns a new array.
export function toggleInList(arr, id) {
  const list = arr || [];
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}
