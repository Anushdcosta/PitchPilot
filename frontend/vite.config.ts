import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  if (!env.VITE_API_BASE || !env.VITE_API_BASE.startsWith('http')) {
    throw new Error('❌ VITE_API_BASE is missing or invalid in .env');
  }
  console.log("proxying to : " + env.VITE_API_BASE)


  return {
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_BASE,
          changeOrigin: true,
          rewrite: path => path.replace(/^\/api/, '')
        }
      }
    }
  };
});
