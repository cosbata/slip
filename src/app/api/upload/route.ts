import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const BUCKET = 'post-media'

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const formData = await req.formData()
  const file = formData.get('image') as File | null  // EditorJS sends 'image'
  if (!file) return NextResponse.json({ success: 0, error: 'No file' }, { status: 400 })

  const ext = file.name.split('.').pop() ?? 'bin'
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const arrayBuffer = await file.arrayBuffer()
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, arrayBuffer, { contentType: file.type, upsert: false })

  if (error) {
    // 버킷이 없으면 생성 후 재시도
    if (error.message?.includes('not found') || error.message?.includes('does not exist')) {
      await supabase.storage.createBucket(BUCKET, { public: true })
      const { error: e2 } = await supabase.storage
        .from(BUCKET)
        .upload(path, arrayBuffer, { contentType: file.type })
      if (e2) return NextResponse.json({ success: 0, error: e2.message }, { status: 500 })
    } else {
      return NextResponse.json({ success: 0, error: error.message }, { status: 500 })
    }
  }

  const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path)
  // EditorJS image plugin expects: { success: 1, file: { url } }
  return NextResponse.json({ success: 1, file: { url: publicUrl } })
}
