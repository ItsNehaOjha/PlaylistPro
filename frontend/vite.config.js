import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '')
	return {
		plugins: [react()],
		server: {
			port: 3000,
			host: true,
			open: false, // Disable auto-open for faster startup
			hmr: {
				overlay: false // Disable error overlay for speed
			}
		},
		define: {
			'process.env.REACT_APP_YOUTUBE_API_KEY': JSON.stringify(env.REACT_APP_YOUTUBE_API_KEY)
		},
		build: {
			rollupOptions: {
				output: {
					manualChunks: {
						'react-vendor': ['react', 'react-dom', 'react-router-dom'],
						'mui-vendor': ['@mui/material', '@emotion/react', '@emotion/styled'],
						'utils-vendor': ['axios', 'react-hot-toast']
					}
				}
			},
			chunkSizeWarningLimit: 1000,
			sourcemap: false,
			minify: 'esbuild' // Faster minification
		},
		optimizeDeps: {
			include: ['react', 'react-dom', '@mui/material', 'lucide-react'],
			force: true // Force pre-bundling
		},
		esbuild: {
			target: 'es2020' // Modern target for better performance
		}
	}
})
