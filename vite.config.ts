import { defineConfig } from 'vite'
import { configDefaults } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // the post-class coach (server/coach.mjs, `npm run coach`) — keeps the
    // DeepSeek key and the journal on the machine you practise from
    proxy: { '/api': 'http://127.0.0.1:8787' },
  },
  test: {
    // agent worktrees (.claude/worktrees/*) carry whole copies of the repo
    exclude: [...configDefaults.exclude, '.claude/**'],
  },
})
