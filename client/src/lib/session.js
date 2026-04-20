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

function isBlankValue(value) {
  return value === undefined || value === null || value === ''
}

function areSameUser(nextUser, previousUser) {
  if (!nextUser || !previousUser) {
    return false
  }

  if (nextUser.id && previousUser.id) {
    return nextUser.id === previousUser.id
  }

  if (nextUser.email && previousUser.email) {
    return String(nextUser.email).trim().toLowerCase() === String(previousUser.email).trim().toLowerCase()
  }

  return false
}

function mergeUserSnapshot(nextUser, previousUser) {
  if (!areSameUser(nextUser, previousUser)) {
    return nextUser
  }

  const mergedUser = {
    ...previousUser,
    ...nextUser,
  }

  for (const [key, value] of Object.entries(previousUser)) {
    if (isBlankValue(mergedUser[key]) && !isBlankValue(value)) {
      mergedUser[key] = value
    }
  }

  return mergedUser
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

  const previousUser = loadStoredUser()
  const nextUser = mergeUserSnapshot(user, previousUser)

  window.localStorage.setItem(PRIMARY_USER_KEY, JSON.stringify(nextUser))
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
