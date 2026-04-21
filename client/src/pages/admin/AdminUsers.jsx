export default function AdminUsers() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-500 text-sm mt-1">Review customer administration options.</p>
      </div>

      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900">
        Admin user directory and status actions are not available yet.
      </div>

      <div className="mt-5 p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600">
        This page stays read-only until user management tools are enabled.
      </div>
    </div>
  )
}
