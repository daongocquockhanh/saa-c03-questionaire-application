// Registry of exams the app can serve. Order matters: first entry is the default.
// unscoredPerTest mirrors the real exam's experimental-question count (SAA: 15 of 65).
export const EXAMS = [
  { code: 'saa-c03', title: 'SAA-C03', dataFile: 'tests.json', hasTheory: true, unscoredPerTest: 15 },
  {
    code: 'aip-c01', title: 'AIP-C01', dataFile: 'tests-aip-c01.json', hasTheory: false, unscoredPerTest: 0,
    note: 'Answers are AI-generated and unverified — treat as study guidance, not ground truth.',
  },
];

export function resolveExam(code) {
  return EXAMS.find(e => e.code === code) || EXAMS[0];
}
