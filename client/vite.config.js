import fs from 'node:fs'
import path from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {}
  }

  return fs.readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .reduce((result, line) => {
      const trimmedLine = line.trim()

      if (!trimmedLine || trimmedLine.startsWith('#')) {
        return result
      }

      const separatorIndex = trimmedLine.indexOf('=')

      if (separatorIndex === -1) {
        return result
      }

      const key = trimmedLine.slice(0, separatorIndex).trim()
      const value = trimmedLine.slice(separatorIndex + 1).trim()

      result[key] = value
      return result
    }, {})
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const clientEnv = loadEnv(mode, process.cwd(), '')
  const serverEnv = readEnvFile(path.resolve(process.cwd(), '../server/.env.development'))
  const stripePublishableKey = (
    clientEnv.VITE_STRIPE_PUBLISHABLE_KEY
    || clientEnv.VITE_STRIPE_PUBLIC_KEY
    || serverEnv.STRIPE_PUBLISHABLE_KEY
    || serverEnv.VITE_STRIPE_PUBLISHABLE_KEY
    || ''
  )

  return {
    plugins: [react(), tailwindcss()],
    define: {
      __CHAINSURE_STRIPE_PUBLISHABLE_KEY__: JSON.stringify(stripePublishableKey),
    },
    server: {
      host: '127.0.0.1',
      port: 5173,
      strictPort: true,
      hmr: {
        host: '127.0.0.1',
        port: 5173,
        protocol: 'ws',
      },
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    },
  }
})
