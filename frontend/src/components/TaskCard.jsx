import { COLUMNS } from '../constants'

export default function TaskCard({ task, assigneeName, canDelete, onMove, onDelete }) {
  const index = COLUMNS.findIndex((c) => c.key === task.status)
  const prev = COLUMNS[index - 1]
  const next = COLUMNS[index + 1]

  return (
    <div className="rounded-lg bg-white p-3 shadow-sm ring-1 ring-slate-200">
      <p className="text-sm font-medium text-slate-800">{task.title}</p>
      {task.due_date && (
        <p className="mt-1 text-xs text-slate-500">
          Due{' '}
          {new Date(`${task.due_date}T00:00:00`).toLocaleDateString('en-IN', {
            dateStyle: 'medium',
          })}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between">
        {assigneeName ? (
          <span
            title={assigneeName}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white"
          >
            {assigneeName.charAt(0).toUpperCase()}
          </span>
        ) : (
          <span className="text-xs text-slate-400">Unassigned</span>
        )}

        <div className="flex items-center gap-1">
          {prev && (
            <button
              title={`Move to ${prev.label}`}
              onClick={() => onMove(task, prev.key)}
              className="rounded px-2 py-0.5 text-sm text-slate-500 hover:bg-slate-100"
            >
              ←
            </button>
          )}
          {next && (
            <button
              title={`Move to ${next.label}`}
              onClick={() => onMove(task, next.key)}
              className="rounded px-2 py-0.5 text-sm text-slate-500 hover:bg-slate-100"
            >
              →
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => onDelete(task)}
              className="rounded px-2 py-0.5 text-xs text-red-500 hover:bg-red-50"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  )
}