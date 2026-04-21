export const API_BASE = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL || '')

export class ApiError extends Error {
  constructor(message, status = 0, data = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

function buildUrl(path) {
  return `${API_BASE}${path}`
}

const DEFAULT_CACHE_TTL_MS = 0
const DEFAULT_RATE_LIMIT_COOLDOWN_MS = 30 * 1000
const responseCache = new Map()
const pendingRequests = new Map()
const cooldowns = new Map()

function cloneData(data) {
  if (data == null) {
    return data
  }

  if (typeof structuredClone === 'function') {
    return structuredClone(data)
  }

  return JSON.parse(JSON.stringify(data))
}

function buildRequestKey(method, path) {
  return `${String(method || 'GET').toUpperCase()} ${buildUrl(path)}`
}

function getRetryDelayMs(response) {
  const retryAfterHeader = Number(response.headers.get('retry-after'))
  if (Number.isFinite(retryAfterHeader) && retryAfterHeader > 0) {
    return retryAfterHeader * 1000
  }

  const rateLimitResetHeader = Number(response.headers.get('ratelimit-reset'))
  if (Number.isFinite(rateLimitResetHeader) && rateLimitResetHeader > 0) {
    return rateLimitResetHeader * 1000
  }

  return DEFAULT_RATE_LIMIT_COOLDOWN_MS
}

function readCachedResponse(cacheKey) {
  const cachedEntry = responseCache.get(cacheKey)

  if (!cachedEntry) {
    return null
  }

  if (cachedEntry.expiresAt <= Date.now()) {
    responseCache.delete(cacheKey)
    return null
  }

  return cloneData(cachedEntry.data)
}

function setCachedResponse(cacheKey, data, ttlMs) {
  if (!ttlMs || ttlMs <= 0) {
    return
  }

  responseCache.set(cacheKey, {
    data: cloneData(data),
    expiresAt: Date.now() + ttlMs,
  })
}

function invalidateCachedPath(path) {
  for (const cacheKey of responseCache.keys()) {
    if (cacheKey.endsWith(buildUrl(path))) {
      responseCache.delete(cacheKey)
    }
  }

  for (const cooldownKey of cooldowns.keys()) {
    if (cooldownKey.endsWith(buildUrl(path))) {
      cooldowns.delete(cooldownKey)
    }
  }
}

function clearRequestState() {
  responseCache.clear()
  pendingRequests.clear()
  cooldowns.clear()
}

async function readResponse(res) {
  const text = await res.text()

  if (!text) {
    return null
  }

  try {
    return JSON.parse(text)
  } catch {
    return { message: text }
  }
}

function getErrorMessage(data, fallback) {
  const detailMessage = Array.isArray(data?.error?.details)
    ? data.error.details
      .map((detail) => detail?.message)
      .filter(Boolean)
      .join(' ')
    : ''

  return (
    detailMessage
    || data?.error?.message
    || data?.data?.message
    || data?.message
    || fallback
  )
}

export async function apiRequest(path, options = {}) {
  const {
    headers,
    cacheTtlMs = DEFAULT_CACHE_TTL_MS,
    forceRefresh = false,
    ...rest
  } = options
  const method = String(rest.method || 'GET').toUpperCase()
  const requestKey = buildRequestKey(method, path)
  const cachedResponse = method === 'GET' && !forceRefresh ? readCachedResponse(requestKey) : null
  const cooldownUntil = cooldowns.get(requestKey) || 0

  if (method === 'GET') {
    if (cachedResponse) {
      return cachedResponse
    }

    if (!forceRefresh && cooldownUntil > Date.now()) {
      throw new ApiError('Too many requests, please try again later', 429)
    }

    if (pendingRequests.has(requestKey)) {
      return pendingRequests.get(requestKey)
    }
  }

  const requestPromise = (async () => {
    let response

    try {
      response = await fetch(buildUrl(path), {
        credentials: 'include',
        headers: {
          ...(options.body ? { 'Content-Type': 'application/json' } : {}),
          ...headers,
        },
        ...rest,
      })
    } catch {
      throw new ApiError(
        'Could not connect to the service. Please check that the application is running.',
        0,
      )
    }

    const data = await readResponse(response)

    if (!response.ok) {
      if (method === 'GET' && response.status === 429) {
        cooldowns.set(requestKey, Date.now() + getRetryDelayMs(response))
      }

      throw new ApiError(
        getErrorMessage(data, `Request failed with status ${response.status}`),
        response.status,
        data,
      )
    }

    if (method === 'GET') {
      cooldowns.delete(requestKey)
      setCachedResponse(requestKey, data, cacheTtlMs)
    }

    return data
  })()

  if (method !== 'GET') {
    return requestPromise
  }

  pendingRequests.set(requestKey, requestPromise)

  try {
    return await requestPromise
  } finally {
    pendingRequests.delete(requestKey)
  }
}

export function getTemplateById(templateId, options = {}) {
  return apiRequest(`/api/template/${templateId}`, {
    cacheTtlMs: 5 * 60 * 1000,
    ...options,
  })
}

export function getTemplates(options = {}) {
  return apiRequest('/api/template', {
    cacheTtlMs: 5 * 60 * 1000,
    ...options,
  })
}

export function getCurrentUser(options = {}) {
  return apiRequest('/api/user', {
    cacheTtlMs: 30 * 1000,
    ...options,
  })
}

export function getUserProposals(options = {}) {
  return apiRequest('/api/proposal/user', {
    cacheTtlMs: 30 * 1000,
    ...options,
  })
}

export function loginUser(payload) {
  return apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function loginAdmin(payload) {
  return apiRequest('/api/auth/login/admin', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function registerUser(payload) {
  return apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function registerAdmin(payload) {
  return apiRequest('/api/auth/register/admin', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateUserProfile(payload) {
  return apiRequest('/api/user', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  }).then((data) => {
    invalidateCachedPath('/api/user')
    return data
  })
}

export function submitProposal(templateId, attributes) {
  return apiRequest(`/api/proposal/${templateId}`, {
    method: 'POST',
    body: JSON.stringify({ attributes }),
  }).then((data) => {
    invalidateCachedPath('/api/proposal/user')
    return data
  })
}

export function logoutUser() {
  return apiRequest('/api/auth/logout', {
    method: 'POST',
  }).finally(() => {
    clearRequestState()
  })
}

export function initiatePayment(policyId) {
  return apiRequest(`/api/stripe/payments/initiate/${policyId}`, {
    method: 'POST',
  })
}
