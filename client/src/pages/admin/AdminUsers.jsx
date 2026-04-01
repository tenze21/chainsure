import { useEffect, useMemo, useState } from 'react'
import { fetchAdminUsers, updateAdminUserStatus } from '../../lib/adminApi'

const statusStyles = {
  active: 'bg-green-50 text-green-700',
  suspended: 'bg-red-50 text-red-600',
}

function getInitials(fullName) {
  return String(fullName || '')
    .split(' ')
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'NA'
}

function formatWallet(value) {
  if (!value) {
    return 'Unavailable'
  }

  return value.length > 14 ? `${value.slice(0, 6)}...${value.slice(-4)}` : value
}

function formatDate(value) {
  if (!value) {
    return '--'
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '--' : date.toLocaleDateString()
}

function formatStatus(value) {
  return value === 'suspended' ? 'Suspended' : 'Active'
}

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pendingUserId, setPendingUserId] = useState('')

  useEffect(() => {
    let active = true

    fetchAdminUsers()
      .then((items) => {
        if (active) {
          setUsers(items)
        }
      })
      .catch((loadError) => {
        if (active) {
          setError(loadError?.message || 'Failed to load users.')
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

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) {
      return users
    }

    return users.filter((user) => (
      String(user.fullName || '').toLowerCase().includes(query)
      || String(user.email || '').toLowerCase().includes(query)
    ))
  }, [search, users])

  const handleToggleStatus = async (user) => {
    const nextStatus = user.status === 'suspended' ? 'active' : 'suspended'

    setPendingUserId(user.id)
    setError('')

    try {
      await updateAdminUserStatus(user.id, nextStatus)
      setUsers((previous) => previous.map((item) => (
        item.id === user.id ? { ...item, status: nextStatus } : item
      )))
    } catch (updateError) {
      setError(updateError?.message || 'Failed to update user status.')
    } finally {
      setPendingUserId('')
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-500 text-sm mt-1">View and manage registered policyholders.</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="mb-4">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
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

        {loading ? (
          <div className="px-4 py-6 text-sm text-gray-500">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="px-4 py-6 text-sm text-gray-500">No users found.</div>
        ) : (
          filteredUsers.map((user) => (
            <div key={user.id} className="grid grid-cols-6 text-sm px-4 py-3 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
                  {getInitials(user.fullName)}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{user.fullName}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </div>
              </div>
              <div className="text-gray-500">{formatWallet(user.walletAddress)}</div>
              <div className="text-gray-900">{user.policiesCount ?? 0}</div>
              <div className="text-gray-500">{formatDate(user.joinedAt)}</div>
              <div>
                <span className={`px-2 py-1 rounded-full text-xs ${statusStyles[user.status] || statusStyles.active}`}>
                  {formatStatus(user.status)}
                </span>
              </div>
              <div>
                <button
                  onClick={() => handleToggleStatus(user)}
                  disabled={pendingUserId === user.id}
                  className="px-3 py-1 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-60"
                >
                  {pendingUserId === user.id
                    ? 'Updating...'
                    : user.status === 'suspended'
                      ? 'Activate'
                      : 'Suspend'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
