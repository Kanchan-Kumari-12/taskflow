import { useEffect, useState } from 'react'
import { Outlet, useMatch } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { createWorkspace, getWorkspaces } from '../api'
import Sidebar from '../components/Sidebar'

export default function AppLayout() {
  const { user, signOut } = useAuth()
  const match = useMatch('/w/:workspaceId/*')
  const currentId = match?.params.workspaceId

  const [workspaces, setWorkspaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getWorkspaces()
      .then(setWorkspaces)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleCreateWorkspace(name) {
    const ws = await createWorkspace(name)
    setWorkspaces((prev) => [...prev, ws])
    return ws
  }

  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar
        workspaces={workspaces}
        currentId={currentId}
        onCreateWorkspace={handleCreateWorkspace}
        user={user}
        onSignOut={signOut}
      />
      <main className="flex-1 overflow-y-auto">
        {loading ? (
          <p className="p-8 text-slate-500">Loading...</p>
        ) : error ? (
          <p className="p-8 text-red-600">{error}</p>
        ) : (
          <Outlet context={{ workspaces }} />
        )}
      </main>
    </div>
  )
}