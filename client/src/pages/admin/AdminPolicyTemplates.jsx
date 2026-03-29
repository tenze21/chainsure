import { useEffect, useMemo, useState } from 'react'
import { createTemplate, deleteTemplate, fetchCategories, fetchTemplates, updateTemplate } from '../../lib/adminApi'

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
  if (value === null || value === undefined || value === '') return '-'
  const amount = Number(value)
  if (Number.isNaN(amount)) return value
  return `Nu. ${amount.toLocaleString()}`
}

export default function AdminPolicyTemplates() {
  const [templates, setTemplates] = useState([])
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [formData, setFormData] = useState(initialFormState)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [detailsError, setDetailsError] = useState('')
  const [detailsForm, setDetailsForm] = useState(initialFormState)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    let isMounted = true

    Promise.all([fetchTemplates(), fetchCategories()])
      .then(([templateData, categoryData]) => {
        if (!isMounted) return
        setTemplates(templateData)
        setCategories(categoryData)
      })
      .catch((err) => {
        if (!isMounted) return
        setError(err?.message || 'Failed to load policy templates.')
      })
      .finally(() => {
        if (!isMounted) return
        setLoading(false)
      })

    return () => {
      isMounted = false
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
    if (!query) return templates
    return templates.filter((template) => (
      template.name.toLowerCase().includes(query)
      || (categoryMap[template.categoryId] || '').toLowerCase().includes(query)
    ))
  }, [search, templates, categoryMap])

  const handleCreate = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!formData.name.trim() || !formData.category || !formData.paymentType) {
      setFormError('Name, category, and payment type are required.')
      return
    }

    const coverageAmount = Number(formData.coverageAmount)
    if (Number.isNaN(coverageAmount) || coverageAmount <= 0) {
      setFormError('Coverage amount must be a positive number.')
      return
    }

    const durationValue = formData.duration ? Number(formData.duration) : undefined
    if (formData.duration && (Number.isNaN(durationValue) || durationValue <= 0)) {
      setFormError('Duration must be a positive number of days.')
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        name: formData.name.trim(),
        category: formData.category,
        paymentType: formData.paymentType,
        coverageAmount,
        duration: durationValue,
        description: formData.description.trim(),
        coverageDetails: formData.coverageDetails.trim(),
        eligibility: formData.eligibility.trim(),
        limitations: formData.limitations.trim(),
      }

      const created = await createTemplate(payload)
      setTemplates((prev) => [created, ...prev])
      setFormData(initialFormState)
      setIsModalOpen(false)
    } catch (err) {
      setFormError(err?.message || 'Failed to create template.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const openDetails = (template) => {
    setSelectedTemplate(template)
    setDetailsForm({
      name: template.name || '',
      category: categoryMap[template.categoryId] || '',
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
    setIsEditing(false)
    setDetailsError('')
  }

  const validateTemplatePayload = (payload) => {
    if (!payload.name.trim() || !payload.category || !payload.paymentType) {
      return 'Name, category, and payment type are required.'
    }
    if (!payload.description.trim() || !payload.coverageDetails.trim() || !payload.eligibility.trim() || !payload.limitations.trim()) {
      return 'Description, coverage details, eligibility, and limitations are required.'
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

  const handleSave = async () => {
    if (!selectedTemplate) return
    setDetailsError('')

    const payload = {
      name: detailsForm.name,
      category: detailsForm.category,
      paymentType: detailsForm.paymentType,
      coverageAmount: Number(detailsForm.coverageAmount),
      duration: detailsForm.duration ? Number(detailsForm.duration) : undefined,
      description: detailsForm.description,
      coverageDetails: detailsForm.coverageDetails,
      eligibility: detailsForm.eligibility,
      limitations: detailsForm.limitations,
    }

    const validationError = validateTemplatePayload(payload)
    if (validationError) {
      setDetailsError(validationError)
      return
    }

    setIsSaving(true)
    try {
      const updated = await updateTemplate(selectedTemplate.id, payload)
      setTemplates((prev) => prev.map((template) => (
        template.id === selectedTemplate.id ? updated : template
      )))
      setSelectedTemplate(updated)
      setIsEditing(false)
    } catch (err) {
      setDetailsError(err?.message || 'Failed to update template.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedTemplate) return
    setDetailsError('')
    const confirmed = window.confirm('Delete this policy template? This cannot be undone.')
    if (!confirmed) return

    setIsDeleting(true)
    try {
      await deleteTemplate(selectedTemplate.id)
      setTemplates((prev) => prev.filter((template) => template.id !== selectedTemplate.id))
      closeDetails()
    } catch (err) {
      setDetailsError(err?.message || 'Delete failed. This endpoint may not be enabled on the server.')
    } finally {
      setIsDeleting(false)
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
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search templates..."
          className="w-full max-w-sm px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f1729]/20 focus:border-[#0f1729]"
        />
        <span className="text-sm text-gray-500">{filteredTemplates.length} templates</span>
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
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-xs text-gray-500">{categoryMap[template.categoryId] || 'Uncategorized'}</div>
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
          <div className="bg-white rounded-xl w-full max-w-2xl p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Create Policy Template</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">x</button>
            </div>

            {formError && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Template Name</label>
                  <input
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f1729]/20 focus:border-[#0f1729]"
                    placeholder="e.g., Premium Travel Protect"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#0f1729]/20 focus:border-[#0f1729]"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Payment Type</label>
                  <select
                    value={formData.paymentType}
                    onChange={(e) => setFormData((prev) => ({ ...prev, paymentType: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#0f1729]/20 focus:border-[#0f1729]"
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
                    value={formData.coverageAmount}
                    onChange={(e) => setFormData((prev) => ({ ...prev, coverageAmount: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f1729]/20 focus:border-[#0f1729]"
                    placeholder="e.g., 5000000"
                    type="number"
                    min="0"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Duration (days)</label>
                  <input
                    value={formData.duration}
                    onChange={(e) => setFormData((prev) => ({ ...prev, duration: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f1729]/20 focus:border-[#0f1729]"
                    placeholder="Optional"
                    type="number"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f1729]/20 focus:border-[#0f1729]"
                  placeholder="Describe the template."
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Coverage Details</label>
                <textarea
                  value={formData.coverageDetails}
                  onChange={(e) => setFormData((prev) => ({ ...prev, coverageDetails: e.target.value }))}
                  rows={3}
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f1729]/20 focus:border-[#0f1729]"
                  placeholder="Describe coverage details."
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Eligibility</label>
                <textarea
                  value={formData.eligibility}
                  onChange={(e) => setFormData((prev) => ({ ...prev, eligibility: e.target.value }))}
                  rows={3}
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f1729]/20 focus:border-[#0f1729]"
                  placeholder="Describe eligibility requirements."
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Limitations</label>
                <textarea
                  value={formData.limitations}
                  onChange={(e) => setFormData((prev) => ({ ...prev, limitations: e.target.value }))}
                  rows={3}
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f1729]/20 focus:border-[#0f1729]"
                  placeholder="Describe limitations."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg">
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
          <div className="bg-white rounded-xl w-full max-w-3xl p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{selectedTemplate.name}</h2>
                <p className="text-xs text-gray-500">Policy Template Details</p>
              </div>
              <button onClick={closeDetails} className="text-gray-400 hover:text-gray-600">x</button>
            </div>

            {detailsError && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {detailsError}
              </div>
            )}

            <div className="flex items-center justify-between mb-4">
              <div className="text-xs text-gray-500">
                Created {new Date(selectedTemplate.createdAt).toLocaleDateString()} - Updated {new Date(selectedTemplate.updatedAt).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-2">
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="px-3 py-1 text-xs border border-gray-200 rounded-lg">
                    Edit
                  </button>
                )}
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className={`px-3 py-1 text-xs rounded-lg ${isDeleting ? 'bg-gray-200 text-gray-500' : 'bg-red-50 text-red-600 border border-red-200'}`}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm text-gray-600">Template Name</label>
                {isEditing ? (
                  <input
                    value={detailsForm.name}
                    onChange={(e) => setDetailsForm((prev) => ({ ...prev, name: e.target.value }))}
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
                    onChange={(e) => setDetailsForm((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg bg-white"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                ) : (
                  <div className="mt-1 text-sm text-gray-900">{detailsForm.category || 'Uncategorized'}</div>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-600">Payment Type</label>
                {isEditing ? (
                  <select
                    value={detailsForm.paymentType}
                    onChange={(e) => setDetailsForm((prev) => ({ ...prev, paymentType: e.target.value }))}
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
                    onChange={(e) => setDetailsForm((prev) => ({ ...prev, coverageAmount: e.target.value }))}
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
                    onChange={(e) => setDetailsForm((prev) => ({ ...prev, duration: e.target.value }))}
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
                      rows={3}
                      value={detailsForm[field]}
                      onChange={(e) => setDetailsForm((prev) => ({ ...prev, [field]: e.target.value }))}
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
                  onClick={handleSave}
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
