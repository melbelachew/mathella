import { resolveSavedCurriculum, completionKey } from '../src/curriculumCompatibility.ts';
import { LEGACY_CURRICULUM } from '../src/legacyCurriculum.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { answerMatches, parseNumber, recordCompletion, validateCurriculum, mergeCurriculum, validProgress } from '../src/learning.ts';
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

test('mixed numbers, equivalent fractions, and explicit decimal rounding are checked correctly', () => {
  const repeating = { answer: 5/6, decimalPlaces: 4 };
  for (const input of ['5/6', '10/12', '⅚', '.8333', '0.8333333333']) assert.equal(answerMatches(input, repeating), true, input);
  for (const input of ['.833', '.83', '8333/10000', '1/0']) assert.equal(answerMatches(input, repeating), false, input);
  for (const input of ['9/8', '1.125', '1 1/8', '1⅛']) assert.equal(answerMatches(input, { answer: 1.125 }), true, input);
  assert.equal(answerMatches('40.01', { answer: 40 }), false);
  assert.equal(parseNumber('-1 1/8'), -1.125);
  assert.equal(parseNumber('1 1/0'), null);
});
test('saved default lessons update while custom topics and original completion keys survive', () => {
  assert.deepEqual(resolveSavedCurriculum(structuredClone(LEGACY_CURRICULUM)), CURRICULUM);
  const custom = { ...LEGACY_CURRICULUM[0], name: 'My Area' };
  assert.equal(resolveSavedCurriculum([custom])[0], custom);
  for (const oldTopic of LEGACY_CURRICULUM) {
    const topic = CURRICULUM.find(t => t.id === oldTopic.id)!;
    for (const [mode, field] of [['solve','problems'], ['detect','detectives'], ['recall','cards']] as const) {
      oldTopic[field].forEach((p, oldIndex) => {
        const index = topic[field].findIndex(item => JSON.stringify(item) === JSON.stringify(p));
        if (index >= 0) assert.equal(completionKey(topic, mode, index), [topic.id, mode, oldIndex, JSON.stringify(p)].join('|'));
      });
    }
  }
});
test('expanded lessons validate mixed labels and reject invalid precision', () => {
  assert.equal(CURRICULUM.reduce((n,t) => n+t.problems.length,0),145);
  for (const precision of [-1, 1.5, 9]) {
    const bad = structuredClone(CURRICULUM); bad[0].problems[0].decimalPlaces = precision;
    assert.throws(() => validateCurriculum(bad));
  }
});

test('negative answers accept keyboard and typographic minus signs', () => {
  for (const [input, answer] of [['-2.5',-2.5], ['−2.5',-2.5], ['−3/4',-.75], ['−¾',-.75], ['-7',-7], ['−7',-7]] as const) {
    assert.equal(answerMatches(input, { answer }), true, input);
    assert.equal(answerMatches(input, { answer: -answer }), false, input);
  }
  for (const input of ['--7', '−−7', '-']) assert.equal(parseNumber(input), null);
});
test('unitless imports are valid but missing or non-text units are rejected', () => {
  const data = structuredClone(CURRICULUM);
  data[0].problems[0].unit = '';
  validateCurriculum(data);
  for (const unit of [undefined, null, 12]) {
    const bad = structuredClone(data) as any;
    bad[0].problems[0].unit = unit;
    assert.throws(() => validateCurriculum(bad));
  }
});
test('new topics appear for saved accounts without overwriting custom topics during partial import', () => {
  const custom = { ...CURRICULUM[2], name: 'Family ratios' };
  const previous = [CURRICULUM[0], CURRICULUM[1], custom];
  const upgraded = resolveSavedCurriculum(previous);
  assert.equal(upgraded.length, 7);
  assert.equal(upgraded.find(t => t.id === 'ratios'), custom);
  assert.deepEqual(resolveSavedCurriculum(upgraded), upgraded);
  const incoming = [{ ...CURRICULUM[0], name: 'Family area' }];
  const merged = mergeCurriculum(upgraded, resolveSavedCurriculum(incoming, false));
  assert.equal(merged.find(t => t.id === 'ratios'), custom);
  assert.equal(merged[0].name, 'Family area');
  const rational = CURRICULUM.find(t => t.id === 'rationals')!;
  const data = CURRICULUM.find(t => t.id === 'data')!;
  assert.equal(rational.problems.find(p => p.title === 'Which quadrant?')!.answer, 3);
  assert.equal(data.problems.find(p => p.title === 'Frequency table')!.answer, 4);
});
