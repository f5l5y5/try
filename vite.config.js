import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteMockServe} from 'vite-plugin-mock'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), viteMockServe({mockPath:'/mock'})],
  server: {
    // proxy: {
    // 	'/api': {
    // 		target: 'http://localhost:3000',
    // 		changeOrigin: true,
    // 		rewrite: path => path.replace(/^\/api/, '')
    // 	}
    // }
    // proxy: {
    // 	'/v1': {
    // 		target: 'http://localhost:3000',
    // 		changeOrigin: true,
    // 		rewrite: path => path.replace(/^\/v1/, 'v1')
    // 	}
    // }
  },
});
