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

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((previous) => ({ ...previous, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setMessage('')

    if (!formData.holderCid.trim() || !formData.policyName.trim()) {
      setMessage('Please fill in the policy name and holder CID.')
      return
    }

    setDrafts((previous) => [
      {
        id: `MNT-${Math.floor(Math.random() * 900 + 100)}`,
        name: formData.policyName,
        holderCid: formData.holderCid,
        coverageAmount: formData.coverageAmount || '-',
        premiumAmount: formData.premiumAmount || '-',
        status: 'Drafted',
      },
      ...previous,
    ])
    setFormData(initialForm)
    setMessage('Draft created. Manual minting is not available yet.')
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Custom Minting</h1>
        <p className="text-gray-500 text-sm mt-1">Draft a custom policy for manual issuance.</p>
      </div>

      <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
        Manual policy minting is not available yet. You can save drafts for later review.
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500">Holder CID</label>
              <input name="holderCid" value={formData.holderCid} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500">Policy Name</label>
              <input name="policyName" value={formData.policyName} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500">Payment Type</label>
              <select name="paymentType" value={formData.paymentType} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                <option value="">Select payment type</option>
                <option value="fixed">Fixed</option>
                <option value="recurring">Recurring</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500">Category</label>
              <input name="category" value={formData.category} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500">Coverage Amount</label>
              <input name="coverageAmount" value={formData.coverageAmount} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500">Premium Amount</label>
              <input name="premiumAmount" value={formData.premiumAmount} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
          </div>

          {message && <div className="text-sm text-teal-600">{message}</div>}

          <div className="flex items-center justify-end gap-2">
            <button type="button" onClick={() => setFormData(initialForm)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg">
              Reset
            </button>
            <button type="submit" className="px-4 py-2 text-sm bg-[#0f1729] text-white rounded-lg hover:bg-[#1e293b]">
              Save Draft
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
