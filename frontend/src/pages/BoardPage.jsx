import { useEffect, useState } from 'react'
import { Link, useOutletContext, useParams } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import {
  createTask,
  deleteTask,
  getMembers,
  getProject,
  getTasks,
  updateTask,
} from '../api'
import TaskCard from '../components/TaskCard'
import { COLUMNS } from '../constants'

function BoardView({ workspaceId, projectId }) {
  const { user } = useAuth()
  const { workspaces } = useOutletContext()
  const workspace = workspaces.find((w) => w.id === workspaceId)

  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [title, setTitle] = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    let ignore = false
    Promise.all([
      getProject(workspaceId, projectId),
      getTasks(workspaceId, projectId),
      getMembers(workspaceId),
    ])
      .then(([projectData, taskList, memberList]) => {
        if (ignore) return
        setProject(projectData)
        setTasks(taskList)
        setMembers(memberList)
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
  }, [workspaceId, projectId])

  const isAdmin = members.find((m) => m.user_id === user.id)?.role === 'admin'
  const nameById = Object.fromEntries(members.map((m) => [m.user_id, m.name]))

  async function handleAdd(e) {
    e.preventDefault()
    setError('')
    setAdding(true)
    try {
      const task = await createTask(workspaceId, projectId, title.trim())
      setTasks((prev) => [...prev, task])
      setTitle('')
    } catch (err) {
      setError(err.message)
    } finally {
      setAdding(false)
    }
  }

  async function handleMove(task, status) {
    setError('')
    const previous = tasks
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status } : t)))
    try {
      await updateTask(workspaceId, projectId, task.id, { status })
    } catch (err) {
      setTasks(previous)
      setError(err.message)
    }
  }

  async function handleDelete(task) {
    if (!window.confirm(`"${task.title}" Are You Sure you want to Delete this?`)) return
    setError('')
    try {
      await deleteTask(workspaceId, projectId, task.id)
      setTasks((prev) => prev.filter((t) => t.id !== task.id))
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return <p className="p-8 text-slate-500">Loading...</p>

  if (!project) {
    return (
      <div className="p-8">
        <p className="text-red-600">{error || 'Project not found'}</p>
        <Link to={`/w/${workspaceId}`} className="mt-2 inline-block text-sm text-indigo-600 hover:underline">
          ← Back to projects
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl p-8">
      <Link to={`/w/${workspaceId}`} className="text-sm text-slate-400 hover:text-indigo-600">
        ← {workspace?.name ?? 'Projects'}
      </Link>
      <h2 className="mt-1 text-2xl font-semibold text-slate-800">{project.name}</h2>
      {project.description && (
        <p className="mt-1 text-sm text-slate-500">{project.description}</p>
      )}

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {COLUMNS.map((col) => {
          const columnTasks = tasks.filter((t) => t.status === col.key)
          return (
            <section key={col.key} className="rounded-xl bg-slate-200/60 p-3">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-600">
                {col.label}
                <span className="rounded-full bg-slate-300 px-2 text-xs text-slate-700">
                  {columnTasks.length}
                </span>
              </h3>

              <div className="space-y-2">
                {columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    assigneeName={nameById[task.assignee_id]}
                    canDelete={isAdmin}
                    onMove={handleMove}
                    onDelete={handleDelete}
                  />
                ))}
                {columnTasks.length === 0 && (
                  <p className="py-4 text-center text-xs text-slate-400">No tasks</p>
                )}
              </div>

              {col.key === 'todo' && (
                <form onSubmit={handleAdd} className="mt-3 flex gap-2">
                  <input
                    type="text"
                    placeholder="+ Add a task"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={200}
                    className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={adding || !title.trim()}
                    className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-500 disabled:opacity-50"
                  >
                    Add
                  </button>
                </form>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}

export default function BoardPage() {
  const { workspaceId, projectId } = useParams()
  return <BoardView key={projectId} workspaceId={workspaceId} projectId={projectId} />
}