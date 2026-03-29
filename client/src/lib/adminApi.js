import { apiRequest } from './api'

export async function fetchTemplates() {
  const data = await apiRequest('/api/template')
  return data?.templates ?? []
}

export async function fetchCategories() {
  const data = await apiRequest('/api/template/category')
  return data?.categories ?? []
}

export async function createTemplate(payload) {
  const data = await apiRequest('/api/template', {
    method: 'POST',
    body: payload,
  })
  return data?.policyTemplate
}

export async function fetchTemplateById(id) {
  const data = await apiRequest(`/api/template/${id}`)
  return data?.template
}

export async function updateTemplate(id, payload) {
  const data = await apiRequest(`/api/template/${id}`, {
    method: 'PATCH',
    body: payload,
  })
  return data?.updatedTemplate
}

export async function deleteTemplate(id) {
  return apiRequest(`/api/template/${id}`, {
    method: 'DELETE',
  })
}

export async function fetchAdminProposals() {
  const data = await apiRequest('/api/proposal/admin')
  return data?.userProposals ?? []
}
