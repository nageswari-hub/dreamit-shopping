import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

function diskStorePlugin(): Plugin {
  const storeFilePath = path.resolve(__dirname, 'src/data/persisted_store.json');

  const handleStoreRequest = (req: any, res: any, next: any) => {
    const rawUrl = req.url || '';
    const url = rawUrl.split('?')[0];

    if (url === '/api/store') {
      if (req.method === 'GET') {
        try {
          if (fs.existsSync(storeFilePath)) {
            const data = fs.readFileSync(storeFilePath, 'utf-8');
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(data);
            return;
          }
        } catch (err) {
          console.error('[diskStorePlugin] Error reading persisted_store.json:', err);
        }
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 200;
        res.end(JSON.stringify({}));
        return;
      }

      if (req.method === 'POST') {
        let body = '';
        req.on('data', (chunk: any) => {
          body += chunk;
        });
        req.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            const dir = path.dirname(storeFilePath);
            if (!fs.existsSync(dir)) {
              fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(storeFilePath, JSON.stringify(parsed, null, 2), 'utf-8');
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, message: 'Saved to disk successfully' }));
          } catch (err: any) {
            console.error('[diskStorePlugin] Error writing persisted_store.json:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
        });
        return;
      }
    }
    next();
  };

  return {
    name: 'disk-store-plugin',
    configureServer(server) {
      server.middlewares.use(handleStoreRequest);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handleStoreRequest);
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), diskStorePlugin()],
});
