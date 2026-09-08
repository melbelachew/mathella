import { resolveSavedCurriculum } from './curriculumCompatibility';
import { doc, runTransaction } from 'firebase/firestore';
import { db } from './firebase';
import { CURRICULUM } from './curriculum';
import { mergeCurriculum, validateCurriculum } from './learning';
import type { Topic } from './types';
export async function completionId(key: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(key));
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
}
export async function saveCompletion(uid: string, learner: string, key: string) {
  const ref = doc(db, 'users', uid, 'learners', learner, 'completions', await completionId(key));
  await runTransaction(db, async tx => { const existing = await tx.get(ref); if (!existing.exists()) tx.set(ref, { completed: true }); });
}
export async function saveCurriculum(uid: string, incoming: Topic[]) {
  validateCurriculum(incoming);
  const ref = doc(db, 'users', uid, 'settings', 'curriculum');
  await runTransaction(db, async tx => {
    const current = await tx.get(ref);
    const previous: unknown = current.exists() ? JSON.parse(current.data().json) : CURRICULUM;
    validateCurriculum(previous);
    const json = JSON.stringify(mergeCurriculum(resolveSavedCurriculum(previous), resolveSavedCurriculum(incoming)));
    if (new TextEncoder().encode(json).length > 700_000) throw Error('This curriculum is too large to sync. Keep the combined curriculum under 700 KB.');
    tx.set(ref, { json });
  });
}
export function friendlyError(error: unknown): string {
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
  if (code.includes('permission-denied')) return 'Cloud access was denied. The project owner needs to publish the Mathella database rules.';
  if (code.includes('unauthorized-domain')) return 'This website needs to be added to Firebase Authentication’s authorized domains.';
  if (code.includes('operation-not-allowed')) return 'Google sign-in needs to be enabled in Firebase Authentication.';
  if (code.includes('popup-blocked')) return 'Please allow the sign-in popup, then try again.';
  if (code.includes('popup-closed') || code.includes('cancelled-popup')) return 'Sign-in was cancelled. You can try again or keep practicing as a guest.';
  if (code.includes('unavailable') || code.includes('network') || !navigator.onLine) return 'No cloud connection. Reconnect and retry. Keep this page open for any unsaved progress.';
  return error instanceof Error ? error.message : 'Could not save. Please try again.';
}
