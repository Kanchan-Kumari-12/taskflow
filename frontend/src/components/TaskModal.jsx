import { useEffect, useState } from 'react'
import { createComment, deleteComment, getComments } from '../api'
import { COLUMNS } from '../constants'

const fieldClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'

export default function TaskModal({
  task,
  members,
  user,
  isAdmin,
  workspaceId,
  projectId,
  onUpdate,
  onClose,
}) {
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description ?? '')
  const [error, setError] = useState('')

  const [comments, setComments] = useState([])
  const [loadingComments, setLoadingComments] = useState(true)
  const [body, setBody] = useState('')
  const [posting, setPosting] = useState(false)

  const nameById = Object.fromEntries(members.map((m) => [m.user_id, m.name]))

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  useEffect(() => {
    let ignore = false
    getComments(workspaceId, projectId, task.id)
      .then((list) => {
        if (!ignore) setComments(list)
      })
      .catch((err) => {
        if (!ignore) setError(err.message)
      })
      .finally(() => {
        if (!ignore) setLoadingComments(false)
      })
    return () => {
      ignore = true
    }
  }, [workspaceId, projectId, task.id])

  async function save(changes) {
    setError('')
    try {
      await onUpdate(task, changes)
    } catch (err) {
      setError(err.message)
    }
  }

  function saveTitle() {
    const next = title.trim()
    if (!next) {
      setTitle(task.title)
      return
    }
    if (next !== task.title) save({ title: next })
  }

  function saveDescription() {
    const next = description.trim()
    if (next !== (task.description ?? '')) save({ description: next || null })
  }

  async function handleComment(e) {
    e.preventDefault()
    setError('')
    setPosting(true)
    try {
      const comment = await createComment(workspaceId, projectId, task.id, body.trim())
      setComments((prev) => [...prev, comment])
      setBody('')
    } catch (err) {
      setError(err.message)
    } finally {
      setPosting(false)
    }
  }

  async function handleDeleteComment(comment) {
    setError('')
    try {
      await deleteComment(workspaceId, projectId, task.id, comment.id)
      setComments((prev) => prev.filter((c) => c.id !== comment.id))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:p-8"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
            maxLength={200}
            className="w-full rounded-lg border border-transparent px-2 py-1 text-xl font-semibold text-slate-800 hover:border-slate-300 focus:border-indigo-500 focus:outline-none"
          />
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg px-2 py-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            ✕
          </button>
        </div>

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Status
            <select
              value={task.status}
              onChange={(e) => save({ status: e.target.value })}
              className={`${fieldClass} mt-1 font-normal normal-case tracking-normal`}
            >
              {COLUMNS.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Assignee
            <select
              value={task.assignee_id ?? ''}
              onChange={(e) => save({ assignee_id: e.target.value || null })}
              className={`${fieldClass} mt-1 font-normal normal-case tracking-normal`}
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.user_id} value={m.user_id}>
                  {m.name}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Due date
            <input
              type="date"
              value={task.due_date ?? ''}
              onChange={(e) => save({ due_date: e.target.value || null })}
              className={`${fieldClass} mt-1 font-normal normal-case tracking-normal`}
            />
          </label>
        </div>

        <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Description
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={saveDescription}
            rows={4}
            maxLength={5000}
            placeholder="Task ke baare mein likho..."
            className={`${fieldClass} mt-1 font-normal normal-case tracking-normal`}
          />
        </label>

        <h3 className="mt-6 text-sm font-semibold text-slate-700">Comments</h3>

        {loadingComments ? (
          <p className="mt-2 text-sm text-slate-400">Loading...</p>
        ) : comments.length === 0 ? (
          <p className="mt-2 text-sm text-slate-400">Abhi koi comment nahi hai.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {comments.map((c) => {
              const author = nameById[c.user_id] ?? 'Unknown'
              return (
                <li key={c.id} className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
                    {author.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1 rounded-lg bg-slate-50 px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-slate-500">
                        <span className="font-medium text-slate-700">{author}</span>
                        {' · '}
                        {new Date(c.created_at).toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </p>
                      {(c.user_id === user.id || isAdmin) && (
                        <button
                          onClick={() => handleDeleteComment(c)}
                          className="text-xs text-red-500 hover:underline"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                    <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-700">
                      {c.body}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        )}

        <form onSubmit={handleComment} className="mt-4 flex gap-2">
          <input
            type="text"
            placeholder="Write a comment..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={2000}
            className={fieldClass}
          />
          <button
            type="submit"
            disabled={posting || !body.trim()}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            Comment
          </button>
        </form>
      </div>
    </div>
  )
}