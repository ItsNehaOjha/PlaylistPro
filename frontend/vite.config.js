import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '')
	return {
		plugins: [react()],
		server: {
			port: 5173,  // Changed from 3000 to 5173
			host: true,
			open: false,
			hmr: {
				overlay: false
			}
		},
		define: {
			'process.env.REACT_APP_YOUTUBE_API_KEY': JSON.stringify(env.REACT_APP_YOUTUBE_API_KEY)
		},
		build: {
			// Ultra-fast build configuration
			rollupOptions: {
				output: {
					manualChunks: undefined
				}
			},
			chunkSizeWarningLimit: 5000,
			sourcemap: false,
			minify: false, // Disable minification for speed
			target: 'es2015',
			cssCodeSplit: false,
			outDir: 'dist',
			reportCompressedSize: false
		},
		optimizeDeps: {
			include: ['react', 'react-dom']
		},
		esbuild: {
			target: 'es2015'
		}
	}
})
