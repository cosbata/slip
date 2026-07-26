import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL!

// Serverless (Vercel) + Supabase "Transaction" pooler configuration.
//
// The outage cause: the library default holds connections open with no idle
// timeout, so every warm serverless instance hoards its connections. They pile
// up across instances until the pooler's client limit is hit — "FATAL: max
// client connections reached, limit: 200" — which took every page (including
// /login) down with a 500.
//
//   prepare: false      → required for Transaction pool mode (no prepared statements)
//   idle_timeout: 20    → release idle connections instead of holding them open
//                         across invocations (the actual fix for the pile-up)
//   max_lifetime: 1800  → recycle a connection every 30 min as a backstop
//   connect_timeout: 10 → fail fast instead of hanging when the pool is busy
//
// NOTE: do NOT cap `max` to 1 here. `next build` static-generates pages whose
// layout queries the DB concurrently; a single connection serializes them into
// a 60s timeout that fails the build. The default pool size is fine — it is
// idle_timeout, not a low max, that prevents the runtime pile-up.
const globalForDb = globalThis as unknown as {
  __pgClient?: ReturnType<typeof postgres>
}

const client =
  globalForDb.__pgClient ??
  postgres(connectionString, {
    prepare: false,
    idle_timeout: 20,
    max_lifetime: 60 * 30,
    connect_timeout: 10,
  })

// Reuse one pool across hot-reloads in development.
if (process.env.NODE_ENV !== 'production') {
  globalForDb.__pgClient = client
}

export const db = drizzle(client, { schema })
