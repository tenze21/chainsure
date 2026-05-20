import { ApiError, apiRequest } from './api'

function unwrapList(response, key) {
  return response?.data?.[key] ?? []
}

function unwrapItem(response, key) {
  return response?.data?.[key] ?? null
}

function normalizeTemplate(template) {
  if (!template) {
    return null
  }

  return {
    ...template,
    categoryName: template.category?.name || '',
  }
}

export async function fetchTemplates() {
  const response = await apiRequest('/api/template', { cacheTtlMs: 5 * 60 * 1000 })
  return unwrapList(response, 'templates').map(normalizeTemplate).filter(Boolean)
}

export async function fetchCategories() {
  const response = await apiRequest('/api/template/category', { cacheTtlMs: 5 * 60 * 1000 })
  return unwrapList(response, 'categories')
}

export async function createCategory(name) {
  const response = await apiRequest('/api/template/category', {
    method: 'POST',
    body: JSON.stringify({ name }),
  })

  return response?.data?.newCategory ?? name
}

export async function createTemplate(payload) {
  const response = await apiRequest('/api/template', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return normalizeTemplate(unwrapItem(response, 'policyTemplate'))
}

export async function fetchTemplateById(id) {
  const response = await apiRequest(`/api/template/${id}`, { cacheTtlMs: 5 * 60 * 1000 })
  return normalizeTemplate(unwrapItem(response, 'template'))
}

export async function updateTemplate(id, payload) {
  const response = await apiRequest(`/api/template/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })

  return normalizeTemplate(unwrapItem(response, 'updatedTemplate'))
}

export async function fetchAdminProposals(options = {}) {
  const response = await apiRequest('/api/proposal/admin', {
    cacheTtlMs: 0,
    ...options,
  })
  return unwrapList(response, 'userProposals')
}

const ACTIVE_POLICY_STATUSES = new Set(['active', 'payment_confirmed'])

function computePolicyEndDate(createdAt, durationDays) {
  if (!createdAt || durationDays == null) {
    return null
  }

  const start = new Date(createdAt)
  if (Number.isNaN(start.getTime())) {
    return null
  }

  const end = new Date(start)
  end.setDate(end.getDate() + Number(durationDays))
  return end.toISOString().slice(0, 10)
}

function normalizeActivePolicy(policy) {
  if (!policy) {
    return null
  }

  const startDate = policy.createdAt
    ? new Date(policy.createdAt).toISOString().slice(0, 10)
    : null

  return {
    id: policy.id,
    name: policy.name || 'Unknown Policy',
    category: policy.category || 'General',
    holderName: policy.holderName || 'Unknown',
    holderEmail: policy.holderEmail || '',
    premium: Number(policy.premium) || 0,
    deductible: Number(policy.deductible) || 0,
    coverageAmount: Number(policy.coverageAmount) || 0,
    startDate,
    endDate: computePolicyEndDate(policy.createdAt, policy.duration),
    status: 'active',
    proposalId: policy.proposalId || '—',
    paymentStatus: policy.status === 'pending' ? 'pending' : 'paid',
  }
}

export async function fetchActivePolicies(options = {}) {
  const response = await apiRequest('/api/policy/all', {
    cacheTtlMs: 0,
    ...options,
  })

  return unwrapList(response, 'policies')
    .filter((policy) => ACTIVE_POLICY_STATUSES.has(policy.status))
    .map(normalizeActivePolicy)
    .filter(Boolean)
}

export async function fetchAdminUsers() {
  throw new ApiError(
    'Admin user management is not available yet.',
    404,
  )
}

export async function updateAdminUserStatus(userId, status) {
  throw new ApiError(
    'Admin user status changes are not available yet.',
    404,
  )
}

export function rejectProposal(proposalId) {
  return apiRequest(`/api/proposal/${proposalId}`, {
    method: 'PATCH',
  })
}

export function createPolicyFromProposal(proposalId, payload) {
  return apiRequest(`/api/policy/${proposalId}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
