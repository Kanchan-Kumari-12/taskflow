import { Navigate, useOutletContext } from 'react-router-dom'

export default function Home() {
  const { workspaces } = useOutletContext()

  if (workspaces.length > 0) {
    return <Navigate to={`/w/${workspaces[0].id}`} replace />
  }

  return (
    <div className="p-8">
      <h2 className="text-xl font-semibold text-slate-800">Welcome to TaskFlow 👋</h2>
      <p className="mt-2 text-slate-500">
        Shuru karne ke liye left sidebar mein <b>+ New workspace</b> se apna pehla
        workspace banao.
      </p>
    </div>
  )
}