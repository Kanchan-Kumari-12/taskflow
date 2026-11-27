import { useEffect, useState } from 'react'
import { useOutletContext, useParams } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { createProject, getMembers, getProjects } from '../api'

function ProjectsView({ workspaceId }) {
  const { user } = useAuth()
  const { workspaces } = useOutletContext()
  const workspace = workspaces.find((w) => w.id === workspaceId)

  const [projects, setProjects] = useState([])
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let ignore = false
    Promise.all([getProjects(workspaceId), getMembers(workspaceId)])
      .then(([projectList, members]) => {
        if (ignore) return
        setProjects(projectList)
        setRole(members.find((m) => m.user_id === user.id)?.role ?? null)
      })
      .catch((err) => {
        if (!ignore) setError(err.message)
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })
    return () => {
      ignore = true
    }
  }, [workspaceId, user.id])

  async function handleCreate(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const project = await createProject(workspaceId, name.trim(), description.trim())
      setProjects((prev) => [...prev, project])
      setName('')
      setDescription('')
      setShowForm(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const isAdmin = role === 'admin'

  return (
    <div className="mx-auto max-w-5xl p-8">
      <p className="text-sm text-slate-400">{workspace?.name ?? 'Workspace'}</p>
      <div className="mt-1 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-semibold text-slate-800">Projects</h2>
          {role && (
            <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium capitalize text-indigo-700">
              {role}
            </span>
          )}
        </div>
        {isAdmin && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-500"
          >
            + New project
          </button>
        )}
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {showForm && (
        <form onSubmit={handleCreate} className="mt-4 space-y-3 rounded-xl bg-white p-4 shadow-sm">
          <input
            autoFocus
            type="text"
            placeholder="Project name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={2000}
            rows={2}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              Create project
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg px-4 py-2 text-sm text-slate-500 hover:text-slate-800"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="mt-6 text-slate-500">Loading...</p>
      ) : projects.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
          {isAdmin
            ? 'Abhi koi project nahi hai. "+ New project" se pehla bana lo.'
            : 'Abhi koi project nahi hai. Admin ke project banane ka wait karo.'}
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projects.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{p.name}</td>
                  <td className="px-4 py-3 text-slate-500">{p.description ?? '—'}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                    {new Date(p.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function WorkspacePage() {
  const { workspaceId } = useParams()
  return <ProjectsView key={workspaceId} workspaceId={workspaceId} />
}