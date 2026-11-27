import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

export default function Sidebar({
  workspaces,
  currentId,
  onCreateWorkspace,
  user,
  onSignOut,
}) {
  const navigate = useNavigate()
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  async function handleCreate(e) {
    e.preventDefault()
    setError('')
    try {
      const ws = await onCreateWorkspace(name.trim())
      setName('')
      setAdding(false)
      navigate(`/w/${ws.id}`)
    } catch (err) {
      setError(err.message)
    }
  }

  function cancel() {
    setAdding(false)
    setName('')
    setError('')
  }

  return (
    <aside className="flex w-64 shrink-0 flex-col bg-slate-900 text-slate-300">
      <div className="px-5 py-5 text-lg font-bold text-white">TaskFlow</div>

      <div className="px-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Workspace
        </p>
        <select
          value={currentId ?? ''}
          onChange={(e) => navigate(`/w/${e.target.value}`)}
          disabled={workspaces.length === 0}
          className="mt-1 w-full rounded-lg bg-slate-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {workspaces.length === 0 && <option value="">No workspaces</option>}
          {workspaces.map((ws) => (
            <option key={ws.id} value={ws.id}>
              {ws.name}
            </option>
          ))}
        </select>

        {adding ? (
          <form onSubmit={handleCreate} className="mt-3 space-y-2">
            <input
              autoFocus
              type="text"
              placeholder="Workspace name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              className="w-full rounded-lg bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={!name.trim()}
                className="rounded-md bg-indigo-600 px-3 py-1 text-xs text-white hover:bg-indigo-500 disabled:opacity-50"
              >
                Create
              </button>
              <button
                type="button"
                onClick={cancel}
                className="rounded-md px-3 py-1 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="mt-3 text-sm text-indigo-400 hover:text-indigo-300"
          >
            + New workspace
          </button>
        )}
      </div>

      <nav className="mt-6 flex-1 px-3">
        <NavLink
          to={currentId ? `/w/${currentId}` : '/'}
          end={!currentId}
          className={({ isActive }) =>
            `block rounded-lg px-3 py-2 text-sm ${
              isActive ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/60'
            }`
          }
        >
          Projects
        </NavLink>
      </nav>

      <div className="border-t border-slate-800 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 font-semibold text-white">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">{user.name}</p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
          </div>
        </div>
        <button
          onClick={onSignOut}
          className="mt-3 w-full rounded-lg bg-slate-800 py-1.5 text-sm hover:bg-slate-700"
        >
          Logout
        </button>
      </div>
    </aside>
  )
}