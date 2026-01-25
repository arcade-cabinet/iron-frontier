import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

const assetsPackagePath = path.resolve(__dirname, '../../packages/assets');

// Plugin to copy assets from shared package during build
function copySharedAssetsPlugin() {
  return {
    name: 'copy-shared-assets',
    buildStart() {
      // For build, assets are copied to public/assets symlink
    },
    configureServer(server: { middlewares: { use: (handler: (req: { url?: string }, res: { writeHead: (status: number, headers?: Record<string, string>) => void; end: (data?: string | Buffer) => void }, next: () => void) => void) => void } }) {
      // Serve assets from packages/assets in dev mode
      server.middlewares.use((req, res, next) => {
        if (req.url?.startsWith('/assets/models/') || req.url?.startsWith('/assets/textures/')) {
          const assetPath = path.join(assetsPackagePath, req.url.replace('/assets/', ''));
          if (fs.existsSync(assetPath)) {
            const ext = path.extname(assetPath).toLowerCase();
            const mimeTypes: Record<string, string> = {
              '.glb': 'model/gltf-binary',
              '.gltf': 'model/gltf+json',
              '.png': 'image/png',
              '.jpg': 'image/jpeg',
              '.jpeg': 'image/jpeg',
            };
            res.writeHead(200, {
              'Content-Type': mimeTypes[ext] || 'application/octet-stream',
              'Access-Control-Allow-Origin': '*',
            });
            res.end(fs.readFileSync(assetPath));
            return;
          }
        }
        next();
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  cacheDir: '.vite',
  plugins: [
    react(),
    tailwindcss(),
    viteSingleFile(),
    copySharedAssetsPlugin(),
  ],
  server: {
    host: true,
    port: 8080,
    // Allow serving files from the workspace root
    fs: {
      allow: [
        path.resolve(__dirname, '../..'),
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@iron-frontier/shared': path.resolve(__dirname, '../../packages/shared/src'),
      '@iron-frontier/assets': path.resolve(__dirname, '../../packages/assets/src'),
    },
  },
  optimizeDeps: {
    include: ['@iron-frontier/shared', '@iron-frontier/assets'],
  },
  // Assets in public/ are served at root
  publicDir: 'public',
  build: {
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
});
