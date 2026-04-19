const STORAGE_KEY = 'chainsure.approved-policies'

function parseStoredPolicies() {
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

function normalizeTimestamp(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? String(value || '').trim() : date.toISOString()
}

function buildStoredSignature({ proposalId, policyId, name, category, createdAt, ownerEmail }) {
  return [
    String(proposalId || '').trim(),
    String(policyId || '').trim(),
    String(name || '').trim().toLowerCase(),
    String(category || '').trim().toLowerCase(),
    normalizeTimestamp(createdAt),
    normalizeEmail(ownerEmail),
  ].join('|')
}

function saveApprovedPolicyRecord(record) {
  const policies = parseStoredPolicies()
  const nextRecord = {
    ...record,
    ownerEmail: normalizeEmail(record.ownerEmail),
    createdAt: normalizeTimestamp(record.createdAt),
  }

  const nextSignature = buildStoredSignature(nextRecord)
  const existingIndex = policies.findIndex((item) => (
    item.policyId === nextRecord.policyId
    || (item.proposalId && item.proposalId === nextRecord.proposalId)
    || buildStoredSignature(item) === nextSignature
  ))

  if (existingIndex >= 0) {
    policies[existingIndex] = {
      ...policies[existingIndex],
      ...nextRecord,
    }
  } else {
    policies.push(nextRecord)
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(policies))

  return nextRecord
}

export function trackApprovedPolicy({ ownerEmail, proposalId, proposal, policy }) {
  if (!policy?.id) {
    return null
  }

  return saveApprovedPolicyRecord({
    policyId: policy.id,
    proposalId: proposalId || proposal?.id || null,
    ownerEmail,
    name: policy.name || proposal?.name || 'Unnamed policy',
    category: policy.category || proposal?.category || 'Uncategorized',
    createdAt: policy.createdAt || proposal?.createdAt || new Date().toISOString(),
    paymentType: policy.paymentType || '',
    premium: policy.premium ?? '',
    deductible: policy.deductible ?? '',
    status: policy.status || 'pending',
  })
}

export function findApprovedPolicyForProposal(proposal, ownerEmail) {
  const normalizedOwnerEmail = normalizeEmail(ownerEmail)

  return parseStoredPolicies().find((policy) => {
    if (normalizedOwnerEmail && normalizeEmail(policy.ownerEmail) !== normalizedOwnerEmail) {
      return false
    }

    if (proposal?.id && policy.proposalId === proposal.id) {
      return true
    }

    return (
      String(policy.name || '').trim().toLowerCase() === String(proposal?.name || '').trim().toLowerCase()
      && String(policy.category || '').trim().toLowerCase() === String(proposal?.category || '').trim().toLowerCase()
      && normalizeTimestamp(policy.createdAt) === normalizeTimestamp(proposal?.createdAt)
    )
  }) || null
}
