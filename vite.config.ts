import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
//
// Le projet est servi sous /Kira/ sur GitHub Pages
// (URL publique : https://juju17sama-sys.github.io/Kira/)
//
// En dev local on garde la racine '/'.
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/Kira/' : '/',
}));
