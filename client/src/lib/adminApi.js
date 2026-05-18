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

async function requestFirstSuccessful(paths, options) {
  let lastError = null

  for (const path of paths) {
    try {
      return await apiRequest(path, options)
    } catch (error) {
      lastError = error

      if (error?.status && ![404, 405, 500].includes(error.status)) {
        throw error
      }
    }
  }

  throw lastError || new Error('No reachable endpoint found.')
}

function normalizeCategoryList(responseData) {
  const rawCategories = responseData?.categories
    || responseData?.templateCategories
    || responseData?.category
    || []

  if (!Array.isArray(rawCategories)) {
    return []
  }

  return rawCategories
    .map((entry, index) => {
      if (typeof entry === 'string') {
        return { id: `derived-${index}-${entry}`, name: entry }
      }

      if (entry && typeof entry === 'object') {
        return {
          id: entry.id || entry._id || `derived-${index}-${entry.name || 'category'}`,
          name: entry.name || '',
        }
      }

      return null
    })
    .filter((entry) => entry?.name)
}

function deriveCategoriesFromTemplates(templates) {
  const unique = new Map()

  templates.forEach((template) => {
    const name = template?.categoryName || template?.category?.name || ''
    if (!name) {
      return
    }

    const key = name.trim().toLowerCase()
    if (!unique.has(key)) {
      unique.set(key, { id: `derived-${key}`, name })
    }
  })

  return Array.from(unique.values())
}

export async function fetchTemplates() {
  const response = await apiRequest('/api/template')
  return unwrapList(response, 'templates').map(normalizeTemplate).filter(Boolean)
}

export async function fetchCategories() {
  try {
    const response = await requestFirstSuccessful([
      '/api/template/category',
      '/api/template/categories',
      '/api/category/template',
    ])

    return normalizeCategoryList(response?.data)
  } catch {
    try {
      const templates = await fetchTemplates()
      return deriveCategoriesFromTemplates(templates)
    } catch {
      return []
    }
  }
}

export async function createCategory(name) {
  try {
    const response = await requestFirstSuccessful([
      '/api/template/category',
      '/api/template/categories',
    ], {
      method: 'POST',
      body: JSON.stringify({ name }),
    })

    return response?.data?.newCategory ?? { id: `local-${name.toLowerCase()}`, name }
  } catch {
    // Keep client flow usable even when backend category endpoints are missing on this branch.
    return { id: `local-${name.toLowerCase()}`, name }
  }
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
  }).then((response) => response?.data ?? null)
}
