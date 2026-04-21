import { useMemo, useState } from 'react'

const initialPolicies = [
  { id: '#1042', owner: 'Tenzin Choda', type: 'Travel Insurance', wallet: '0x7a3b...f29d', minted: 'Jun 15, 2025', status: 'Active' },
  { id: '#1041', owner: 'Sonam Peki', type: 'Motor Insurance', wallet: '0x8b4c...031e', minted: 'Mar 01, 2026', status: 'Active' },
  { id: '#1040', owner: 'Tashi Kelzang', type: 'Life Insurance', wallet: '0x9c5d...b42f', minted: 'Jan 10, 2026', status: 'Active' },
]

const statusStyles = {
  Active: 'bg-green-50 text-green-700 border border-green-200',
  Revoked: 'bg-red-50 text-red-600 border border-red-200',
}

export default function AdminRevocation() {
  const [policies, setPolicies] = useState(initialPolicies)
  const [search, setSearch] = useState('')
  const [selectedPolicy, setSelectedPolicy] = useState(null)
  const [notes, setNotes] = useState('')

  const filteredPolicies = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) {
      return policies
    }

    return policies.filter((policy) => policy.owner.toLowerCase().includes(query))
  }, [policies, search])

  const confirmRevoke = () => {
    if (!selectedPolicy) {
      return
    }

    setPolicies((previous) => previous.map((policy) => (
      policy.id === selectedPolicy.id ? { ...policy, status: 'Revoked', notes } : policy
    )))
    setSelectedPolicy(null)
    setNotes('')
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Policy Revocation</h1>
        <p className="text-gray-500 text-sm mt-1">Deactivate policies for fraud or dispute cases.</p>
      </div>

      <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
        Policy revocation is not available yet. Showing sample policies.
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <div className="flex items-center gap-3">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by owner name" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          <button className="px-4 py-2 bg-[#0f1729] text-white rounded-lg text-sm">Search</button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-7 text-xs text-gray-500 px-4 py-3 bg-gray-50 border-b border-gray-200">
          <div>Token ID</div>
          <div>Policyholder</div>
          <div>Policy Type</div>
          <div>Wallet</div>
          <div>Minted</div>
          <div>Status</div>
          <div>Actions</div>
        </div>
        {filteredPolicies.map((policy) => (
          <div key={policy.id} className="grid grid-cols-7 text-sm px-4 py-3 border-b border-gray-100 last:border-0">
            <div className="font-medium text-gray-900">{policy.id}</div>
            <div>{policy.owner}</div>
            <div>{policy.type}</div>
            <div className="text-gray-500">{policy.wallet}</div>
            <div className="text-gray-500">{policy.minted}</div>
            <div>
              <span className={`px-2 py-1 rounded-full text-xs ${statusStyles[policy.status]}`}>
                {policy.status}
              </span>
            </div>
            <div>
              {policy.status === 'Active' ? (
                <button onClick={() => setSelectedPolicy(policy)} className="px-3 py-1 text-xs border border-red-200 text-red-600 rounded-lg hover:bg-red-50">
                  Revoke
                </button>
              ) : (
                <span className="text-xs text-gray-400">{policy.status}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedPolicy && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Revoke Policy {selectedPolicy.id}</h2>
              <button onClick={() => { setSelectedPolicy(null); setNotes('') }} className="text-gray-400 hover:text-gray-600">x</button>
            </div>
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Provide the revocation reason" />
            <div className="flex items-center justify-end gap-2 mt-4">
              <button onClick={() => { setSelectedPolicy(null); setNotes('') }} className="px-4 py-2 text-sm border border-gray-200 rounded-lg">
                Cancel
              </button>
              <button onClick={confirmRevoke} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg">
                Revoke
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
