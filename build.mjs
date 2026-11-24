// Bundles every src/widgets/*.js into dist/<name>.js (one self-contained IIFE per widget,
// SDK included), which is what the layout's "script" URL loads.
import { build } from 'esbuild';
import { readdirSync } from 'node:fs';

const entries = readdirSync('src/widgets').filter((f) => f.endsWith('.js'));
await build({
  entryPoints: entries.map((f) => `src/widgets/${f}`),
  outdir: 'dist',
  bundle: true,
  format: 'iife',
  target: 'es2020',
  minify: true,
  sourcemap: false,
  logLevel: 'info',
});
