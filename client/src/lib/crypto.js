import { argon2id } from 'hash-wasm'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'

function uint8ArrayToBase64(array) {
  return btoa(String.fromCharCode(...array))
}

function base64ToUint8Array(base64) {
  const binary = atob(base64)
  const array = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    array[i] = binary.charCodeAt(i)
  }
  return array
}

function hexToUint8Array(hex) {
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex
  const array = new Uint8Array(clean.length / 2)
  for (let i = 0; i < clean.length; i += 2) {
    array[i / 2] = Number.parseInt(clean.slice(i, i + 2), 16)
  }
  return array
}

export function generateSalt() {
  const saltArray = new Uint8Array(16)
  crypto.getRandomValues(saltArray)
  return uint8ArrayToBase64(saltArray)
}

export async function deriveMasterPasswordHash(masterPassword, salt) {
  const saltBytes = base64ToUint8Array(salt)
  const hash = await argon2id({
    password: masterPassword,
    salt: saltBytes,
    parallelism: 4,
    iterations: 3,
    memorySize: 64 * 1024,
    hashLength: 32,
    outputType: 'hex',
  })
  return hash
}

async function encrypt(plaintext, keyHex) {
  const keyBuffer = hexToUint8Array(keyHex)
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'AES-GCM' },
    false,
    ['encrypt'],
  )

  const iv = new Uint8Array(12)
  crypto.getRandomValues(iv)

  const encoder = new TextEncoder()
  const plaintextBuffer = encoder.encode(plaintext)

  const ciphertextBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv.buffer },
    cryptoKey,
    plaintextBuffer.buffer,
  )

  return {
    ciphertext: uint8ArrayToBase64(new Uint8Array(ciphertextBuffer)),
    iv: uint8ArrayToBase64(iv),
  }
}

export async function createEncryptedWallet(masterPasswordHash) {
  const privateKey = generatePrivateKey()
  const account = privateKeyToAccount(privateKey)
  const { ciphertext, iv } = await encrypt(privateKey, masterPasswordHash)

  return {
    walletAddress: account.address,
    encryptedPrivateKey: `${iv}:${ciphertext}`,
  }
}
