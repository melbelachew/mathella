import type { Topic, Progress } from './types.ts';
export function parseNumber(raw: string): number | null {
  const s = raw.trim();
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:\s*\/\s*[+-]?(?:\d+(?:\.\d*)?|\.\d+))?$/.test(s)) return null;
  const a = s.split('/').map(Number);
  const value = a.length === 2 ? a[0] / a[1] : a[0];
  return Number.isFinite(value) ? value : null;
}
export function recordCompletion(progress: Progress, key: string): Progress {
  return progress.done[key] ? progress : { sparks: progress.sparks + 1, done: { ...progress.done, [key]: true } };
}
const record = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const text = (v: unknown): v is string => typeof v === 'string' && v.length > 0 && v.length < 6000;
const texts = (v: unknown): v is string[] => Array.isArray(v) && v.length > 0 && v.every(text);
export function validateCurriculum(data: unknown): asserts data is Topic[] {
  if (!Array.isArray(data) || !data.length || data.length > 30) throw Error('Use an array of 1–30 topics.');
  const ids = new Set<string>();
  for (const t of data) {
    if (!record(t) || !text(t.id) || !text(t.name) || !text(t.subtitle) || ids.has(t.id)) throw Error('Every topic needs a unique id, name, and subtitle.');
    ids.add(t.id);
    for (const k of ['problems', 'detectives', 'cards']) if (!Array.isArray(t[k]) || !t[k].length || t[k].length > 200) throw Error('Each topic needs 1–200 problems, detectives, and cards.');
    for (const p of t.problems as unknown[]) {
      if (!record(p) || !text(p.title) || !text(p.text) || !text(p.unit) || typeof p.answer !== 'number' || !Number.isFinite(p.answer) || !texts(p.steps) || !['rectangle','square','triangle','parallelogram','text'].includes(String(p.shape))) throw Error('A problem needs a valid answer, shape, and explanation steps.');
      if (p.shape === 'text' ? !text(p.visual) : ![p.a,p.b].every(v => v === '?' || typeof v === 'number' && Number.isFinite(v) && v > 0)) throw Error('Check the diagram measurements or visual text.');
    }
    for (const d of t.detectives as unknown[]) if (!record(d) || !text(d.text) || !text(d.why) || !texts(d.options) || d.options.length < 2 || d.options.length > 8 || typeof d.correct !== 'number' || !Number.isInteger(d.correct) || d.correct < 0 || d.correct >= d.options.length) throw Error('Check detective options and the zero-based correct index.');
    for (const c of t.cards as unknown[]) if (!record(c) || ![c.prompt,c.formula,c.why,c.example].every(text)) throw Error('Each card needs prompt, formula, why, and example.');
  }
}
export function mergeCurriculum(current: Topic[], incoming: Topic[]): Topic[] {
  const replacements = new Map(incoming.map(t => [t.id,t]));
  const merged = current.map(t => replacements.get(t.id) ?? t).concat(incoming.filter(t => !current.some(c => c.id === t.id)));
  validateCurriculum(merged);
  return merged;
}
export function validProgress(v: unknown): v is Progress {
  return record(v) && typeof v.sparks === 'number' && Number.isSafeInteger(v.sparks) && v.sparks >= 0 && record(v.done) && Object.values(v.done).every(x => x === true);
}
