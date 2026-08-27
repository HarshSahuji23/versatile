import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { getAdminSession } from '@/lib/auth'

const DATA_FILE = path.join(process.cwd(), 'data', 'testimonials.json')

async function readLocalTestimonials() {
  try {
    const content = await fs.readFile(DATA_FILE, 'utf-8')
    return JSON.parse(content)
  } catch {
    return []
  }
}

async function writeLocalTestimonials(data: any[]) {
  try {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8')
  } catch (err) {
    console.error('Error writing testimonials data:', err)
  }
}

// GET /api/testimonials - Public: Website visitors can browse client reviews
export async function GET() {
  try {
    let list = await readLocalTestimonials()
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false })
        if (!error && data && data.length > 0) {
          const localIds = new Set(list.map((i: any) => i.id))
          const nonDup = data.filter((i: any) => !localIds.has(i.id))
          list = [...nonDup, ...list]
        }
      } catch (err) {
        console.warn('Supabase fetch testimonials error:', err)
      }
    }
    return NextResponse.json({ success: true, data: list })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

// POST /api/testimonials - Public: Clients can leave a review
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { client_name, event_type, rating, review } = body

    if (!client_name || !review) {
      return NextResponse.json({ success: false, error: 'Name and review text are required.' }, { status: 400 })
    }

    const cleanName = String(client_name).trim().slice(0, 100)
    const cleanEventType = String(event_type || 'Event').trim().slice(0, 80)
    const cleanRating = Math.min(5, Math.max(1, Number(rating) || 5))
    const cleanReview = String(review).trim().slice(0, 1000)

    const newRecord = {
      id: 'rev_' + Date.now(),
      client_name: cleanName,
      event_type: cleanEventType,
      rating: cleanRating,
      review: cleanReview,
      created_at: new Date().toISOString()
    }

    const currentList = await readLocalTestimonials()
    const updatedList = [newRecord, ...currentList]
    await writeLocalTestimonials(updatedList)

    if (isSupabaseConfigured) {
      try {
        await supabase.from('testimonials').insert([{
          client_name: newRecord.client_name,
          event_type: newRecord.event_type,
          rating: newRecord.rating,
          review: newRecord.review
        }])
      } catch (err) {
        console.warn('Supabase testimonial insert error:', err)
      }
    }

    return NextResponse.json({ success: true, data: newRecord })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

// DELETE /api/testimonials - Protected: Only authenticated administrators can delete reviews
export async function DELETE(req: Request) {
  const session = getAdminSession(req)
  if (!session.valid) {
    return NextResponse.json({ success: false, error: 'Unauthorized: Admin login required.' }, { status: 401 })
  }

  try {
    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing id parameter' }, { status: 400 })
    }

    const currentList = await readLocalTestimonials()
    const updatedList = currentList.filter((i: any) => i.id !== id)
    await writeLocalTestimonials(updatedList)

    if (isSupabaseConfigured && !id.startsWith('rev_')) {
      try {
        await supabase.from('testimonials').delete().eq('id', id)
      } catch (err) {
        console.warn('Supabase delete error:', err)
      }
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
