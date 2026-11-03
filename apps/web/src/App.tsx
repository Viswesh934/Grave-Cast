import { useEffect, useState } from 'react'

interface HealthResponse {
  status: string
  version: string
  timestamp: string
}

type ApiState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'ok'; data: HealthResponse }
  | { kind: 'error'; message: string }

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full mr-2 ${
        ok ? 'bg-green-500' : 'bg-red-500'
      }`}
      aria-hidden="true"
    />
  )
}

export default function App() {
  const [api, setApi] = useState<ApiState>({ kind: 'idle' })

  useEffect(() => {
    setApi({ kind: 'loading' })

    fetch('/health')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<HealthResponse>
      })
      .then((data) => setApi({ kind: 'ok', data }))
      .catch((err: unknown) =>
        setApi({
          kind: 'error',
          message: err instanceof Error ? err.message : String(err),
        })
      )
  }, [])

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-8 px-4">
      {/* Title */}
      <div className="text-center">
        <h1 className="text-5xl font-bold tracking-tight text-stone-100 mb-2">
          ⚰️ Gravecast
        </h1>
        <p className="text-stone-400 text-lg">
          A repository graveyard. Real code problems. Decodable signal.
        </p>
      </div>

      {/* Backend status card */}
      <div className="border border-stone-700 rounded-xl bg-stone-900 px-8 py-6 w-full max-w-sm shadow-lg">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-500 mb-4">
          Backend status
        </h2>

        {api.kind === 'idle' || api.kind === 'loading' ? (
          <p className="text-stone-400 animate-pulse">Checking…</p>
        ) : api.kind === 'error' ? (
          <div>
            <p className="flex items-center text-red-400 font-medium">
              <StatusDot ok={false} />
              Unreachable
            </p>
            <p className="mt-2 text-xs text-stone-500 font-mono break-all">
              {api.message}
            </p>
            <p className="mt-3 text-xs text-stone-600">
              Start the API: <code className="text-stone-400">uvicorn app.main:app --reload</code>
            </p>
          </div>
        ) : (
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-stone-500">Status</dt>
              <dd className="flex items-center text-stone-100 font-medium">
                <StatusDot ok={api.data.status === 'ok'} />
                {api.data.status}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-stone-500">Version</dt>
              <dd className="text-stone-300 font-mono">{api.data.version}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-stone-500">Timestamp</dt>
              <dd className="text-stone-300 font-mono text-xs">
                {new Date(api.data.timestamp).toLocaleTimeString()}
              </dd>
            </div>
          </dl>
        )}
      </div>

      <p className="text-stone-600 text-xs">Phase 0 — scaffold complete</p>
    </main>
  )
}
