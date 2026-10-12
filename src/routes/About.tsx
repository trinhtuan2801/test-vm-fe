export default function About() {
  return (
    <section className="space-y-3">
      <h1 className="text-3xl font-bold tracking-tight">About</h1>
      <p className="text-slate-600">
        Routes live in <code className="rounded bg-slate-200 px-1">src/routes</code>{' '}
        and are registered in{' '}
        <code className="rounded bg-slate-200 px-1">src/router.tsx</code>.
      </p>
    </section>
  )
}
