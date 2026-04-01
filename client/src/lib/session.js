const PRIMARY_USER_KEY = 'chainsure.user'
const LEGACY_USER_KEYS = ['chainsure_user', 'auth_user', 'user']

function parseStoredUser(value) {
  if (!value) {
    return null
  }

  try {
    const parsed = JSON.parse(value)
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

export function loadStoredUser() {
  const storageKeys = [PRIMARY_USER_KEY, ...LEGACY_USER_KEYS]

  for (const key of storageKeys) {
    const parsed = parseStoredUser(window.localStorage.getItem(key))
    if (parsed) {
      return parsed
    }
  }

  return null
}

export function saveStoredUser(user) {
  if (!user) {
    return
  }

  window.localStorage.setItem(PRIMARY_USER_KEY, JSON.stringify(user))
}

export function clearStoredUser() {
  for (const key of [PRIMARY_USER_KEY, ...LEGACY_USER_KEYS]) {
    window.localStorage.removeItem(key)
  }
}

export function getInitials(fullName) {
  if (!fullName) {
    return 'GU'
  }

  const parts = fullName
    .split(' ')
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2)

  return parts.map((part) => part[0]?.toUpperCase() || '').join('') || 'GU'
}

export function getFirstName(fullName) {
  if (!fullName) {
    return 'there'
  }

  return fullName.split(' ').find(Boolean) || 'there'
}
