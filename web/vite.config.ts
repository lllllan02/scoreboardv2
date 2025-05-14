import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    },
    fs: {
      allow: ['..'],
    },
  },
  // 配置静态资源目录，将项目根目录下的data文件夹设置为静态资源目录
  publicDir: path.resolve(__dirname, '../data'),
}) 