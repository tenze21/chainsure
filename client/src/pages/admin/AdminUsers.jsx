export default function AdminUsers() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-500 text-sm mt-1">This page is limited by the routes exposed on the current backend branch.</p>
      </div>

      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900">
        The server exposes `GET /api/user` for the signed-in user only. It does not expose `GET /api/user/admin`
        or `PATCH /api/user/:id/status`, so the admin user directory and status actions cannot be integrated from
        the frontend alone.
      </div>

      <div className="mt-5 p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600">
        If you need live admin user management, the missing server routes have to be added. Until then, this page
        stays read-only and avoids making unsupported requests.
      </div>
    </div>
  )
}
