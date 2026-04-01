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
  return (
    data?.error?.message
    || data?.data?.message
    || data?.message
    || fallback
  )
}

export async function apiRequest(path, options = {}) {
  const { headers, ...rest } = options

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
      `Could not reach ${API_BASE}. Check VITE_API_URL and the server CORS origin.`,
      0,
    )
  }

  const data = await readResponse(response)

  if (!response.ok) {
    throw new ApiError(
      getErrorMessage(data, `Request failed with status ${response.status}`),
      response.status,
      data,
    )
  }

  return data
}

export function getTemplateById(templateId) {
  return apiRequest(`/api/template/${templateId}`)
}

export function getTemplates() {
  return apiRequest('/api/template')
}

export function getUserProposals() {
  return apiRequest('/api/proposal/user')
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
  return apiRequest('/api/user/update', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function submitProposal(templateId, attributes) {
  return apiRequest(`/api/proposal/${templateId}`, {
    method: 'POST',
    body: JSON.stringify({ attributes }),
  })
}

export function logoutUser() {
  return apiRequest('/api/auth/logout', {
    method: 'POST',
  })
}
