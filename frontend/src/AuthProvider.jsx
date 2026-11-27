import { useEffect, useState } from 'react'
import { AuthContext } from './AuthContext'
import { clearToken, getMe, getToken, login, register, setToken } from './api'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(Boolean(getToken()))

  useEffect(() => {
    if (!getToken()) return
    getMe()
      .then(setUser)
      .catch(() => clearToken())
      .finally(() => setLoading(false))
  }, [])

  async function signIn(email, password) {
    const data = await login(email, password)
    setToken(data.access_token)
    setUser(await getMe())
  }

  async function signUp(name, email, password) {
    await register(name, email, password)
    await signIn(email, password)
  }

  function signOut() {
    clearToken()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}