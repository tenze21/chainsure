const STORAGE_KEY = 'chainsure.proposals'

function parseStoredProposals() {
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

function normalizeAttributes(attributes) {
  if (Array.isArray(attributes)) {
    return attributes.reduce((result, item) => {
      if (item?.fieldName) {
        result[item.fieldName] = item.fieldValue ?? ''
      }
      return result
    }, {})
  }

  if (attributes && typeof attributes === 'object') {
    return Object.entries(attributes).reduce((result, [key, value]) => {
      result[key] = value ?? ''
      return result
    }, {})
  }

  return {}
}

export function buildProposalSignature({ name, category, createdAt }) {
  return [
    String(name || '').trim().toLowerCase(),
    String(category || '').trim().toLowerCase(),
    normalizeTimestamp(createdAt),
  ].join('|')
}

export function loadTrackedProposals(ownerEmail) {
  const normalizedOwnerEmail = normalizeEmail(ownerEmail)

  return parseStoredProposals().filter((proposal) => (
    !normalizedOwnerEmail || normalizeEmail(proposal.ownerEmail) === normalizedOwnerEmail
  ))
}

export function saveTrackedProposal(proposal) {
  const proposals = parseStoredProposals()
  const nextProposal = {
    ...proposal,
    ownerEmail: normalizeEmail(proposal.ownerEmail),
    createdAt: normalizeTimestamp(proposal.createdAt),
    attributes: normalizeAttributes(proposal.attributes),
  }

  const nextSignature = buildProposalSignature(nextProposal)
  const existingIndex = proposals.findIndex((item) => (
    item.id === nextProposal.id
    || buildProposalSignature(item) === nextSignature
  ))

  if (existingIndex >= 0) {
    proposals[existingIndex] = {
      ...proposals[existingIndex],
      ...nextProposal,
      attributes: {
        ...normalizeAttributes(proposals[existingIndex].attributes),
        ...nextProposal.attributes,
      },
    }
  } else {
    proposals.push(nextProposal)
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(proposals))

  return nextProposal
}

export function trackSubmittedProposal({ ownerEmail, template, proposalWithAttributes }) {
  if (!ownerEmail || !proposalWithAttributes) {
    return null
  }

  return saveTrackedProposal({
    id: proposalWithAttributes.id,
    ownerEmail,
    templateId: proposalWithAttributes.templateId,
    name: template?.name || 'Unnamed proposal',
    category: template?.category?.name || template?.categoryName || 'Uncategorized',
    createdAt: proposalWithAttributes.createdAt,
    status: proposalWithAttributes.status || 'pending',
    attributes: proposalWithAttributes.proposalAttributes,
  })
}

export function updateTrackedProposalStatus({ id, status }) {
  if (!id || !status) {
    return null
  }

  const proposals = parseStoredProposals()
  const proposal = proposals.find((item) => item.id === id)

  if (!proposal) {
    return null
  }

  return saveTrackedProposal({
    ...proposal,
    status,
  })
}
