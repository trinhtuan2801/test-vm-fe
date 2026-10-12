import { Outlet } from 'react-router'
import Navbar from './components/Navbar.tsx'

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <Outlet />
      </main>
    </div>
  )
}
