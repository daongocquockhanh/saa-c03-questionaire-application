import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
const TXT_PATH = join(PROJECT_ROOT, 'data', 'saa-c03.txt');
const OUT_PATH = join(PROJECT_ROOT, 'data', 'raw-questions.json');

const FOOTER_RE = /(Get Latest|passleader\.com)/i;
const URL_RE = /https?:\/\/\S+/g;

export function parseQuestions(text) {
  const cleaned = text
    .replace(/\f/g, '')
    .split('\n')
    .filter(line => !FOOTER_RE.test(line))
    .join('\n');

  const blocks = [];
  const re = /^QUESTION (\d+)\s*$/gm;
  let match;
  const indices = [];
  while ((match = re.exec(cleaned)) !== null) {
    indices.push({ number: Number(match[1]), start: match.index });
  }
  for (let i = 0; i < indices.length; i++) {
    const start = indices[i].start;
    const end = i + 1 < indices.length ? indices[i + 1].start : cleaned.length;
    blocks.push({ number: indices[i].number, raw: cleaned.slice(start, end) });
  }

  return blocks.map(parseBlock).filter(Boolean);
}

function parseBlock({ number, raw }) {
  const lines = raw.split('\n').slice(1);
  const optionRe = /^\s*([A-F])\.\s+(.*)$/;
  const answerRe = /^\s*Answer:\s*([A-F]+)\s*$/;
  const explRe = /^\s*Explanation:\s*$/;

  const options = [];
  let answerLetters = null;
  let explanationLines = [];
  let mode = 'scenario';
  let scenarioLines = [];
  let currentOption = null;

  for (const line of lines) {
    if (mode === 'scenario' || mode === 'options') {
      const optMatch = line.match(optionRe);
      if (optMatch) {
        if (currentOption) options.push(currentOption);
        currentOption = { letter: optMatch[1], text: optMatch[2].trim() };
        mode = 'options';
        continue;
      }
    }
    const ansMatch = line.match(answerRe);
    if (ansMatch) {
      if (currentOption) { options.push(currentOption); currentOption = null; }
      answerLetters = ansMatch[1].split('');
      mode = 'answer';
      continue;
    }
    if (explRe.test(line)) {
      if (currentOption) { options.push(currentOption); currentOption = null; }
      mode = 'explanation';
      continue;
    }

    if (mode === 'scenario') {
      scenarioLines.push(line);
    } else if (mode === 'options' && currentOption) {
      const trimmed = line.trim();
      if (trimmed) currentOption.text += ' ' + trimmed;
    } else if (mode === 'explanation') {
      explanationLines.push(line);
    }
  }
  if (currentOption) options.push(currentOption);

  const scenarioText = scenarioLines.join('\n').trim();
  const { scenario, prompt } = splitScenarioPrompt(scenarioText);

  const explanationText = explanationLines.join('\n').trim();
  const references = Array.from(explanationText.matchAll(URL_RE)).map(m => m[0].replace(/[).,]+$/, ''));
  const explanation = explanationText.replace(URL_RE, '').replace(/\n{3,}/g, '\n\n').trim() || null;

  const isMultiSelect = /Choose (two|three|2|3)/i.test(scenarioText) || (answerLetters && answerLetters.length > 1);

  return {
    id: number,
    number,
    scenario,
    prompt,
    options,
    correctAnswers: answerLetters ?? [],
    isMultiSelect: !!isMultiSelect,
    explanation,
    references,
    needsManualAnswer: !answerLetters,
  };
}

function splitScenarioPrompt(text) {
  const paragraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  if (paragraphs.length === 0) return { scenario: '', prompt: '' };
  const last = paragraphs[paragraphs.length - 1];
  if (last.endsWith('?')) {
    return {
      scenario: paragraphs.slice(0, -1).join('\n\n'),
      prompt: last,
    };
  }
  return { scenario: text, prompt: last };
}

const invoked = fileURLToPath(import.meta.url) === process.argv[1];
if (invoked) {
  const text = readFileSync(TXT_PATH, 'utf8');
  const questions = parseQuestions(text);
  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify(questions, null, 2));
  const missing = questions.filter(q => q.needsManualAnswer).map(q => q.number);
  console.log(`Parsed ${questions.length} questions → ${OUT_PATH}`);
  if (missing.length) console.warn(`⚠ Missing answers: ${missing.join(', ')}`);
}
