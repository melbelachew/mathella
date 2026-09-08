import { defineConfig, loadEnv } from 'vite';
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  if (!env.VITE_FIREBASE_API_KEY?.trim()) {
    throw new Error('Set VITE_FIREBASE_API_KEY in .env.local or the GitHub Actions repository secret before building.');
  }
  return { base: './' };
});
