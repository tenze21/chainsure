const RAW_API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const API_BASE_URL = RAW_API_BASE_URL ? RAW_API_BASE_URL.replace(/\/$/, '') : ''

export async function apiRequest(path, { method = 'GET', body, headers } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  let payload = null
  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  if (!response.ok || payload?.success === false) {
    const message = payload?.error?.message || payload?.message || `Request failed with status ${response.status}`
    throw new Error(message)
  }

  return payload?.data ?? payload
}
