import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// envPrefix lets us use the assignment's required NEXT_PUBLIC_* variable
// names verbatim in client code, alongside Vite's usual VITE_ prefix.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
  server: {
    port: 5173,
  },
})
