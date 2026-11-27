const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export const getToken = () => localStorage.getItem('token')
export const setToken = (token) => localStorage.setItem('token', token)
export const clearToken = () => localStorage.removeItem('token')

async function request(path, options = {}) {
  const headers = { ...options.headers }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${API_URL}${path}`, { ...options, headers })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    let message = 'Something went wrong'
    if (typeof body.detail === 'string') message = body.detail
    else if (Array.isArray(body.detail))
      message = body.detail.map((d) => d.msg).join(', ')
    throw new Error(message)
  }
  if (res.status === 204) return null
  return res.json()
}

export function login(email, password) {
  return request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ username: email, password }),
  })
}

export function getMe() {
  return request('/auth/me')
}

export function register(name, email, password) {
  return request('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  })
}