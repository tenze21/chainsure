import { createEncryptedWallet, deriveMasterPasswordHash, generateSalt } from './crypto'
import { apiRequest } from './api'
const USER_KEY = 'chainsure.user'

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

async function fetchSaltForEmail(email) {
  const query = new URLSearchParams({ email })
  const data = await apiRequest(`/api/auth/salt?${query.toString()}`)
  return data?.salt
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

  storeUser(data?.user)

  return data?.user
}

export async function loginUser({ email, password }) {
  const salt = await fetchSaltForEmail(email)
  if (!salt) {
    throw new Error('Unable to retrieve the salt for this account.')
  }

  const passwordHash = await deriveMasterPasswordHash(password, salt)
  const data = await apiRequest('/api/auth/login', {
    method: 'POST',
    body: { email, passwordHash },
  })

  storeUser(data?.user)

  return data?.user
}

export async function logoutUser() {
  await apiRequest('/api/auth/logout', { method: 'POST', body: {} })
  clearUser()
}
