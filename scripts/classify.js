import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import Anthropic from '@anthropic-ai/sdk';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
const IN_PATH = join(PROJECT_ROOT, 'data', 'raw-questions.json');
const OUT_PATH = join(PROJECT_ROOT, 'data', 'questions.json');

const SYSTEM = `You are an AWS certification expert. Given an AWS SAA-C03 exam question, return the single best matching exam domain as a number 1-4.

Domains:
1 = Design Secure Architectures (IAM, encryption, KMS, Secrets Manager, security groups, NACLs, WAF, Shield, Macie, GuardDuty, identity, access control).
2 = Design Resilient Architectures (Multi-AZ, multi-Region, backups, DR, failover, RDS replicas, Aurora, S3 versioning, Route 53 health checks, decoupling with SQS/SNS).
3 = Design High-Performing Architectures (caching, CloudFront, ElastiCache, EBS types, throughput, Auto Scaling for performance, EFS vs FSx, Aurora performance, read replicas for read scaling).
4 = Design Cost-Optimized Architectures (Spot, Savings Plans, Reserved Instances, S3 storage classes, Glacier, lifecycle policies, right-sizing, cost reporting).

Respond with ONLY the single digit 1, 2, 3, or 4.`;

export function buildPrompt(q) {
  const opts = q.options.map(o => `${o.letter}. ${o.text}`).join('\n');
  return `Question ${q.number}:
${q.scenario}

${q.prompt}

${opts}

Which AWS SAA-C03 domain (1=Secure, 2=Resilient, 3=High-Performing, 4=Cost-Optimized) does this question test?`;
}

export function parseDomainResponse(text) {
  if (!text) return null;
  const m = text.match(/[1-4]/);
  if (!m) return null;
  return Number(m[0]);
}

export function mergeClassifications(questions, cache) {
  return questions.map(q => cache[q.id] != null ? { ...q, domain: cache[q.id] } : q);
}

async function classifyOne(client, q, { retries = 3 } = {}) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const resp = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 8,
        system: SYSTEM,
        messages: [{ role: 'user', content: buildPrompt(q) }],
      });
      const text = resp.content.map(b => b.text || '').join('');
      const domain = parseDomainResponse(text);
      if (domain) return domain;
      console.warn(`Q${q.number}: unparseable response "${text}", retrying`);
    } catch (e) {
      console.warn(`Q${q.number} attempt ${attempt} failed: ${e.message}`);
      if (attempt < retries) await new Promise(r => setTimeout(r, 1000 * attempt));
    }
  }
  return null;
}

const invoked = fileURLToPath(import.meta.url) === process.argv[1];
if (invoked) {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('Set ANTHROPIC_API_KEY env var.');
    process.exit(1);
  }
  const questions = JSON.parse(readFileSync(IN_PATH, 'utf8'));
  const cache = existsSync(OUT_PATH)
    ? Object.fromEntries(JSON.parse(readFileSync(OUT_PATH, 'utf8')).filter(q => q.domain).map(q => [q.id, q.domain]))
    : {};
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const out = mergeClassifications(questions, cache);
  let classified = 0;
  for (let i = 0; i < out.length; i++) {
    if (out[i].domain) continue;
    out[i].domain = await classifyOne(client, out[i]);
    classified++;
    if (classified % 10 === 0) {
      mkdirSync(dirname(OUT_PATH), { recursive: true });
      writeFileSync(OUT_PATH, JSON.stringify(out, null, 2));
      console.log(`Progress: ${classified} classified (${i + 1}/${out.length})`);
    }
  }
  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify(out, null, 2));

  const dist = out.reduce((acc, q) => ((acc[q.domain] = (acc[q.domain] || 0) + 1), acc), {});
  console.log(`Done. Distribution:`, dist);
}
