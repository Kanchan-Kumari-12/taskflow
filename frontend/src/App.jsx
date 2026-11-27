// import { useEffect, useState } from 'react'
// import { clearToken, getMe, getToken, login, setToken } from './api'

// function App() {
//   const [user, setUser] = useState(null)
//   const [loading, setLoading] = useState(Boolean(getToken()))
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [error, setError] = useState('')

//   useEffect(() => {
//     if (!getToken()) return
//     getMe()
//       .then(setUser)
//       .catch(() => clearToken())
//       .finally(() => setLoading(false))
//   }, [])

//   async function handleSubmit(e) {
//     e.preventDefault()
//     setError('')
//     try {
//       const data = await login(email, password)
//       setToken(data.access_token)
//       setUser(await getMe())
//     } catch (err) {
//       setError(err.message)
//     }
//   }

//   function handleLogout() {
//     clearToken()
//     setUser(null)
//     setPassword('')
//   }

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-500">
//         Loading...
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
//       <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm">
//         <h1 className="text-3xl font-bold text-indigo-600 text-center">TaskFlow</h1>

//         {user ? (
//           <div className="mt-6 text-center">
//             <p className="text-slate-700">
//               Welcome, <span className="font-semibold">{user.name}</span> 👋
//             </p>
//             <p className="text-sm text-slate-500">{user.email}</p>
//             <button
//               onClick={handleLogout}
//               className="mt-6 w-full rounded-lg bg-slate-800 py-2 text-white hover:bg-slate-700"
//             >
//               Logout
//             </button>
//           </div>
//         ) : (
//           <form onSubmit={handleSubmit} className="mt-6 space-y-4">
//             <input
//               type="email"
//               placeholder="Email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//               className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//             />
//             <input
//               type="password"
//               placeholder="Password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//               className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//             />
//             {error && <p className="text-sm text-red-600">{error}</p>}
//             <button
//               type="submit"
//               className="w-full rounded-lg bg-indigo-600 py-2 text-white hover:bg-indigo-500"
//             >
//               Login
//             </button>
//           </form>
//         )}
//       </div>
//     </div>
//   )
// }

// export default App



import { Navigate, Route, Routes } from 'react-router-dom'
import { GuestRoute, ProtectedRoute } from './RouteGuards'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Register from './pages/Register'

function App() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Dashboard />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App