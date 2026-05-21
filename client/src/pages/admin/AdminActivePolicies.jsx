import { useEffect, useMemo, useState } from 'react'
import { fetchActivePolicies } from '../../lib/adminApi'

// ─── Helpers ──────────────────────────────────────────────────────────────
function formatDate(value) {
  if (!value) return '--'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '--' : date.toLocaleDateString()
}

function formatCurrency(value) {
  if (value == null) return '--'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}

function daysUntilExpiry(endDate) {
  if (!endDate) return null
  const diff = new Date(endDate) - new Date()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function expiryBadge(days) {
  if (days === null) return null
  if (days <= 30) return { label: `Expires in ${days}d`, className: 'bg-red-50 text-red-600' }
  if (days <= 90) return { label: `Expires in ${days}d`, className: 'bg-amber-50 text-amber-700' }
  return null
}

const CATEGORY_ICONS = {
  'Health Insurance': (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  'Auto Insurance': (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2.5.5M13 16H3m10 0l2.5.5M13 6l3 4h2.5a1 1 0 011 1v3.5" />
    </svg>
  ),
  'Home Insurance': (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  'Life Insurance': (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
}

// ─── Component ────────────────────────────────────────────────────────────
export default function AdminActivePolicies() {
  const [policies, setPolicies] = useState([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')

  useEffect(() => {
    let active = true

    fetchActivePolicies()
      .then((items) => {
        if (active) {
          setPolicies(items)
        }
      })
      .catch((loadError) => {
        if (active) {
          setError(loadError?.message || 'Failed to load active policies.')
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

  const categories = useMemo(() => {
    const cats = [...new Set(policies.map((p) => p.category))]
    return ['All', ...cats]
  }, [policies])

  const filtered = useMemo(() => {
    return policies.filter((p) => {
      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.holderName.toLowerCase().includes(search.toLowerCase()) ||
        p.id.toLowerCase().includes(search.toLowerCase())
      const matchesCat = categoryFilter === 'All' || p.category === categoryFilter
      return matchesSearch && matchesCat
    })
  }, [policies, search, categoryFilter])

  const selected = filtered[selectedIndex] || null

  useEffect(() => {
    setSelectedIndex(0)
  }, [search, categoryFilter])

  const days = selected ? daysUntilExpiry(selected.endDate) : null
  const expiry = expiryBadge(days)

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Active Policies</h1>
          <p className="text-gray-500 text-sm mt-1">All currently active policies on the platform.</p>
        </div>
        <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-medium">
          {policies.length} Active
        </span>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, holder, or policy ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0f1729]/20"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition ${
                categoryFilter === cat
                  ? 'bg-[#0f1729] text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        {/* List panel */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-sm text-gray-500">Loading policies…</div>
          ) : filtered.length === 0 ? (
            <div className="text-sm text-gray-500">No active policies match your filters.</div>
          ) : (
            filtered.map((policy, index) => {
              const d = daysUntilExpiry(policy.endDate)
              const badge = expiryBadge(d)
              return (
                <button
                  key={policy.id}
                  onClick={() => setSelectedIndex(index)}
                  className={`w-full text-left p-4 rounded-xl border transition ${
                    selectedIndex === index
                      ? 'border-[#0f1729] shadow-sm bg-white'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-gray-400 shrink-0">
                        {CATEGORY_ICONS[policy.category] || null}
                      </span>
                      <span className="font-medium text-gray-900 truncate">{policy.name}</span>
                    </div>
                    <span className="px-2 py-1 text-xs rounded-full bg-teal-50 text-teal-700 shrink-0">
                      Active
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 pl-6">{policy.holderName}</div>
                  <div className="text-xs text-gray-400 mt-0.5 pl-6">{policy.id} · {policy.category}</div>
                  {badge && (
                    <div className={`mt-2 ml-6 inline-flex px-2 py-0.5 text-xs rounded-full ${badge.className}`}>
                      {badge.label}
                    </div>
                  )}
                </button>
              )
            })
          )}
        </div>

        {/* Detail panel */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 min-h-[420px]">
          {selected ? (
            <div>
              {/* Detail header */}
              <div className="flex items-start justify-between mb-5 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
                    {CATEGORY_ICONS[selected.category] || (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{selected.name}</h2>
                    <p className="text-sm text-gray-500">{selected.category}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="px-3 py-1 text-xs rounded-full bg-teal-50 text-teal-700">Active</span>
                  {expiry && (
                    <span className={`px-3 py-1 text-xs rounded-full ${expiry.className}`}>
                      {expiry.label}
                    </span>
                  )}
                </div>
              </div>

              {/* Policy holder */}
              <div className="mb-5 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Policy Holder</div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#0f1729] text-white flex items-center justify-center text-sm font-semibold shrink-0">
                    {selected.holderName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{selected.holderName}</div>
                    <div className="text-xs text-gray-500">{selected.holderEmail}</div>
                  </div>
                </div>
              </div>

              {/* Key stats */}
              <div className="grid grid-cols-2 gap-3 mb-5 text-sm">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500">Policy ID</div>
                  <div className="font-medium text-gray-900 break-all">{selected.id}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500">Proposal ID</div>
                  <div className="font-medium text-gray-900">{selected.proposalId}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500">Start Date</div>
                  <div className="font-medium text-gray-900">{formatDate(selected.startDate)}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500">End Date</div>
                  <div className="font-medium text-gray-900">{formatDate(selected.endDate)}</div>
                </div>
              </div>

              {/* Financial details */}
              <div className="mb-5">
                <div className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Financial Details</div>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500">Monthly Premium</div>
                    <div className="font-semibold text-gray-900 mt-0.5">{formatCurrency(selected.premium)}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500">Deductible</div>
                    <div className="font-semibold text-gray-900 mt-0.5">{formatCurrency(selected.deductible)}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500">Coverage</div>
                    <div className="font-semibold text-gray-900 mt-0.5">{formatCurrency(selected.coverageAmount)}</div>
                  </div>
                </div>
              </div>

              {/* Payment status */}
              <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50">
                <span className="text-sm text-gray-600">Payment Status</span>
                <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                  selected.paymentStatus === 'paid'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-amber-50 text-amber-700'
                }`}>
                  {selected.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                </span>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="font-medium">Select a Policy</div>
              <div className="text-sm">Choose a policy from the list to view its details.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}