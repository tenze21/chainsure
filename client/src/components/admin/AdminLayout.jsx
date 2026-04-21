import { useEffect, useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { logoutUser } from '../../lib/api'
import { clearStoredUser, loadStoredUser } from '../../lib/session'

const NAV_ITEMS = [
  { path: '/admin', label: 'Dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm0 8a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10-8a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zm0 8a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z', end: true },
  { path: '/admin/templates', label: 'Policy Templates', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { path: '/admin/claims', label: 'Claims Review', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
  { path: '/admin/minting', label: 'Custom Minting', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
  { path: '/admin/revocation', label: 'Revocation', icon: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636' },
  { path: '/admin/proposals', label: 'Policy Proposals', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  { path: '/admin/users', label: 'Users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
]

const TITLES = {
  '/admin': 'Admin Dashboard',
  '/admin/templates': 'Policy Templates',
  '/admin/claims': 'Claims Review',
  '/admin/minting': 'Custom Minting',
  '/admin/revocation': 'Policy Revocation',
  '/admin/proposals': 'Policy Proposals',
  '/admin/users': 'User Management',
}

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [checkedRole, setCheckedRole] = useState(false)
  const [signOutPending, setSignOutPending] = useState(false)
  const [signOutError, setSignOutError] = useState('')
  const storedUser = loadStoredUser()

  useEffect(() => {
    if (!storedUser || storedUser.role !== 'admin') {
      navigate('/signin', { replace: true })
      return
    }

    setCheckedRole(true)
  }, [navigate, storedUser])

  const currentTitle = useMemo(() => {
    const matchingKey = Object.keys(TITLES).find((path) => (
      path !== '/admin' && location.pathname.startsWith(path)
    ))

    return TITLES[matchingKey || location.pathname] || 'Admin Portal'
  }, [location.pathname])

  const handleSignOut = async () => {
    setSignOutPending(true)
    setSignOutError('')

    try {
      await logoutUser()
    } catch (error) {
      setSignOutError(error?.message || 'Failed to complete sign out.')
    } finally {
      clearStoredUser()
      navigate('/signin', { replace: true })
      setSignOutPending(false)
    }
  }

  if (!checkedRole) {
    return null
  }

  return (
    <div className="min-h-screen flex bg-[#f0f2f5]">
      <aside className="w-56 bg-[#001529] flex flex-col fixed h-full">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-teal-400">
              <path d="M16 2L28 9V23L16 30L4 23V9L16 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="none" />
            </svg>
            <div>
              <div className="font-semibold text-white">ChainSure</div>
              <div className="text-xs text-white/60">Admin Portal</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) => `flex items-center gap-3 px-6 py-3 mx-2 rounded-lg transition-colors ${isActive ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              <span className="flex-1">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          {signOutError && (
            <div className="mb-3 text-xs text-red-300">
              {signOutError}
            </div>
          )}
          <button
            onClick={handleSignOut}
            disabled={signOutPending}
            className="flex items-center gap-3 w-full px-4 py-3 text-white/70 hover:bg-white/5 hover:text-white rounded-lg transition-colors disabled:opacity-70"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {signOutPending ? 'Signing Out...' : 'Sign Out'}
          </button>
        </div>
      </aside>

      <div className="flex-1 ml-56">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.16em] text-gray-400">Admin</div>
            <div className="text-xl font-semibold text-gray-900">{currentTitle}</div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">{storedUser?.fullName || 'ChainSure Admin'}</div>
              <div className="text-xs text-gray-500">{storedUser?.email || 'admin@chainsure.com'}</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white font-semibold">
              {(storedUser?.fullName || 'Admin')
                .split(' ')
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part[0]?.toUpperCase() || '')
                .join('') || 'AD'}
            </div>
          </div>
        </header>

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
