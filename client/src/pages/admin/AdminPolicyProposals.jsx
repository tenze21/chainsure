import { useEffect, useMemo, useState } from 'react'
import { fetchAdminProposals } from '../../lib/adminApi'

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString()
}

export default function AdminPolicyProposals() {
  const [applications, setApplications] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true
    fetchAdminProposals()
      .then((data) => {
        if (!isMounted) return
        const mapped = data.map((proposal, index) => ({
          id: `APP-${String(index + 1).padStart(3, '0')}`,
          status: proposal.status ? proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1) : 'Pending',
          name: proposal.name || 'Unknown',
          category: proposal.category || 'General',
          submitted: formatDate(proposal.createdAt),
          summary: 'Full proposal details require backend support for proposal IDs.',
        }))
        setApplications(mapped)
        setSelectedId(mapped[0]?.id || null)
      })
      .catch((err) => {
        if (!isMounted) return
        setError(err?.message || 'Failed to load proposals.')
      })
      .finally(() => {
        if (!isMounted) return
        setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const selectedApplication = useMemo(
    () => applications.find((app) => app.id === selectedId),
    [applications, selectedId],
  )

  const pendingCount = applications.filter((app) => app.status === 'Pending').length

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Policy Proposals</h1>
          <p className="text-gray-500 text-sm mt-1">Review life insurance applications, assess health details, and set premiums.</p>
        </div>
        <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">
          {pendingCount} Pending Review
        </span>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="mb-4 p-3 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-700">
        Approval actions require proposal IDs from the backend. The current API returns summary fields only, so approve/reject is disabled until that is added.
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        <div className="space-y-3">
          {loading ? (
            <div className="text-sm text-gray-500">Loading proposals...</div>
          ) : (
            applications.map((app) => (
              <button
                key={app.id}
                onClick={() => setSelectedId(app.id)}
                className={`w-full text-left p-4 rounded-xl border ${selectedId === app.id ? 'border-[#0f1729] shadow-sm' : 'border-gray-200 bg-white'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium text-gray-900">{app.name}</div>
                  <span className={`px-2 py-1 text-xs rounded-full ${app.status === 'Approved' ? 'bg-green-50 text-green-700' : app.status === 'Rejected' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'}`}>
                    {app.status}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">{app.id} • {app.submitted}</div>
                <div className="text-sm text-gray-600 mt-2">{app.category}</div>
              </button>
            ))
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 min-h-[360px]">
          {selectedApplication ? (
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{selectedApplication.name}</h2>
                  <p className="text-sm text-gray-500">{selectedApplication.category}</p>
                </div>
                <span className={`px-3 py-1 text-xs rounded-full ${selectedApplication.status === 'Approved' ? 'bg-green-50 text-green-700' : selectedApplication.status === 'Rejected' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'}`}>
                  {selectedApplication.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500">Application ID</div>
                  <div className="font-medium text-gray-900">{selectedApplication.id}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500">Submitted</div>
                  <div className="font-medium text-gray-900">{selectedApplication.submitted}</div>
                </div>
              </div>

              <div className="mb-6">
                <div className="text-xs text-gray-500 mb-1">Notes</div>
                <div className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{selectedApplication.summary}</div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled
                  className="px-4 py-2 text-sm border border-red-200 text-red-300 rounded-lg cursor-not-allowed"
                >
                  Reject
                </button>
                <button
                  disabled
                  className="px-4 py-2 text-sm bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed"
                >
                  Approve
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <div className="font-medium">Select an Application</div>
              <div className="text-sm">Choose an application from the list to review details.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
