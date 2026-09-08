import { resolveSavedCurriculum } from './curriculumCompatibility';
import { useEffect, useState } from 'react';
import { CURRICULUM } from './curriculum';
import { mergeCurriculum, recordCompletion, validateCurriculum, validProgress } from './learning';
import type { Mode, Progress, Topic } from './types';
import Activity from './Activity';
import ParentPanel from './ParentPanel';
function loadTopics(): Topic[] { try { const saved: unknown = JSON.parse(localStorage.getItem('mathspark-topics') ?? 'null'); if (saved) { validateCurriculum(saved); return resolveSavedCurriculum(saved); } } catch { /* Missing or invalid storage uses bundled curriculum. */ } return CURRICULUM; }
function loadProgress(): Progress { try { const saved: unknown = JSON.parse(localStorage.getItem('mathspark-progress') ?? 'null'); if (validProgress(saved)) return saved; } catch { /* Browser storage is optional. */ } return { sparks: 0, done: {} }; }
const modes: { id: Mode; label: string }[] = [{ id: 'solve', label: 'Solve & explore' }, { id: 'detect', label: 'Word detective' }, { id: 'recall', label: 'Formula flip' }];
export default function App({ cloud }: { cloud?: { topics: Topic[]; sparks: number; scope: string; onAward: (key: string) => void; onImport: (topics: Topic[]) => Promise<void> } }) {
  const [topics, setTopics] = useState(loadTopics);
  const [topicIndex, setTopicIndex] = useState(0);
  const [mode, setMode] = useState<Mode>('solve');
  const [progress, setProgress] = useState(loadProgress);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [revision, setRevision] = useState(0);
  const shownTopics = cloud?.topics ?? topics;
  const topic = shownTopics[topicIndex] ?? shownTopics[0];
  useEffect(() => { if (cloud) return; try { localStorage.setItem('mathspark-progress', JSON.stringify(progress)); } catch { setStorageAvailable(false); } }, [progress, cloud]);
  return <><header><a className="brand" href="./"><span className="logo">✳</span> math spark<span className="edition">YOUR MATH STUDIO</span></a><ParentPanel topics={shownTopics} synced={!!cloud} onImport={async updated => { if (cloud) await cloud.onImport(updated); else { const merged = mergeCurriculum(topics, updated); localStorage.setItem('mathspark-topics', JSON.stringify(merged)); setTopics(merged); } setTopicIndex(0); setMode('solve'); setRevision(r => r + 1); }} /></header>
    <main><aside><div className="eyebrow">YOUR EXPLORATIONS</div><div id="topics">{shownTopics.map((t, i) => <button key={t.id} className={`topic ${i === topicIndex ? 'active' : ''}`} aria-pressed={i === topicIndex} onClick={() => { setTopicIndex(i); setMode('solve'); }}>{i === 0 ? '▧' : '◒'} &nbsp;{t.name}<small>{t.problems.length} guided challenges</small></button>)}</div><div className="note"><span>✦</span><h3>Curiosity counts.</h3><p>No timer. No lost points.<br />Every hint is a way forward.</p></div><div className="local">{cloud ? 'Progress is linked to this learner.' : storageAvailable ? 'Progress stays in this browser.' : 'Progress is temporary: browser storage is unavailable.'}</div></aside>
    <section className="workspace"><div className="intro"><div><div className="eyebrow">EXPLORATION {String(topicIndex + 1).padStart(2, '0')} · {topic.name.toUpperCase()}</div><h1>{topic.id === 'area' ? 'Make room for an aha.' : 'Find your next aha.'}</h1><p>{topic.subtitle}</p></div><div className="sparkcount" aria-live="polite"><strong>{cloud?.sparks ?? progress.sparks}</strong><span>✦ sparks earned</span></div></div><nav aria-label="Practice modes">{modes.map((m, i) => <button key={m.id} className={mode === m.id ? 'active' : ''} aria-pressed={mode === m.id} onClick={() => setMode(m.id)}>0{i + 1} &nbsp;{m.label}</button>)}</nav>
    <Activity key={`${cloud?.scope ?? "guest"}:${topic.id}:${mode}:${revision}`} topic={topic} mode={mode} onMode={setMode} onAward={key => cloud ? cloud.onAward(key) : setProgress(previous => recordCompletion(previous, key))} />
    <div className="bottom"><span>✧ Mistakes are clues. You can always try again.</span><span>BUILT FOR SMALL WINS</span></div></section></main></>;
}
