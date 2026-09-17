// Parser for the AIP-C01 section map (data/aip-c01/sections.txt).
//
// The file has two parts: prose blocks under "SECTION N — Title" headings, and
// a closing "Quick Reference" table mapping every question to its section(s).
// The table is the authority for question placement; the headings supply the
// titles. A question that spans two sections is written "§5/8".
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const SECTION_HEADING_RE = /^SECTION (\d+)\s*[—–-]\s*(.+)$/;
const QUICK_REFERENCE_RE = /Q(\d+)\s*→\s*§([\d/]+)/g;

export function parseSections(text) {
  const sections = {};
  for (const line of text.split('\n')) {
    const m = line.trim().match(SECTION_HEADING_RE);
    if (m) sections[m[1]] = m[2].trim();
  }

  const questions = {};
  for (const [, number, list] of text.matchAll(QUICK_REFERENCE_RE)) {
    questions[number] = list.split('/').map(Number);
  }

  return { sections, questions };
}

// CLI: node scripts/parse-sections.js <input-txt> <output-json>
const invoked = fileURLToPath(import.meta.url) === process.argv[1];
if (invoked) {
  const [inputFile, outputFile] = process.argv.slice(2);
  if (!inputFile || !outputFile) {
    console.error('Usage: node scripts/parse-sections.js <input-txt> <output-json>');
    process.exit(1);
  }
  const parsed = parseSections(readFileSync(inputFile, 'utf8'));
  writeFileSync(outputFile, JSON.stringify(parsed, null, 2));
  console.log(
    `Parsed ${Object.keys(parsed.sections).length} sections, ` +
    `${Object.keys(parsed.questions).length} question mappings → ${outputFile}`
  );
}
