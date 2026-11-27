import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from '../AuthLayout'
import { useAuth } from '../AuthContext'

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500'

export default function Login() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      await signIn(email, password)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <AuthLayout title="Login to your account">
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={inputClass}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className={inputClass}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-lg bg-indigo-600 py-2 text-white hover:bg-indigo-500"
        >
          Login
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-500">
        New User?{' '}
        <Link to="/register" className="text-indigo-600 hover:underline">
          Register Here
        </Link>
      </p>
    </AuthLayout>
  )
}