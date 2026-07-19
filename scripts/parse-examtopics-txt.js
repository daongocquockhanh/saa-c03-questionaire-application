// Parser for ExamTopics discussion-dump txt files (DOP-C02 / AIP-C01 format).
// Format: "Question #N" headings, option letters on their own line (" A.")
// followed by the option text. No answers or explanations in the dump.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
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

// CLI: node scripts/parse-examtopics-txt.js <input-dir> <output-file>
// Reads every non "-ans" .txt in input-dir, concatenates, parses, writes JSON.
const invoked = fileURLToPath(import.meta.url) === process.argv[1];
if (invoked) {
  const { readdirSync } = await import('node:fs');
  const [inputDir, outputFile] = process.argv.slice(2);
  if (!inputDir || !outputFile) {
    console.error('Usage: node scripts/parse-examtopics-txt.js <input-dir> <output-file>');
    process.exit(1);
  }
  const files = readdirSync(inputDir)
    .filter(f => f.endsWith('.txt') && !f.includes('-ans'))
    .sort((a, b) => parseInt(a) - parseInt(b));
  const text = files.map(f => readFileSync(join(inputDir, f), 'utf8')).join('\n');
  const questions = parseExamTopicsTxt(text);
  const numbers = new Set(questions.map(q => q.number));
  if (numbers.size !== questions.length) throw new Error('Duplicate question numbers');
  mkdirSync(dirname(outputFile), { recursive: true });
  writeFileSync(outputFile, JSON.stringify(questions, null, 2));
  console.log(`Parsed ${questions.length} questions from ${files.length} files → ${outputFile}`);
}