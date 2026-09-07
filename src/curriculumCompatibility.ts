import { CURRICULUM } from './curriculum.ts';
import { LEGACY_CURRICULUM } from './legacyCurriculum.ts';
import type { Topic, Mode } from './types.ts';

// Upgrade only untouched bundled topics; family-authored lessons stay intact.
export function resolveSavedCurriculum(saved: Topic[]): Topic[] {
  return saved.map(topic => {
    const legacy = LEGACY_CURRICULUM.find(t => t.id === topic.id);
    return legacy && JSON.stringify(topic) === JSON.stringify(legacy)
      ? CURRICULUM.find(t => t.id === topic.id) ?? topic : topic;
  });
}

export function completionKey(topic: Topic, mode: Mode, index: number): string {
  const field = mode === 'solve' ? 'problems' : mode === 'detect' ? 'detectives' : 'cards';
  const item = JSON.stringify(topic[field][index]);
  const legacy = LEGACY_CURRICULUM.find(t => t.id === topic.id);
  const oldIndex = legacy?.[field].findIndex(p => JSON.stringify(p) === item) ?? -1;
  return [topic.id, mode, oldIndex >= 0 ? oldIndex : index, item].join('|');
}
