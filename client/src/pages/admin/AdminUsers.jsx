import { useMemo, useState } from 'react'

const initialUsers = [
  { id: 'USR-01', name: 'Tenzin Choda', email: 'tenzin@example.com', wallet: '0x7a3b...f29d', policies: 3, joined: 'Jan 10, 2026', status: 'Active', initials: 'TC' },
  { id: 'USR-02', name: 'Sonam Peki', email: 'sonam@example.com', wallet: '0x8b4c...031e', policies: 2, joined: 'Feb 15, 2026', status: 'Active', initials: 'SP' },
  { id: 'USR-03', name: 'Tashi Kelzang', email: 'tashi@example.com', wallet: '0x9c5d...b42f', policies: 1, joined: 'Mar 01, 2026', status: 'Active', initials: 'TK' },
  { id: 'USR-04', name: 'Sonam Wangmo', email: 'wangmo@example.com', wallet: '0xa6e7...c53g', policies: 1, joined: 'Dec 20, 2025', status: 'Suspended', initials: 'SW' },
  { id: 'USR-05', name: 'Karma Dorji', email: 'karma@example.com', wallet: '0xb7f8...d64h', policies: 2, joined: 'Nov 15, 2025', status: 'Active', initials: 'KD' },
]

const statusStyles = {
  Active: 'bg-green-50 text-green-700',
  Suspended: 'bg-red-50 text-red-600',
}

export default function AdminUsers() {
  const [users, setUsers] = useState(initialUsers)
  const [search, setSearch] = useState('')

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return users
    return users.filter((user) => (
      user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query)
    ))
  }, [search, users])

  const toggleStatus = (id) => {
    setUsers((prev) => prev.map((user) => (
      user.id === id ? { ...user, status: user.status === 'Active' ? 'Suspended' : 'Active' } : user
    )))
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-500 text-sm mt-1">View and manage registered policyholders.</p>
      </div>
      <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
        User listing endpoints are not available in the backend yet. Showing sample users.
      </div>

      <div className="mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users by name or email"
          className="w-full max-w-sm px-4 py-2 border border-gray-200 rounded-lg text-sm"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-6 text-xs text-gray-500 px-4 py-3 bg-gray-50 border-b border-gray-200">
          <div>User</div>
          <div>Wallet Address</div>
          <div>Policies</div>
          <div>Joined</div>
          <div>Status</div>
          <div>Actions</div>
        </div>
        {filteredUsers.map((user) => (
          <div key={user.id} className="grid grid-cols-6 text-sm px-4 py-3 border-b border-gray-100 last:border-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
                {user.initials}
              </div>
              <div>
                <div className="font-medium text-gray-900">{user.name}</div>
                <div className="text-xs text-gray-500">{user.email}</div>
              </div>
            </div>
            <div className="text-gray-500">{user.wallet}</div>
            <div className="text-gray-900">{user.policies}</div>
            <div className="text-gray-500">{user.joined}</div>
            <div>
              <span className={`px-2 py-1 rounded-full text-xs ${statusStyles[user.status]}`}>
                {user.status}
              </span>
            </div>
            <div>
              <button
                onClick={() => toggleStatus(user.id)}
                className="px-3 py-1 text-xs border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                {user.status === 'Active' ? 'Suspend' : 'Activate'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
