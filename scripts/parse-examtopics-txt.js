// Parser for ExamTopics discussion-dump txt files (DOP-C02 / AIP-C01 format).
// Format: "Question #N" headings, option letters on their own line (" A.")
// followed by the option text. No answers or explanations in the dump.
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const SEPARATOR_RE = /^(=+|URL:.*)$/;
const QUESTION_RE = /^Question #(\d+)/;
const OPTION_LETTER_RE = /^\s*([A-F])\.\s*(.*)$/;

export function parseExamTopicsTxt(text) {
  const lines = text.split('\n').filter(l => !SEPARATOR_RE.test(l.trim()));

  // Split into question blocks.
  const blocks = [];
  let current = null;
  for (const line of lines) {
    const m = line.trim().match(QUESTION_RE);
    if (m) {
      if (current) blocks.push(current);
      current = { number: Number(m[1]), lines: [] };
    } else if (current) {
      current.lines.push(line);
    }
  }
  if (current) blocks.push(current);

  return blocks.map(parseBlock);
}

function parseBlock({ number, lines }) {
  const bodyLines = [];
  const options = [];
  let currentOption = null;

  for (const raw of lines) {
    const line = raw.trim();
    const m = line.match(OPTION_LETTER_RE);
    if (m) {
      if (currentOption) options.push(currentOption);
      currentOption = { letter: m[1], text: m[2].trim() };
      continue;
    }
    if (!line) continue;
    if (currentOption) {
      currentOption.text = (currentOption.text + ' ' + line).trim();
    } else {
      bodyLines.push(line);
    }
  }
  if (currentOption) options.push(currentOption);

  const body = bodyLines.join('\n');
  const { scenario, prompt } = splitScenarioPrompt(bodyLines);
  const isMultiSelect = /\(Choose (two|three)\.?\)/i.test(body);

  return {
    id: number,
    number,
    scenario,
    prompt,
    options,
    correctAnswers: [],
    isMultiSelect,
    explanation: null,
    references: [],
    needsManualAnswer: true,
  };
}

// Last line ending with '?' (or the final line) is the prompt; the rest is scenario.
function splitScenarioPrompt(bodyLines) {
  if (bodyLines.length === 0) return { scenario: '', prompt: '' };
  let idx = bodyLines.length - 1;
  for (let i = bodyLines.length - 1; i >= 0; i--) {
    if (/\?\s*(\(Choose (two|three)\.?\))?\s*$/i.test(bodyLines[i])) { idx = i; break; }
  }
  return {
    scenario: bodyLines.slice(0, idx).join('\n'),
    prompt: bodyLines.slice(idx).join('\n'),
  };
}

// Sort filenames numerically by their leading number (e.g. "12-foo.txt" before
// "100-bar.txt"); files without a leading number sort after numeric ones,
// alphabetically among themselves.
function compareByLeadingNumber(a, b) {
  const aMatch = a.match(/^(\d+)/);
  const bMatch = b.match(/^(\d+)/);
  if (aMatch && bMatch) return Number(aMatch[1]) - Number(bMatch[1]);
  if (aMatch) return -1;
  if (bMatch) return 1;
  return a.localeCompare(b);
}

// Reads every non "-ans" .txt file in inputDir, concatenates them (sorted
// numerically by leading filename number), and parses the result. Throws if
// any question number appears more than once across the files.
export function parseExamTopicsDir(inputDir) {
  const files = readdirSync(inputDir)
    .filter(f => f.endsWith('.txt') && !f.includes('-ans'))
    .sort(compareByLeadingNumber);
  const text = files.map(f => readFileSync(join(inputDir, f), 'utf8')).join('\n');
  const questions = parseExamTopicsTxt(text);

  const seen = new Set();
  const duplicates = new Set();
  for (const q of questions) {
    if (seen.has(q.number)) duplicates.add(q.number);
    seen.add(q.number);
  }
  if (duplicates.size > 0) {
    const names = [...duplicates].sort((a, b) => a - b).join(', ');
    throw new Error(`Duplicate question numbers: ${names}`);
  }

  return questions;
}

// CLI: node scripts/parse-examtopics-txt.js <input-dir> <output-file>
const invoked = fileURLToPath(import.meta.url) === process.argv[1];
if (invoked) {
  const [inputDir, outputFile] = process.argv.slice(2);
  if (!inputDir || !outputFile) {
    console.error('Usage: node scripts/parse-examtopics-txt.js <input-dir> <output-file>');
    process.exit(1);
  }
  const questions = parseExamTopicsDir(inputDir);
  mkdirSync(dirname(outputFile), { recursive: true });
  writeFileSync(outputFile, JSON.stringify(questions, null, 2));
  console.log(`Parsed ${questions.length} questions → ${outputFile}`);
}
