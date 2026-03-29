import { useState } from 'react'

const initialForm = {
  holderCid: '',
  policyName: '',
  paymentType: '',
  category: '',
  coverageAmount: '',
  premiumFrequency: '',
  premiumAmount: '',
  policyTerm: '',
  deductibleAmount: '',
  description: '',
  coverage: '',
  limitations: '',
}

export default function AdminCustomMinting() {
  const [formData, setFormData] = useState(initialForm)
  const [drafts, setDrafts] = useState([])
  const [message, setMessage] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setMessage('')
    if (!formData.holderCid.trim() || !formData.policyName.trim()) {
      setMessage('Please fill in the policy name and holder CID.')
      return
    }

    const newDraft = {
      id: `MNT-${Math.floor(Math.random() * 900 + 100)}`,
      name: formData.policyName,
      holderCid: formData.holderCid,
      coverageAmount: formData.coverageAmount || '—',
      premiumAmount: formData.premiumAmount || '—',
      status: 'Drafted',
    }

    setDrafts((prev) => [newDraft, ...prev])
    setFormData(initialForm)
    setMessage('Draft created. Ready to mint when blockchain integration is enabled.')
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Custom Minting</h1>
        <p className="text-gray-500 text-sm mt-1">Manually draft, hash, and mint a custom policy NFT to a user.</p>
      </div>
      <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
        Minting endpoints are not wired yet. This form stores drafts locally until blockchain APIs are added.
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Create Policy</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500">Holder&apos;s CID</label>
              <input
                name="holderCid"
                value={formData.holderCid}
                onChange={handleChange}
                placeholder="Enter the policy holder's CID"
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Policy Name</label>
              <input
                name="policyName"
                value={formData.policyName}
                onChange={handleChange}
                placeholder="e.g., Comprehensive motor insurance"
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Payment Type</label>
              <select
                name="paymentType"
                value={formData.paymentType}
                onChange={handleChange}
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
              >
                <option value="">Select payment type</option>
                <option value="fixed">Fixed</option>
                <option value="recurring">Recurring</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
              >
                <option value="">Select type</option>
                <option>Life</option>
                <option>Motor</option>
                <option>Travel</option>
                <option>Health</option>
                <option>Property</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500">Coverage Amount</label>
              <input
                name="coverageAmount"
                value={formData.coverageAmount}
                onChange={handleChange}
                placeholder="e.g., Nu. 50,000,000"
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Premium Frequency</label>
              <select
                name="premiumFrequency"
                value={formData.premiumFrequency}
                onChange={handleChange}
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
              >
                <option value="">Select frequency</option>
                <option>Monthly</option>
                <option>Quarterly</option>
                <option>Yearly</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500">Premium Amount</label>
              <input
                name="premiumAmount"
                value={formData.premiumAmount}
                onChange={handleChange}
                placeholder="e.g., Nu. 3,500"
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Policy Term</label>
              <input
                name="policyTerm"
                value={formData.policyTerm}
                onChange={handleChange}
                placeholder="e.g., 20 years"
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-gray-500">Deductible Amount</label>
              <input
                name="deductibleAmount"
                value={formData.deductibleAmount}
                onChange={handleChange}
                placeholder="e.g., Nu. 50,000"
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="A short description about the policy"
              rows={3}
              className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Coverage</label>
            <textarea
              name="coverage"
              value={formData.coverage}
              onChange={handleChange}
              placeholder="Describe what the policy covers"
              rows={3}
              className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Limitations</label>
            <textarea
              name="limitations"
              value={formData.limitations}
              onChange={handleChange}
              placeholder="Describe explicitly what the policy won't cover"
              rows={3}
              className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
          </div>

          {message && <div className="text-sm text-teal-600">{message}</div>}

          <div className="flex items-center justify-end gap-2">
            <button type="button" onClick={() => setFormData(initialForm)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 text-sm bg-[#0f1729] text-white rounded-lg hover:bg-[#1e293b]">
              Create Proposal
            </button>
          </div>
        </form>
      </div>

      {drafts.length > 0 && (
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent Drafts</h3>
          <div className="space-y-3">
            {drafts.map((draft) => (
              <div key={draft.id} className="flex items-center justify-between border border-gray-100 rounded-lg p-3 text-sm">
                <div>
                  <div className="font-medium text-gray-900">{draft.name}</div>
                  <div className="text-xs text-gray-500">CID: {draft.holderCid}</div>
                </div>
                <div className="text-xs text-gray-500">{draft.coverageAmount}</div>
                <span className="px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-700">{draft.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
