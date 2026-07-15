import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serve o app a partir de /calculadora-leilao-imoveis/.
// Em dev (npm run dev) o base é '/'.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/calculadora-leilao-imoveis/' : '/',
  plugins: [react()],
}));
