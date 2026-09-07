import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseNumber, recordCompletion, validateCurriculum, mergeCurriculum, validProgress } from '../src/learning.ts';
import { CURRICULUM } from '../src/curriculum.ts';
test('accepts equivalent numeric answers without accepting malformed input', () => {
  for (const [input, expected] of [['3/4', .75], [' 6/8 ', .75], ['.375', .375], [' -1/2 ', -.5], ['3.0', 3]] as const) assert.equal(parseNumber(input), expected);
  for (const input of ['', '1/0', '1/2/3', '12abc', 'Infinity', '1e4', '2 + 3']) assert.equal(parseNumber(input), null);
});
test('awards each challenge once, including retries after hints', () => {
  const p = recordCompletion({ sparks: 0, done: {} }, 'area:1');
  assert.equal(p.sparks, 1); assert.equal(recordCompletion(p, 'area:1').sparks, 1);
  assert.equal(recordCompletion(p, 'area:2').sparks, 2);
});
test('bundled curriculum is valid and every problem has a finite numeric answer', () => {
  validateCurriculum(CURRICULUM);
  for (const topic of CURRICULUM) for (const p of topic.problems) assert.equal(parseNumber(String(p.answer)), p.answer);
});
test('invalid imports are rejected and a replacement preserves unrelated topics and order', () => {
  const bad = structuredClone(CURRICULUM); bad[0].detectives[0].correct = 999;
  assert.throws(() => validateCurriculum(bad));
  assert.throws(() => validateCurriculum([CURRICULUM[0], CURRICULUM[0]]));
  assert.throws(() => validateCurriculum([]));
  const changed = { ...CURRICULUM[0], name: 'Updated Area' };
  const merged = mergeCurriculum(CURRICULUM, [changed]);
  assert.equal(merged[0].name, 'Updated Area'); assert.equal(merged[1], CURRICULUM[1]);
  assert.equal(CURRICULUM[0].name, 'Area');
});
test('corrupted progress does not become a displayed score', () => {
  assert.equal(validProgress({ sparks: -1, done: {} }), false);
  assert.equal(validProgress({ sparks: 1, done: { x: 'yes' } }), false);
  assert.equal(validProgress({ sparks: 1, done: { x: true } }), true);
});
