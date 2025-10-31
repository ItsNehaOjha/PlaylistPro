import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '')
	const apiBase = env.VITE_API_URL || 'https://playlistpro-backend.onrender.com/api'
	const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
	const apiUrlRegex = new RegExp(`^${escapeRegex(apiBase)}`)

	return {
		plugins: [
			react(),
			VitePWA({
				registerType: 'autoUpdate',
				injectRegister: 'auto',
				manifest: false,
				includeAssets: [
					'robots.txt',
					'fevicon/favicon.ico',
					'fevicon/favicon.svg',
					'fevicon/favicon-96x96.png',
					'fevicon/apple-touch-icon.png',
					'fevicon/web-app-manifest-192x192.png',
					'fevicon/web-app-manifest-512x512.png'
				],
				workbox: {
					cleanupOutdatedCaches: true,
					navigateFallback: 'index.html',
					globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
					runtimeCaching: [
						{
							urlPattern: apiUrlRegex,
							handler: 'NetworkFirst',
							options: {
								cacheName: 'api-cache',
								networkTimeoutSeconds: 10,
								cacheableResponse: { statuses: [0, 200] },
								expiration: {
									maxEntries: 50,
									maxAgeSeconds: 24 * 60 * 60
								}
							}
						},
						{
							urlPattern: /\.(?:js|css|html|png|svg|jpg|jpeg|gif|webp)$/,
							handler: 'CacheFirst',
							options: {
								cacheName: 'asset-cache',
								expiration: {
									maxEntries: 100,
									maxAgeSeconds: 7 * 24 * 60 * 60
								}
							}
						}
					]
				}
			})
		],

		server: {
			port: 5173,
			host: true,
			open: false,
			hmr: { overlay: false }
		},

		define: {
			'process.env.REACT_APP_YOUTUBE_API_KEY': JSON.stringify(env.REACT_APP_YOUTUBE_API_KEY)
		},

		build: {
			rollupOptions: {
				output: { manualChunks: undefined }
			},
			chunkSizeWarningLimit: 5000,
			sourcemap: false,
			minify: false,
			target: 'esnext', 
			cssCodeSplit: false,
			outDir: 'dist',
			reportCompressedSize: false
		},

		optimizeDeps: {
			include: ['react', 'react-dom']
		},

		esbuild: {
			target: 'esnext'
		}
	}
})
