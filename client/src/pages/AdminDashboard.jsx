import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchAdminProposals, fetchTemplates } from '../lib/adminApi'

function formatDate(value) {
  if (!value) {
    return '—'
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString()
}

export default function AdminDashboard() {
  const [templates, setTemplates] = useState([])
  const [proposals, setProposals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    Promise.all([fetchTemplates(), fetchAdminProposals()])
      .then(([templateItems, proposalItems]) => {
        if (!active) {
          return
        }

        setTemplates(templateItems)
        setProposals(proposalItems)
      })
      .catch((loadError) => {
        if (!active) {
          return
        }

        setError(loadError?.message || 'Failed to load admin dashboard data.')
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

  const stats = useMemo(() => {
    const pending = proposals.filter((proposal) => proposal.status === 'pending').length
    const approved = proposals.filter((proposal) => proposal.status === 'approved').length
    const categories = new Set(templates.map((template) => template.categoryName || template.category?.name).filter(Boolean))

    return [
      { title: 'Policy Templates', value: templates.length, hint: `${categories.size} categories`, href: '/admin/templates' },
      { title: 'Total Proposals', value: proposals.length, hint: 'All submitted applications', href: '/admin/proposals' },
      { title: 'Pending Review', value: pending, hint: 'Waiting for admin action', href: '/admin/proposals' },
      { title: 'Approved Proposals', value: approved, hint: 'Ready for policy creation', href: '/admin/proposals' },
    ]
  }, [proposals, templates])

  const recentProposals = useMemo(() => (
    [...proposals]
      .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
      .slice(0, 5)
  ), [proposals])

  const templatesByCategory = useMemo(() => {
    const counts = new Map()

    templates.forEach((template) => {
      const category = template.categoryName || template.category?.name || 'Uncategorized'
      counts.set(category, (counts.get(category) || 0) + 1)
    })

    return Array.from(counts.entries()).map(([category, count]) => ({ category, count }))
  }, [templates])

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of proposal and product activity.</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <Link key={stat.title} to={stat.href} className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 hover:shadow-sm transition">
            <div className="text-sm text-gray-500 mb-2">{stat.title}</div>
            <div className="text-3xl font-bold text-gray-900">{loading ? '—' : stat.value}</div>
            <div className="text-xs text-teal-600 font-medium mt-2">{stat.hint}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-gray-900">Recent Proposal Activity</h2>
              <p className="text-xs text-gray-500 mt-1">Latest submitted applications.</p>
            </div>
            <Link to="/admin/proposals" className="text-sm text-[#0f1729] hover:underline">View All</Link>
          </div>

          {loading ? (
            <div className="text-sm text-gray-500">Loading proposals...</div>
          ) : recentProposals.length === 0 ? (
            <div className="text-sm text-gray-500">No proposals have been submitted yet.</div>
          ) : (
            <div className="space-y-3">
              {recentProposals.map((proposal, index) => (
                <div key={`${proposal.name}-${proposal.createdAt}-${index}`} className="flex items-center justify-between gap-4 border border-gray-100 rounded-lg p-3">
                  <div>
                    <div className="font-medium text-gray-900">{proposal.name || 'Unknown Proposal'}</div>
                    <div className="text-sm text-gray-500">{proposal.category || 'General'} · Submitted {formatDate(proposal.createdAt)}</div>
                  </div>
                  <span className={`px-3 py-1 text-xs rounded-full ${proposal.status === 'approved' ? 'bg-green-50 text-green-700' : proposal.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'}`}>
                    {proposal.status || 'pending'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-gray-900">Template Coverage</h2>
              <p className="text-xs text-gray-500 mt-1">Product inventory by category.</p>
            </div>
            <Link to="/admin/templates" className="text-sm text-[#0f1729] hover:underline">Manage</Link>
          </div>

          {loading ? (
            <div className="text-sm text-gray-500">Loading templates...</div>
          ) : templatesByCategory.length === 0 ? (
            <div className="text-sm text-gray-500">No policy templates exist yet.</div>
          ) : (
            <div className="space-y-3">
              {templatesByCategory.map((item) => (
                <div key={item.category} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                  <div className="text-sm font-medium text-gray-900">{item.category}</div>
                  <div className="text-sm text-gray-500">{item.count} template{item.count === 1 ? '' : 's'}</div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </>
  )
}
