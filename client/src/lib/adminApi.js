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

export async function fetchAdminProposals() {
  const response = await apiRequest('/api/proposal/admin', { cacheTtlMs: 30 * 1000 })
  return unwrapList(response, 'userProposals')
}

export async function fetchAdminUsers() {
  throw new ApiError(
    'This backend branch does not expose `GET /api/user/admin`, so the admin user list is unavailable from the client alone.',
    404,
  )
}

export async function updateAdminUserStatus(userId, status) {
  throw new ApiError(
    'This backend branch does not expose `PATCH /api/user/:id/status`, so user status changes are unavailable from the client alone.',
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
