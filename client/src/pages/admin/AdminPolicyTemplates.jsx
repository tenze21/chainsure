import { useEffect, useMemo, useState } from 'react'
import { createCategory, createTemplate, fetchCategories, fetchTemplates, updateTemplate } from '../../lib/adminApi'

const initialFormState = {
  name: '',
  category: '',
  paymentType: '',
  coverageAmount: '',
  duration: '',
  description: '',
  coverageDetails: '',
  eligibility: '',
  limitations: '',
}

const paymentTypes = [
  { value: 'fixed', label: 'Fixed' },
  { value: 'recurring', label: 'Recurring' },
]

function formatCurrency(value) {
  if (value === null || value === undefined || value === '') {
    return '-'
  }

  const amount = Number(value)
  return Number.isNaN(amount) ? value : `Nu. ${amount.toLocaleString()}`
}

function getTemplateCategory(template, categoryMap) {
  return template.categoryName || template.category?.name || categoryMap[template.categoryId] || 'Uncategorized'
}

function validateTemplateForm(payload) {
  if (!payload.name.trim() || !payload.category || !payload.paymentType) {
    return 'Name, category, and payment type are required.'
  }

  if (payload.description.trim().length < 50) {
    return 'Description must be at least 50 characters.'
  }

  if (payload.coverageDetails.trim().length < 50) {
    return 'Coverage details must be at least 50 characters.'
  }

  if (payload.eligibility.trim().length < 50) {
    return 'Eligibility must be at least 50 characters.'
  }

  if (payload.limitations.trim().length < 50) {
    return 'Limitations must be at least 50 characters.'
  }

  const coverageAmount = Number(payload.coverageAmount)
  if (Number.isNaN(coverageAmount) || coverageAmount <= 0) {
    return 'Coverage amount must be a positive number.'
  }

  if (payload.duration) {
    const durationValue = Number(payload.duration)
    if (Number.isNaN(durationValue) || durationValue <= 0) {
      return 'Duration must be a positive number of days.'
    }
  }

  return ''
}

export default function AdminPolicyTemplates() {
  const [templates, setTemplates] = useState([])
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState(initialFormState)
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categoryDraft, setCategoryDraft] = useState('')
  const [categoryError, setCategoryError] = useState('')
  const [categoryPending, setCategoryPending] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [detailsForm, setDetailsForm] = useState(initialFormState)
  const [detailsError, setDetailsError] = useState('')
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    let active = true

    Promise.all([fetchTemplates(), fetchCategories()])
      .then(([templateItems, categoryItems]) => {
        if (!active) {
          return
        }

        setTemplates(templateItems)
        setCategories(categoryItems)
      })
      .catch((loadError) => {
        if (active) {
          setError(loadError?.message || 'Failed to load policy templates.')
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [])

  const categoryMap = useMemo(() => {
    const map = {}
    categories.forEach((category) => {
      map[category.id] = category.name
    })
    return map
  }, [categories])

  const filteredTemplates = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) {
      return templates
    }

    return templates.filter((template) => {
      const categoryName = getTemplateCategory(template, categoryMap).toLowerCase()
      return template.name.toLowerCase().includes(query) || categoryName.includes(query)
    })
  }, [categoryMap, search, templates])

  const resetTemplateForm = () => {
    setFormData(initialFormState)
    setFormError('')
  }

  const handleCreateCategory = async () => {
    const trimmed = categoryDraft.trim()
    if (!trimmed) {
      setCategoryError('Category name is required.')
      return
    }

    setCategoryPending(true)
    setCategoryError('')

    try {
      await createCategory(trimmed)
      const refreshed = await fetchCategories()
      setCategories(refreshed)
      setFormData((previous) => ({ ...previous, category: trimmed }))
      setCategoryDraft('')
    } catch (createError) {
      setCategoryError(createError?.message || 'Failed to create category.')
    } finally {
      setCategoryPending(false)
    }
  }

  const handleCreateTemplate = async (event) => {
    event.preventDefault()

    const validationError = validateTemplateForm(formData)
    if (validationError) {
      setFormError(validationError)
      return
    }

    setIsSubmitting(true)
    setFormError('')

    try {
      const createdTemplate = await createTemplate({
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim(),
        coverageDetails: formData.coverageDetails.trim(),
        eligibility: formData.eligibility.trim(),
        limitations: formData.limitations.trim(),
        coverageAmount: Number(formData.coverageAmount),
        duration: formData.duration ? Number(formData.duration) : undefined,
      })

      setTemplates((previous) => [createdTemplate, ...previous])
      resetTemplateForm()
      setIsModalOpen(false)
    } catch (submitError) {
      setFormError(submitError?.message || 'Failed to create template.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const openDetails = (template) => {
    const categoryName = getTemplateCategory(template, categoryMap)

    setSelectedTemplate(template)
    setDetailsForm({
      name: template.name || '',
      category: categoryName,
      paymentType: template.paymentType || '',
      coverageAmount: template.coverageAmount ?? '',
      duration: template.duration ?? '',
      description: template.description || '',
      coverageDetails: template.coverageDetails || '',
      eligibility: template.eligibility || '',
      limitations: template.limitations || '',
    })
    setDetailsError('')
    setIsEditing(false)
    setIsDetailsOpen(true)
  }

  const closeDetails = () => {
    setIsDetailsOpen(false)
    setSelectedTemplate(null)
    setDetailsError('')
    setIsEditing(false)
  }

  const handleSaveDetails = async () => {
    if (!selectedTemplate) {
      return
    }

    const validationError = validateTemplateForm(detailsForm)
    if (validationError) {
      setDetailsError(validationError)
      return
    }

    setIsSaving(true)
    setDetailsError('')

    try {
      const updatedTemplate = await updateTemplate(selectedTemplate.id, {
        ...detailsForm,
        name: detailsForm.name.trim(),
        description: detailsForm.description.trim(),
        coverageDetails: detailsForm.coverageDetails.trim(),
        eligibility: detailsForm.eligibility.trim(),
        limitations: detailsForm.limitations.trim(),
        coverageAmount: Number(detailsForm.coverageAmount),
        duration: detailsForm.duration ? Number(detailsForm.duration) : undefined,
      })

      setTemplates((previous) => previous.map((template) => (
        template.id === updatedTemplate.id ? updatedTemplate : template
      )))
      setSelectedTemplate(updatedTemplate)
      setDetailsForm((previous) => ({
        ...previous,
        category: getTemplateCategory(updatedTemplate, categoryMap),
      }))
      setIsEditing(false)
    } catch (saveError) {
      setDetailsError(saveError?.message || 'Failed to update template.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Policy Templates</h1>
          <p className="text-gray-500 text-sm mt-1">Create and manage insurance product templates.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#0f1729] text-white rounded-lg hover:bg-[#1e293b] text-sm font-medium"
        >
          <span className="text-lg leading-none">+</span>
          New Template
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="mb-6 flex items-center gap-3">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search templates..."
          className="w-full max-w-sm px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f1729]/20 focus:border-[#0f1729]"
        />
        <span className="text-sm text-gray-500">{filteredTemplates.length} templates</span>
      </div>

      <div className="mb-6 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
        Create, list, and update are available. Delete is currently unavailable.
      </div>

      {loading ? (
        <div className="text-sm text-gray-500">Loading templates...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => openDetails(template)}
              className="bg-white rounded-xl border border-gray-200 p-5 text-left hover:shadow-sm hover:border-gray-300 transition"
            >
              <div className="flex items-start justify-between mb-4 gap-3">
                <div>
                  <div className="text-xs text-gray-500">{getTemplateCategory(template, categoryMap)}</div>
                  <div className="text-lg font-semibold text-gray-900">{template.name}</div>
                </div>
                <div className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                  {template.paymentType}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-4">
                <div className="bg-gray-50 rounded-lg p-2">
                  <div>Coverage</div>
                  <div className="text-gray-900 font-medium">{formatCurrency(template.coverageAmount)}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <div>Duration</div>
                  <div className="text-gray-900 font-medium">{template.duration ? `${template.duration} days` : 'Custom'}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <div>Created</div>
                  <div className="text-gray-900 font-medium">{new Date(template.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <div>Updated</div>
                  <div className="text-gray-900 font-medium">{new Date(template.updatedAt).toLocaleDateString()}</div>
                </div>
              </div>

              <div className="text-sm text-gray-600 line-clamp-2">{template.description}</div>
            </button>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Create Policy Template</h2>
              <button onClick={() => { setIsModalOpen(false); resetTemplateForm() }} className="text-gray-400 hover:text-gray-600">×</button>
            </div>

            {formError && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {formError}
              </div>
            )}

            <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="text-sm font-medium text-gray-900 mb-3">Categories</div>
              <div className="flex flex-col md:flex-row gap-3">
                <input
                  value={categoryDraft}
                  onChange={(event) => setCategoryDraft(event.target.value)}
                  placeholder="Add a new category if it does not exist"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg"
                />
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  disabled={categoryPending}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-70"
                >
                  {categoryPending ? 'Creating...' : 'Create Category'}
                </button>
              </div>
              {categoryError && <div className="mt-2 text-sm text-red-600">{categoryError}</div>}
            </div>

            <form onSubmit={handleCreateTemplate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Template Name</label>
                  <input
                    value={formData.name}
                    onChange={(event) => setFormData((previous) => ({ ...previous, name: event.target.value }))}
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Category</label>
                  <select
                    value={formData.category}
                    onChange={(event) => setFormData((previous) => ({ ...previous, category: event.target.value }))}
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg bg-white"
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.name}>{category.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Payment Type</label>
                  <select
                    value={formData.paymentType}
                    onChange={(event) => setFormData((previous) => ({ ...previous, paymentType: event.target.value }))}
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg bg-white"
                  >
                    <option value="">Select type</option>
                    {paymentTypes.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Coverage Amount</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.coverageAmount}
                    onChange={(event) => setFormData((previous) => ({ ...previous, coverageAmount: event.target.value }))}
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Duration (days)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.duration}
                    onChange={(event) => setFormData((previous) => ({ ...previous, duration: event.target.value }))}
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg"
                  />
                </div>
              </div>

              {['description', 'coverageDetails', 'eligibility', 'limitations'].map((field) => (
                <div key={field}>
                  <label className="text-sm text-gray-600">
                    {field === 'coverageDetails' ? 'Coverage Details' : field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
                  <textarea
                    rows={4}
                    value={formData[field]}
                    onChange={(event) => setFormData((previous) => ({ ...previous, [field]: event.target.value }))}
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg"
                  />
                  <div className="mt-1 text-xs text-gray-400">Minimum 50 characters.</div>
                </div>
              ))}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => { setIsModalOpen(false); resetTemplateForm() }} className="px-4 py-2 text-sm border border-gray-200 rounded-lg">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-4 py-2 text-sm rounded-lg ${isSubmitting ? 'bg-gray-200 text-gray-500' : 'bg-[#0f1729] text-white hover:bg-[#1e293b]'}`}
                >
                  {isSubmitting ? 'Creating...' : 'Create Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDetailsOpen && selectedTemplate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{selectedTemplate.name}</h2>
                <p className="text-xs text-gray-500">Policy Template Details</p>
              </div>
              <button onClick={closeDetails} className="text-gray-400 hover:text-gray-600">×</button>
            </div>

            {detailsError && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {detailsError}
              </div>
            )}

            <div className="flex items-center justify-between mb-4">
              <div className="text-xs text-gray-500">
                Created {new Date(selectedTemplate.createdAt).toLocaleDateString()} · Updated {new Date(selectedTemplate.updatedAt).toLocaleDateString()}
              </div>
              {!isEditing && (
                <button onClick={() => setIsEditing(true)} className="px-3 py-1 text-xs border border-gray-200 rounded-lg">
                  Edit
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm text-gray-600">Template Name</label>
                {isEditing ? (
                  <input
                    value={detailsForm.name}
                    onChange={(event) => setDetailsForm((previous) => ({ ...previous, name: event.target.value }))}
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg"
                  />
                ) : (
                  <div className="mt-1 text-sm text-gray-900">{detailsForm.name}</div>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-600">Category</label>
                {isEditing ? (
                  <select
                    value={detailsForm.category}
                    onChange={(event) => setDetailsForm((previous) => ({ ...previous, category: event.target.value }))}
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg bg-white"
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.name}>{category.name}</option>
                    ))}
                  </select>
                ) : (
                  <div className="mt-1 text-sm text-gray-900">{detailsForm.category}</div>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-600">Payment Type</label>
                {isEditing ? (
                  <select
                    value={detailsForm.paymentType}
                    onChange={(event) => setDetailsForm((previous) => ({ ...previous, paymentType: event.target.value }))}
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg bg-white"
                  >
                    <option value="">Select payment type</option>
                    {paymentTypes.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                ) : (
                  <div className="mt-1 text-sm text-gray-900">{detailsForm.paymentType}</div>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-600">Coverage Amount</label>
                {isEditing ? (
                  <input
                    type="number"
                    min="0"
                    value={detailsForm.coverageAmount}
                    onChange={(event) => setDetailsForm((previous) => ({ ...previous, coverageAmount: event.target.value }))}
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg"
                  />
                ) : (
                  <div className="mt-1 text-sm text-gray-900">{formatCurrency(detailsForm.coverageAmount)}</div>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-600">Duration (days)</label>
                {isEditing ? (
                  <input
                    type="number"
                    min="0"
                    value={detailsForm.duration}
                    onChange={(event) => setDetailsForm((previous) => ({ ...previous, duration: event.target.value }))}
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg"
                  />
                ) : (
                  <div className="mt-1 text-sm text-gray-900">{detailsForm.duration || 'Custom'}</div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {['description', 'coverageDetails', 'eligibility', 'limitations'].map((field) => (
                <div key={field}>
                  <label className="text-sm text-gray-600">
                    {field === 'coverageDetails' ? 'Coverage Details' : field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
                  {isEditing ? (
                    <textarea
                      rows={4}
                      value={detailsForm[field]}
                      onChange={(event) => setDetailsForm((previous) => ({ ...previous, [field]: event.target.value }))}
                      className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg"
                    />
                  ) : (
                    <div className="mt-1 text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{detailsForm[field]}</div>
                  )}
                </div>
              ))}
            </div>

            {isEditing && (
              <div className="flex items-center justify-end gap-2 mt-6">
                <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg">
                  Cancel
                </button>
                <button
                  onClick={handleSaveDetails}
                  disabled={isSaving}
                  className={`px-4 py-2 text-sm rounded-lg ${isSaving ? 'bg-gray-200 text-gray-500' : 'bg-[#0f1729] text-white hover:bg-[#1e293b]'}`}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
