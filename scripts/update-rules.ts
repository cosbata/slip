import { config } from 'dotenv'
config({ path: '.env.local' })

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '../drizzle/schema'

const client = postgres(process.env.DATABASE_URL!, { prepare: false })
const db = drizzle(client, { schema })

const RULES_EN = [
  '1. No real names of individuals (interviewers, recruiters, partners)||Do not name or identify any interviewer, recruiter, or partner. Initials and pseudonyms are fine.',
  '2. Share experiences, not rumors||Write about what happened to you directly. Speculation or hearsay about hiring decisions at companies is not allowed.',
  '3. Be respectful — rejection is hard for everyone||Criticism of process is welcome. Personal attacks on individuals are not.',
  '4. Mark sensitive content appropriately||If your post contains details that could identify you or others, note it at the top.',
].join('\n')

async function main() {
  const result = await db.update(schema.communities).set({ sidebarRules: RULES_EN })
  console.log('Updated all communities sidebarRules to English')
  await client.end()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
