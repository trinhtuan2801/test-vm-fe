import { Link } from 'react-router'

export default function NotFound() {
  return (
    <section className="space-y-3">
      <h1 className="text-3xl font-bold tracking-tight">404</h1>
      <p className="text-slate-600">That page does not exist.</p>
      <Link to="/" className="inline-block text-blue-600 hover:underline">
        Back home
      </Link>
    </section>
  )
}
