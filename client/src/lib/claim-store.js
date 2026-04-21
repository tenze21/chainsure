const STORAGE_KEY = 'chainsure.claims'

function parseStoredClaims() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function normalizeEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : ''
}

function normalizeOptionalText(value) {
  return typeof value === 'string' ? value.trim() : value ?? ''
}

function normalizeAmount(value) {
  const amount = Number(value)
  return Number.isFinite(amount) ? amount : 0
}

function normalizeAttachments(attachments) {
  if (!Array.isArray(attachments)) {
    return []
  }

  return attachments
    .map((file) => {
      if (!file) {
        return null
      }

      return {
        name: normalizeOptionalText(file.name),
        size: Number(file.size) || 0,
        type: normalizeOptionalText(file.type),
      }
    })
    .filter((file) => file?.name)
}

function sortByNewest(claims) {
  return [...claims].sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
}

function createClaimCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let suffix = ''

  for (let index = 0; index < 6; index += 1) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)]
  }

  return `CLM-${suffix}`
}

function saveClaims(claims) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(claims))
}

export function loadAllClaims() {
  return sortByNewest(parseStoredClaims())
}

export function loadClaims(ownerEmail) {
  const normalizedOwnerEmail = normalizeEmail(ownerEmail)

  return sortByNewest(
    parseStoredClaims().filter((claim) => (
      !normalizedOwnerEmail || normalizeEmail(claim.ownerEmail) === normalizedOwnerEmail
    )),
  )
}

export function findClaimByPolicyId(policyId, ownerEmail = '') {
  const normalizedOwnerEmail = normalizeEmail(ownerEmail)

  return parseStoredClaims().find((claim) => (
    claim.policyId === policyId
    && (!normalizedOwnerEmail || normalizeEmail(claim.ownerEmail) === normalizedOwnerEmail)
  )) || null
}

export function createLocalClaim({
  ownerEmail,
  ownerName,
  policyId,
  policyName,
  policyCategory,
  claimType,
  amount,
  incidentDate,
  description,
  attachments,
}) {
  if (!policyId) {
    throw new Error('Policy ID is required to create a claim.')
  }

  if (findClaimByPolicyId(policyId, ownerEmail)) {
    throw new Error('A claim has already been submitted for this tracked policy.')
  }

  const claims = parseStoredClaims()
  const now = new Date().toISOString()
  const nextClaim = {
    id: typeof crypto?.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    claimCode: createClaimCode(),
    ownerEmail: normalizeEmail(ownerEmail),
    ownerName: normalizeOptionalText(ownerName),
    policyId: normalizeOptionalText(policyId),
    policyName: normalizeOptionalText(policyName),
    policyCategory: normalizeOptionalText(policyCategory),
    claimType: normalizeOptionalText(claimType),
    amount: normalizeAmount(amount),
    incidentDate: normalizeOptionalText(incidentDate),
    description: normalizeOptionalText(description),
    attachments: normalizeAttachments(attachments),
    status: 'pending',
    priority: '',
    adminNote: '',
    createdAt: now,
    updatedAt: now,
  }

  claims.push(nextClaim)
  saveClaims(claims)

  return nextClaim
}

export function updateLocalClaim(claimId, updates = {}) {
  if (!claimId) {
    return null
  }

  const claims = parseStoredClaims()
  const claimIndex = claims.findIndex((claim) => claim.id === claimId)

  if (claimIndex < 0) {
    return null
  }

  const nextClaim = {
    ...claims[claimIndex],
    ...updates,
    attachments: Object.prototype.hasOwnProperty.call(updates, 'attachments')
      ? normalizeAttachments(updates.attachments)
      : normalizeAttachments(claims[claimIndex].attachments),
    amount: Object.prototype.hasOwnProperty.call(updates, 'amount')
      ? normalizeAmount(updates.amount)
      : normalizeAmount(claims[claimIndex].amount),
    ownerEmail: normalizeEmail(updates.ownerEmail ?? claims[claimIndex].ownerEmail),
    updatedAt: new Date().toISOString(),
  }

  claims[claimIndex] = nextClaim
  saveClaims(claims)

  return nextClaim
}
