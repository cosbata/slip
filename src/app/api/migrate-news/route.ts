import { NextResponse } from 'next/server'
import { db } from '../../../../drizzle'
import { sql } from 'drizzle-orm'

export async function GET() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "news_items" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "hn_id" text UNIQUE NOT NULL,
        "title" text NOT NULL,
        "url" text,
        "domain" text,
        "tag" text NOT NULL,
        "points" integer DEFAULT 0,
        "num_comments" integer DEFAULT 0,
        "hn_created_at" timestamp NOT NULL,
        "fetched_at" timestamp DEFAULT now() NOT NULL
      )
    `)
    return NextResponse.json({ ok: true, message: 'news_items table created' })
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
