const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const TRANSIENT_CODE_MATCHERS = [
  '408',
  '409',
  '42501',
  '429',
  '500',
  '502',
  '503',
  '504',
  'ETIMEDOUT',
  'ECONNRESET',
  'NETWORK_ERROR',
  'UND_ERR',
  'PGRST301'
]

export const isTransientSupabaseError = (error) => {
  if (!error) return false

  const message = String(error.message || error.details || error.hint || '').toLowerCase()
  const code = String(error.code || error.status || error.name || '').toUpperCase()

  if (TRANSIENT_CODE_MATCHERS.some((matcher) => code.includes(matcher))) {
    return true
  }

  return [
    'failed to fetch',
    'network request failed',
    'networkerror',
    'timed out',
    'timeout',
    'temporarily unavailable',
    'connection',
    'fetch',
    'service unavailable',
    'gateway',
    'rate limit'
  ].some((matcher) => message.includes(matcher))
}

export const executeSupabaseWrite = async (operation, options = {}) => {
  const {
    action = 'Supabase write',
    retries = 2,
    baseDelayMs = 400,
    shouldRetry = isTransientSupabaseError,
    onAttemptError = null
  } = options

  let lastError = null

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const result = await operation()

      if (result?.error) {
        throw result.error
      }

      return result
    } catch (error) {
      lastError = error

      if (typeof onAttemptError === 'function') {
        onAttemptError(error, attempt + 1)
      }

      const canRetry = attempt < retries && shouldRetry(error)
      if (!canRetry) {
        break
      }

      const waitMs = baseDelayMs * (attempt + 1)
      console.warn(`[SupabaseWrite] Retry ${attempt + 1}/${retries} for ${action}`, error)
      await sleep(waitMs)
    }
  }

  if (lastError instanceof Error) {
    lastError.message = `${action} failed: ${lastError.message}`
  }

  throw lastError || new Error(`${action} failed`)
}
