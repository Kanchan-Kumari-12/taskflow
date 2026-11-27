import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from '../AuthLayout'
import { useAuth } from '../AuthContext'

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500'

export default function Register() {
  const { signUp } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      await signUp(name, email, password)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <AuthLayout title="Create your account">
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={100}
          className={inputClass}
        />
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
          placeholder="Password (min 8 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          className={inputClass}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-lg bg-indigo-600 py-2 text-white hover:bg-indigo-500"
        >
          Register
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-500">
        Pehle se account hai?{' '}
        <Link to="/login" className="text-indigo-600 hover:underline">
          Login karo
        </Link>
      </p>
    </AuthLayout>
  )
}