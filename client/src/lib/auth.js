import { createEncryptedWallet, deriveMasterPasswordHash, generateSalt } from './crypto'
import { apiRequest } from './api'
const SALT_KEY_PREFIX = 'chainsure.salt.'
const USER_KEY = 'chainsure.user'

function getSaltKey(email) {
  return `${SALT_KEY_PREFIX}${email.toLowerCase()}`
}

export function storeSaltForEmail(email, salt) {
  if (!email || !salt) return
  localStorage.setItem(getSaltKey(email), salt)
}

export function getSaltForEmail(email) {
  if (!email) return null
  return localStorage.getItem(getSaltKey(email))
}

export function storeUser(user) {
  if (!user) return
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearUser() {
  localStorage.removeItem(USER_KEY)
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export async function registerUser({ fullName, email, password }) {
  const salt = generateSalt()
  const passwordHash = await deriveMasterPasswordHash(password, salt)
  const { walletAddress, encryptedPrivateKey } = await createEncryptedWallet(passwordHash)

  const data = await apiRequest('/api/auth/register', {
    method: 'POST',
    body: {
      fullName,
      email,
      passwordHash,
      walletAddress,
      encryptedPrivateKey,
      salt,
    },
  })

  storeSaltForEmail(email, data?.salt || salt)
  storeUser(data?.user)

  return data?.user
}

export async function loginUser({ email, password }) {
  const salt = getSaltForEmail(email)
  if (!salt) {
    throw new Error('No saved salt for this email on this device. Please register here first or sign in on a device where you already logged in.')
  }

  const passwordHash = await deriveMasterPasswordHash(password, salt)
  const data = await apiRequest('/api/auth/login', {
    method: 'POST',
    body: { email, passwordHash },
  })

  if (data?.salt) {
    storeSaltForEmail(email, data.salt)
  }
  storeUser(data?.user)

  return data?.user
}

export async function logoutUser() {
  await apiRequest('/api/auth/logout', { method: 'POST', body: {} })
  clearUser()
}
