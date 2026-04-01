import { apiRequest } from './api'

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
  const response = await apiRequest('/api/template')
  return unwrapList(response, 'templates').map(normalizeTemplate).filter(Boolean)
}

export async function fetchCategories() {
  const response = await apiRequest('/api/template/category')
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
  const response = await apiRequest(`/api/template/${id}`)
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
  const response = await apiRequest('/api/proposal/admin')
  return unwrapList(response, 'userProposals')
}

export async function fetchAdminUsers() {
  const response = await apiRequest('/api/user/admin')
  return unwrapList(response, 'users')
}

export async function updateAdminUserStatus(userId, status) {
  const response = await apiRequest(`/api/user/${userId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })

  return response?.data?.user ?? { id: userId, status }
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
