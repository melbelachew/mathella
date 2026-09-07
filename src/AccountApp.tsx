import { resolveSavedCurriculum } from './curriculumCompatibility';
import { useEffect, useRef, useState } from 'react';
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { collection, doc, onSnapshot, runTransaction } from 'firebase/firestore';
import { auth, db } from './firebase';
import App from './App';
import { CURRICULUM } from './curriculum';
import { friendlyError, saveCompletion, saveCurriculum } from './cloud';
import { validateCurriculum, validProgress } from './learning';
import type { Topic } from './types';

export default function AccountApp() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => onAuthStateChanged(auth, setUser, e => { setError(friendlyError(e)); setUser(null); }), []);
  async function login() { setBusy(true); setError(''); try { const provider = new GoogleAuthProvider(); provider.setCustomParameters({ prompt: 'select_account' }); await signInWithPopup(auth, provider); } catch (e) { setError(friendlyError(e)); } finally { setBusy(false); } }
  if (user === undefined) return <div className="accountbar" role="status">Opening your math studio…</div>;
  if (user) return <Family key={user.uid} user={user} />;
  return <><div className="accountbar"><span>Guest practice · saved in this browser</span><button disabled={busy} onClick={login}>{busy ? 'Opening Google…' : 'Parent sign in with Google'}</button>{error && <p role="alert">{error}</p>}</div><App /></>;
}

type Learner = { id: string; nickname: string };
type Pending = { learner: string; key: string };
function Family({ user }: { user: User }) {
  const [learners, setLearners] = useState<Learner[]>([]);
  const [selected, setSelected] = useState('');
  const [topics, setTopics] = useState<Topic[]>(CURRICULUM);
  const [loaded, setLoaded] = useState({ learners: false, topics: false });
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [connectionError, setConnectionError] = useState('');
  const [retry, setRetry] = useState(0);
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<Pending[]>([]);
  const pendingRef = useRef<Pending[]>([]);
  const inFlight = useRef(new Set<string>());
  const [savingCount, setSavingCount] = useState(0);
  const [migration, setMigration] = useState('');
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => { const update = () => setOnline(navigator.onLine); window.addEventListener('online', update); window.addEventListener('offline', update); return () => { window.removeEventListener('online', update); window.removeEventListener('offline', update); }; }, []);
  useEffect(() => {
    setConnectionError(''); setLoaded({ learners: false, topics: false });
    const fail = (e: unknown) => setConnectionError(friendlyError(e));
    const stopLearners = onSnapshot(collection(db, 'users', user.uid, 'learners'), snap => {
      const next = snap.docs.map(d => ({ id: d.id, nickname: String(d.data().nickname) })).sort((a, b) => a.nickname.localeCompare(b.nickname));
      setLearners(next); setSelected(old => next.some(l => l.id === old) ? old : next[0]?.id ?? ''); setLoaded(old => ({ ...old, learners: true }));
    }, fail);
    const stopTopics = onSnapshot(doc(db, 'users', user.uid, 'settings', 'curriculum'), snap => {
      try { const next: unknown = snap.exists() ? JSON.parse(snap.data().json) : CURRICULUM; validateCurriculum(next); setTopics(resolveSavedCurriculum(next)); setLoaded(old => ({ ...old, topics: true })); } catch (e) { fail(e); }
    }, fail);
    return () => { stopLearners(); stopTopics(); };
  }, [user.uid, retry]);
  useEffect(() => { const warn = (e: BeforeUnloadEvent) => { if (pendingRef.current.length || busy) { e.preventDefault(); e.returnValue = ''; } }; window.addEventListener('beforeunload', warn); return () => window.removeEventListener('beforeunload', warn); }, [busy]);
  function updatePending(items: Pending[]) { pendingRef.current = items; setPending(items); }
  async function attempt(entry: Pending) {
    const id = entry.learner + '|' + entry.key;
    if (inFlight.current.has(id)) return;
    inFlight.current.add(id); setSavingCount(n => n + 1);
    try { await saveCompletion(user.uid, entry.learner, entry.key); updatePending(pendingRef.current.filter(p => !(p.learner === entry.learner && p.key === entry.key))); }
    catch (e) { setError(friendlyError(e)); }
    finally { inFlight.current.delete(id); setSavingCount(n => n - 1); }
  }
  function award(learner: string, key: string) {
    const entry = { learner, key };
    if (!pendingRef.current.some(p => p.learner === learner && p.key === key)) updatePending([...pendingRef.current, entry]);
    void attempt(entry);
  }
  async function addLearner(e: React.FormEvent) {
    e.preventDefault(); const name = nickname.trim(); if (!name || name.length > 40) return;
    setBusy(true); setError(''); const ref = doc(collection(db, 'users', user.uid, 'learners'));
    try { await runTransaction(db, async tx => { tx.set(ref, { nickname: name }); }); setSelected(ref.id); setNickname(''); } catch (e) { setError(friendlyError(e)); } finally { setBusy(false); }
  }
  async function importBrowser() {
    if (!selected) return; setBusy(true); setMigration('Importing into this learner…'); setError('');
    try {
      const localTopics: unknown = JSON.parse(localStorage.getItem('mathspark-topics') ?? 'null');
      const localProgress: unknown = JSON.parse(localStorage.getItem('mathspark-progress') ?? 'null');
      if (localTopics) { validateCurriculum(localTopics); await saveCurriculum(user.uid, localTopics); }
      if (localProgress && !validProgress(localProgress)) throw Error('The browser progress data is invalid. It has been left untouched.');
      if (validProgress(localProgress)) for (const key of Object.keys(localProgress.done)) await saveCompletion(user.uid, selected, key);
      setMigration(localTopics || localProgress ? 'Browser data imported. Existing cloud completions were kept; duplicates earn no extra sparks. The browser copy is still available.' : 'No guest data was found on this website in this browser.');
    } catch (e) { setMigration('Import did not finish. Any saved items are safe; retrying won’t duplicate sparks.'); setError(friendlyError(e)); }
    finally { setBusy(false); }
  }
  async function logout() {
    if ((pending.length || busy) && !window.confirm('Some work has not finished saving. Sign out and discard unsaved work?')) return;
    try { await signOut(auth); } catch (e) { setError(friendlyError(e)); }
  }
  const ready = loaded.learners && loaded.topics && !connectionError;
  return <><div className="accountbar"><span>Parent account · {user.email ?? user.displayName ?? 'Signed in'}</span><button className="quiet" onClick={logout}>Sign out</button><span role="status">{connectionError ? 'Cloud unavailable' : !loaded.learners || !loaded.topics ? 'Connecting…' : !online ? 'Offline · cloud saves need a connection' : savingCount ? 'Saving progress…' : pending.length ? `${pending.length} unsaved challenge(s)` : 'Cloud sync on'}</span></div>
    <details className="familytools" open={!learners.length}><summary>Learners & browser import</summary><div className="familycontent">
      {learners.length > 0 && <label>Learner <select value={selected} disabled={busy} onChange={e => { setSelected(e.target.value); setMigration(''); }}>{learners.map(l => <option key={l.id} value={l.id}>{l.nickname}</option>)}</select></label>}
      <form onSubmit={addLearner}><label htmlFor="nickname">Add a learner nickname</label><input id="nickname" value={nickname} onChange={e => setNickname(e.target.value)} maxLength={40} placeholder="Nickname" required disabled={!ready || busy} /><button disabled={!ready || busy || !nickname.trim()}>Add learner</button></form>
      <p>Each learner has separate progress. Imported topics are shared within this parent account. A learner nickname is not a separate login.</p>
      <button className="quiet" disabled={!ready || !selected || busy} onClick={importBrowser}>Import this browser’s guest data into {learners.find(l => l.id === selected)?.nickname ?? 'selected learner'}</button><p role="status">{migration}</p>
    </div></details>
    {(connectionError || error || pending.length > 0) && <div className="cloudnotice" role="alert"><p>{connectionError || error || 'Some progress has not been saved yet.'}</p>{connectionError && <button onClick={() => setRetry(n => n + 1)}>Retry connection</button>}{pending.length > 0 && <><p>Keep this page open until the unsaved count clears.</p><button disabled={savingCount > 0} onClick={() => { setError(''); pendingRef.current.forEach(p => void attempt(p)); }}>Retry unsaved progress</button></>}{error && !pending.length && <button className="quiet" onClick={() => setError('')}>Dismiss</button>}</div>}
    {!ready ? <div className="cloudnotice">{connectionError ? 'Cloud data is unavailable. You can sign out to practice as a guest.' : 'Loading your account…'}</div> : selected ? <LearnerStudio key={selected} uid={user.uid} learner={selected} topics={topics} award={key => award(selected, key)} /> : <div className="cloudnotice">Add a learner nickname above to start your synced math studio.</div>}
  </>;
}
function LearnerStudio({ uid, learner, topics, award }: { uid: string; learner: string; topics: Topic[]; award: (key: string) => void }) {
  const [sparks, setSparks] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => { setError(''); return onSnapshot(collection(db, 'users', uid, 'learners', learner, 'completions'), snap => setSparks(snap.size), e => setError(friendlyError(e))); }, [uid, learner, retry]);
  if (error) return <div className="cloudnotice" role="alert">{error} <button onClick={() => setRetry(n => n + 1)}>Retry progress</button></div>;
  if (sparks === null) return <div className="cloudnotice" role="status">Loading learner progress…</div>;
  return <App cloud={{ topics, sparks, scope: learner, onAward: award, onImport: incoming => saveCurriculum(uid, incoming) }} />;
}
