export default function AuthLayout({ title, children }) {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm">
        <h1 className="text-3xl font-bold text-indigo-600 text-center">TaskFlow</h1>
        <p className="mt-1 text-center text-slate-500">{title}</p>
        {children}
      </div>
    </div>
  )
}