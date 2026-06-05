// Pure helpers for per-test Review/Redo and flag lists. Browser code in app.js
// derives each test's wrong/flagged questions from that test's saved attempt
// (lastResult) and does the rendering; these are unit-tested in
// scripts/review.test.js.

// Dedupe a list of ids and sort numerically.
export function normalizeFlagList(arr) {
  return [...new Set(arr || [])].map(Number).sort((a, b) => a - b);
}

// Add the id if absent, remove it if present. Returns a new array.
export function toggleInList(arr, id) {
  const list = arr || [];
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

// Return ids not present in `remove`, preserving order. Used for
// "wrong questions minus the ones fixed in redo".
export function subtractIds(ids, remove) {
  const drop = new Set(remove || []);
  return (ids || []).filter((id) => !drop.has(id));
}
