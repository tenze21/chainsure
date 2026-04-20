import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'

const encoder = new TextEncoder()

function bytesToBase64(bytes) {
  const chunkSize = 0x8000
  let binary = ''

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize))
  }

  return btoa(binary)
}

export function generateSalt(bytes = 16) {
  return bytesToBase64(window.crypto.getRandomValues(new Uint8Array(bytes)))
}

export async function hashPassword(password) {
  const digest = await window.crypto.subtle.digest('SHA-256', encoder.encode(password))

  return Array.from(new Uint8Array(digest))
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('')
}

export async function encryptPrivateKey(privateKey, secret) {
  const keyMaterial = await window.crypto.subtle.digest('SHA-256', encoder.encode(secret))
  const key = await window.crypto.subtle.importKey('raw', keyMaterial, 'AES-GCM', false, ['encrypt'])
  const iv = window.crypto.getRandomValues(new Uint8Array(12))
  const encrypted = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(privateKey),
  )

  return `${bytesToBase64(new Uint8Array(encrypted))}:${bytesToBase64(iv)}`
}

export function normalizeDob(value) {
  const trimmed = value.trim()
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(trimmed)

  if (!match) {
    return ''
  }

  const [, day, month, year] = match
  return `${year}-${month}-${day}`
}

export async function createWalletRegistration(password) {
  const privateKey = generatePrivateKey()
  const account = privateKeyToAccount(privateKey)
  const passwordHash = await hashPassword(password)
  const salt = generateSalt()
  const encryptedPrivateKey = await encryptPrivateKey(privateKey, passwordHash)

  return {
    walletAddress: account.address,
    passwordHash,
    salt,
    encryptedPrivateKey,
  }
}
