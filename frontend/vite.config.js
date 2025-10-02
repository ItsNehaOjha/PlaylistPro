import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '')
	return {
		plugins: [react()],
		server: {
			port: 3000,
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
			minify: 'esbuild',
			target: 'es2020',
			cssCodeSplit: true,
			assetsDir: 'assets',
			outDir: 'dist'
		},
		optimizeDeps: {
			include: ['react', 'react-dom', '@mui/material', 'lucide-react'],
			force: true
		},
		esbuild: {
			target: 'es2020'
		},
		base: '/'
	}
})
