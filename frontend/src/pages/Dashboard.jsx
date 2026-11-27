import { useAuth } from '../AuthContext'

export default function Dashboard() {
  const { user, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="flex items-center justify-between bg-white px-6 py-4 shadow-sm">
        <h1 className="text-xl font-bold text-indigo-600">TaskFlow</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600">{user.name}</span>
          <button
            onClick={signOut}
            className="rounded-lg bg-slate-800 px-3 py-1.5 text-sm text-white hover:bg-slate-700"
          >
            Logout
          </button>
        </div>
      </header>
      <main className="p-6">
        <h2 className="text-lg font-semibold text-slate-700">Your workspaces</h2>
        <p className="mt-2 text-slate-500">Yahan agle step mein workspaces dikhenge.</p>
      </main>
    </div>
  )
}