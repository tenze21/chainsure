import { Link } from 'react-router-dom'

const stats = [
  { title: 'Total Policies', value: '1,247', trend: '+12% this month', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { title: 'Active Users', value: '843', trend: '+8% this month', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  { title: 'Pending Claims', value: '23', trend: '+3 this month', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
  { title: 'Revenue (MTD)', value: 'Nu. 4,32,000', trend: '+15% this month', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
]

const recentMinting = [
  { name: 'Tashi Kelzang Phuntsho', policy: 'Travel Insurance', tokenId: '#1042', time: '2 hours ago', initials: 'TC' },
  { name: 'Sonam Peki', policy: 'Motor Insurance', tokenId: '#1039', time: '4 hours ago', initials: 'SP' },
  { name: 'Tenzin Choda', policy: 'Life Insurance', tokenId: '#1036', time: '1 day ago', initials: 'TK' },
  { name: 'Sonam Wangmo', policy: 'Property Insurance', tokenId: '#1032', time: '2 days ago', initials: 'SW' },
]

const pendingClaims = [
  { category: 'Medical Expense', id: 'CLM-024', user: 'Tenzin Choda', policy: 'Travel #1042', priority: 'High', priorityColor: 'bg-red-100 text-red-700' },
  { category: 'Accident', id: 'CLM-023', user: 'Karma Dorji', policy: 'Motor #1038', priority: 'Medium', priorityColor: 'bg-amber-100 text-amber-700' },
  { category: 'Trip Cancellation', id: 'CLM-022', user: 'Pema Lhamo', policy: 'Travel #1035', priority: 'Low', priorityColor: 'bg-gray-100 text-gray-700' },
]

export default function AdminDashboard() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of the ChainSure insurance platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-white rounded-lg border border-gray-200 p-5 relative">
            <svg className="w-8 h-8 text-teal-500 absolute top-4 right-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
            </svg>
            <div className="text-sm text-gray-500 mb-1">{stat.title}</div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-teal-600 font-medium mt-1">{stat.trend}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Recent Minting Activity</h2>
          <div className="space-y-4">
            {recentMinting.map((item) => (
              <div key={item.tokenId} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium text-sm">{item.initials}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900">{item.name}</div>
                  <div className="text-sm text-gray-500">{item.policy} • {item.tokenId}</div>
                </div>
                <div className="text-sm text-gray-400">{item.time}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Pending Claims</h2>
            <Link to="/admin/claims" className="text-sm text-[#0f1729] hover:underline">View All →</Link>
          </div>
          <div className="space-y-3">
            {pendingClaims.map((claim) => (
              <div key={claim.id} className="flex items-center justify-between gap-3 py-3 border-b border-gray-100 last:border-0">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900">{claim.category}</div>
                  <div className="text-sm text-gray-500">{claim.id} • {claim.user} • {claim.policy}</div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${claim.priorityColor}`}>{claim.priority}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
