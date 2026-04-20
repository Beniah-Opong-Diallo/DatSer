import { spawnSync } from 'node:child_process'

const result = spawnSync(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['playwright', 'test', 'tests/smoke.spec.js'],
  {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: {
      ...process.env,
      PLAYWRIGHT_USE_PREVIEW: '1'
    }
  }
)

if (result.error) {
  throw result.error
}

process.exit(result.status ?? 1)
