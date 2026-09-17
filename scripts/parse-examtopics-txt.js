// Parser for ExamTopics discussion-dump txt files (DOP-C02 / AIP-C01).
//
// Two dump styles are supported:
//   "hash"     — "Question #N" headings, option letters alone on a line (" A.")
//                followed by the option text, scenario on unwrapped long lines.
//   "condensed"— "QUESTION N" headings, "Post ID:" metadata, hard-wrapped
//                scenario prose, and options as "A. text" with hanging-indent
//                continuation lines.
// Neither style carries answers or explanations.
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Lines carrying no question content: rules, URLs, scrape metadata, and the
// ExamTopics paywall teaser ("Most upvoted answer: A (35%)") which is a
// placeholder, not a real answer.
const NOISE_RE = /^(=+|-{3,}|URL:.*|Post ID:.*|Most upvoted answer:.*)$/;
const QUESTION_RE = /^Question #(\d+)/;
const CONDENSED_QUESTION_RE = /^QUESTION (\d+)\s*$/;
const OPTION_LETTER_RE = /^\s*([A-F])\.\s*(.*)$/;
// Dump files are named by the question range they cover (e.g. "98-117.txt").
// Anything else in the directory (section maps, notes) is not a dump.
const DUMP_FILE_RE = /^\d+-\d+\.txt$/;
// Condensed dumps close with a scrape footnote about post IDs and vote data.
// Everything from there on is commentary, not question content.
const FOOTER_RE = /^NOTE:/;

export function parseExamTopicsTxt(text) {
  const lines = text.split('\n').filter(l => !NOISE_RE.test(l.trim()));

  // Split into question blocks, remembering which heading style opened each so
  // the body can be unwrapped only where it was hard-wrapped.
  const blocks = [];
  let current = null;
  for (const line of lines) {
    const trimmed = line.trim();
    const hash = trimmed.match(QUESTION_RE);
    const condensed = trimmed.match(CONDENSED_QUESTION_RE);
    if (hash || condensed) {
      if (current) blocks.push(current);
      current = {
        number: Number((hash || condensed)[1]),
        style: hash ? 'hash' : 'condensed',
        lines: [],
      };
    } else if (FOOTER_RE.test(trimmed)) {
      if (current) blocks.push(current);
      current = null;
      break;
    } else if (current) {
      current.lines.push(line);
    }
  }
  if (current) blocks.push(current);

  return blocks.map(parseBlock);
}

function parseBlock({ number, style, lines }) {
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
    if (!line) {
      // Blank lines delimit paragraphs in condensed bodies; elsewhere they are
      // pure whitespace and carry nothing.
      if (!currentOption && bodyLines.length > 0) bodyLines.push('');
      continue;
    }
    if (currentOption) {
      currentOption.text = (currentOption.text + ' ' + line).trim();
    } else {
      bodyLines.push(line);
    }
  }
  if (currentOption) options.push(currentOption);

  const units = style === 'condensed' ? unwrapParagraphs(bodyLines) : bodyLines.filter(Boolean);
  const body = units.join('\n');
  const { scenario, prompt } = splitScenarioPrompt(units, style);
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

// Rejoins hard-wrapped lines into one line per paragraph; blank lines separate
// paragraphs.
function unwrapParagraphs(lines) {
  const paragraphs = [];
  let buffer = [];
  for (const line of lines) {
    if (line === '') {
      if (buffer.length) paragraphs.push(buffer.join(' '));
      buffer = [];
    } else {
      buffer.push(line);
    }
  }
  if (buffer.length) paragraphs.push(buffer.join(' '));
  return paragraphs;
}

// Splits on the whitespace that follows sentence-ending punctuation, allowing a
// closing quote or bracket after it. Splitting (rather than matching) means no
// text can be dropped.
const SENTENCE_BOUNDARY_RE = /(?<=[.!?]["'\u2019\u201d)\]]?)\s+/;

// Splits a body into the scenario and the question/requirement sentence shown
// in bold.
//
// Hash dumps keep the question on its own line, so the last line ending in '?'
// (or the final line) is the prompt. Condensed dumps are hard-wrapped prose
// where the question sentence may be buried at the end of a paragraph - or
// missing entirely, replaced by a requirement statement - so there the final
// sentence of the last paragraph is the prompt.
function splitScenarioPrompt(units, style) {
  if (units.length === 0) return { scenario: '', prompt: '' };

  if (style === 'condensed') {
    const last = units[units.length - 1];
    const earlier = units.slice(0, -1);
    const sentences = last.split(SENTENCE_BOUNDARY_RE).map(s => s.trim()).filter(Boolean);
    if (sentences.length > 1) {
      return {
        scenario: [...earlier, sentences.slice(0, -1).join(' ')].join('\n'),
        prompt: sentences[sentences.length - 1],
      };
    }
    if (/\?\s*$/.test(last)) return { scenario: earlier.join('\n'), prompt: last };
    // One sentence, no question mark: scenario and requirement are fused and
    // there is no separate sentence to bold.
    return { scenario: units.join('\n'), prompt: '' };
  }

  for (let i = units.length - 1; i >= 0; i--) {
    if (/\?\s*(\(Choose (two|three)\.?\))?\s*$/i.test(units[i])) {
      return {
        scenario: units.slice(0, i).join('\n'),
        prompt: units.slice(i).join('\n'),
      };
    }
  }
  return {
    scenario: units.slice(0, -1).join('\n'),
    prompt: units[units.length - 1],
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

// Reads every "<from>-<to>.txt" dump file in inputDir, concatenates them
// (sorted numerically by leading filename number), and parses the result.
// Other .txt files in the directory are ignored. Throws if any question number
// appears more than once across the files.
export function parseExamTopicsDir(inputDir) {
  const files = readdirSync(inputDir)
    .filter(f => DUMP_FILE_RE.test(f))
    .sort(compareByLeadingNumber);
  // Parse each file separately: a file boundary is a question boundary, so
  // concatenating first would let one file's header lines run into the
  // previous file's last option.
  const questions = files.flatMap(f => parseExamTopicsTxt(readFileSync(join(inputDir, f), 'utf8')));

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
