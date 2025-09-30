import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '')
	return {
		plugins: [
			react(),
			// Add bundle analyzer in build mode
			mode === 'analyze' && visualizer({
				filename: 'dist/stats.html',
				open: true,
				gzipSize: true,
				brotliSize: true,
			})
		].filter(Boolean),
		server: {
			port: 3000,
			host: true,
			open: true
		},
		define: {
			'process.env.REACT_APP_YOUTUBE_API_KEY': JSON.stringify(env.REACT_APP_YOUTUBE_API_KEY)
		},
		build: {
			rollupOptions: {
				output: {
					manualChunks: (id) => {
						// Vendor chunks
						if (id.includes('node_modules')) {
							if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
								return 'react-vendor';
							}
							if (id.includes('@mui/material') || id.includes('@emotion')) {
								return 'mui-core';
							}
							if (id.includes('@mui/icons-material')) {
								return 'mui-icons';
							}
							if (id.includes('lucide-react')) {
								return 'lucide-icons';
							}
							if (id.includes('axios') || id.includes('react-hot-toast')) {
								return 'utils-vendor';
							}
							// Other vendor libraries
							return 'vendor';
						}
						
						// App chunks
						if (id.includes('/pages/MultiPlaylistDashboard')) {
							return 'playlists-page';
						}
						if (id.includes('/pages/FuturisticDashboard')) {
							return 'dashboard-page';
						}
						if (id.includes('/pages/Home')) {
							return 'home-page';
						}
						if (id.includes('/pages/Login') || id.includes('/pages/ForgotPassword') || id.includes('/pages/ResetPassword')) {
							return 'auth-pages';
						}
					}
				}
			},
			chunkSizeWarningLimit: 1000,
			sourcemap: false,
		},
		optimizeDeps: {
			include: ['react', 'react-dom', '@mui/material', 'lucide-react']
		}
	}
})
