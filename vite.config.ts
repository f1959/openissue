import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function normalizeBasePath(basePath: string | undefined): string {
  const trimmed = basePath?.trim();
  if (!trimmed || trimmed === '/') return '/';
  if (trimmed === './') return './';
  if (/^https?:\/\//.test(trimmed)) return trimmed.endsWith('/') ? trimmed : `${trimmed}/`;

  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`;
}

export default defineConfig({
  plugins: [react()],
  base: normalizeBasePath(process.env.VITE_BASE_PATH),
});
