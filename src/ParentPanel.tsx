import { useRef, useState } from 'react';
import type { Topic } from './types';
import { mergeCurriculum, validateCurriculum } from './learning';
export default function ParentPanel({ topics, onImport }: { topics: Topic[]; onImport: (topics: Topic[]) => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [status, setStatus] = useState('');
  function download() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(topics, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = 'math-spark-curriculum.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <><button className="quiet" onClick={() => dialog.current?.showModal()}>For grown-ups</button><dialog ref={dialog} aria-labelledby="parent-title"><div className="dialoghead"><h2 id="parent-title">Your growing math studio</h2><button aria-label="Close" onClick={() => dialog.current?.close()}>×</button></div>
    <p>Start with Area, then try the Fractions starter. Each topic uses the same three practice modes. This is a starting curriculum, not a full sixth-grade course.</p>
    <h3>What progress means</h3><p>Sparks count completed challenges and honest formula check-ins, including ones completed with hints. They are encouragement, not a mastery score. Progress and added topics are saved only in this browser; clearing browser data removes them.</p>
    <h3>Add or update a topic</h3><p>Download the curriculum, edit its questions and explanations, then import it. A matching topic ID replaces that topic. Keep a copy for another device. Imports affect this browser; update the source curriculum to change the website for everyone.</p>
    <button onClick={download}>Download curriculum JSON</button><label className="upload">Import curriculum JSON<input type="file" accept=".json,application/json" onChange={async e => { const input = e.currentTarget; const file = input.files?.[0]; if (!file) return; try { if (file.size > 2_000_000) throw Error('Choose a JSON file under 2 MB.'); const data: unknown = JSON.parse(await file.text()); validateCurriculum(data); const merged = mergeCurriculum(topics, data); localStorage.setItem('mathspark-topics', JSON.stringify(merged)); onImport(merged); setStatus('Curriculum saved in this browser. Close this panel to explore it.'); } catch (error) { setStatus('Could not import: ' + (error instanceof Error ? error.message : 'Invalid file.')); } finally { input.value = ''; } }} /></label><p role="status">{status}</p>
    <h3>A gentle routine</h3><p>Try a few problems together. Ask “What are we finding?” before calculating. Revisit formula cards on another day and let her explain why the formula works.</p>
  </dialog></>;
}
