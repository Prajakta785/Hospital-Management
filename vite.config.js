import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { spawn } from 'child_process';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let backendProcess = null;

function autoBackendPlugin() {
  return {
    name: 'auto-backend-server',
    configureServer(server) {
      const checkBackend = () => {
        return new Promise((resolve) => {
          const req = http.get('http://127.0.0.1:5000/api/health', (res) => {
            resolve(res.statusCode === 200);
          });
          req.on('error', () => resolve(false));
          req.setTimeout(800, () => {
            req.destroy();
            resolve(false);
          });
        });
      };

      const startBackend = async () => {
        if (process.env.npm_lifecycle_event === 'dev' || process.env.NO_AUTO_BACKEND === '1') {
          return;
        }
        const isRunning = await checkBackend();
        if (isRunning) {
          console.log('\x1b[32m[auto-backend] Backend API server already active on port 5000.\x1b[0m');
          return;
        }

        console.log('\x1b[36m[auto-backend] Automatically launching ApexCare backend server on port 5000...\x1b[0m');
        const serverScript = path.join(__dirname, 'server', 'index.js');
        backendProcess = spawn('node', [
          '--watch-path=server/index.js',
          '--watch-path=server/routes',
          '--watch-path=server/middleware',
          '--watch-path=server/services',
          '--watch-path=server/config',
          serverScript
        ], {
          cwd: __dirname,
          stdio: 'inherit',
          shell: false
        });

        backendProcess.on('error', (err) => {
          console.error('\x1b[31m[auto-backend] Error launching backend server:\x1b[0m', err.message);
        });

        backendProcess.on('exit', (code) => {
          if (code && code !== 0) {
            console.log(`\x1b[33m[auto-backend] Backend server stopped (code ${code})\x1b[0m`);
          }
          backendProcess = null;
        });
      };

      startBackend();

      const killBackend = () => {
        if (backendProcess) {
          try {
            backendProcess.kill();
          } catch (e) {}
          backendProcess = null;
        }
      };

      server.httpServer?.on('close', killBackend);
      process.on('exit', killBackend);
      process.on('SIGINT', () => {
        killBackend();
        process.exit();
      });
      process.on('SIGTERM', () => {
        killBackend();
        process.exit();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), autoBackendPlugin()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    watch: {
      ignored: [
        '**/server/**',
        '**/.git/**',
        '**/node_modules/**'
      ]
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('error', (_err, _req, res) => {
            if (res && res.writeHead && !res.headersSent) {
              res.writeHead(502, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                success: false,
                message: 'Backend API server is initializing or restarting. Please retry in a moment.'
              }));
            }
          });
        }
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('recharts')) {
              return 'vendor-charts';
            }
            if (id.includes('firebase')) {
              return 'vendor-firebase';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('date-fns') || id.includes('clsx') || id.includes('tailwind-merge')) {
              return 'vendor-utils';
            }
            return 'vendor-libs';
          }
        }
      }
    }
  }
});
