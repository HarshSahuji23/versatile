import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { getAdminSession } from '@/lib/auth'

const DATA_FILE = path.join(process.cwd(), 'data', 'bookings.json')
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

async function readLocalBookings() {
  try {
    const content = await fs.readFile(DATA_FILE, 'utf-8')
    return JSON.parse(content)
  } catch {
    return []
  }
}

async function writeLocalBookings(data: any[]) {
  try {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8')
  } catch (err) {
    console.error('Error writing bookings data:', err)
  }
}

// GET /api/bookings - Protected: Only authenticated administrators can view client inquiries
export async function GET(req: Request) {
  const session = getAdminSession(req)
  if (!session.valid) {
    return NextResponse.json({ success: false, error: 'Unauthorized: Admin login required to access booking inquiries.' }, { status: 401 })
  }

  try {
    let list = await readLocalBookings()
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('bookings').select('*').order('created_at', { ascending: false })
        if (!error && data && data.length > 0) {
          const localIds = new Set(list.map((i: any) => i.id))
          const nonDup = data.filter((i: any) => !localIds.has(i.id))
          list = [...list, ...nonDup]
        }
      } catch (err) {
        console.warn('Supabase fetch bookings error:', err)
      }
    }
    return NextResponse.json({ success: true, data: list })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

// POST /api/bookings - Public: Website visitors can submit inquiries
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, phone, event_type, event_date, message } = body

    if (!name || !email) {
      return NextResponse.json({ success: false, error: 'Name and email are required.' }, { status: 400 })
    }

    const cleanEmail = String(email).trim().toLowerCase().slice(0, 150)
    if (!EMAIL_REGEX.test(cleanEmail)) {
      return NextResponse.json({ success: false, error: 'Please enter a valid email address.' }, { status: 400 })
    }

    const cleanName = String(name).trim().slice(0, 100)
    const cleanPhone = phone ? String(phone).trim().slice(0, 30) : null
    const cleanEventType = event_type ? String(event_type).trim().slice(0, 80) : null
    const cleanEventDate = event_date ? String(event_date).trim().slice(0, 30) : null
    const cleanMessage = message ? String(message).trim().slice(0, 1500) : null

    const newRecord = {
      id: 'book_' + Date.now(),
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      event_type: cleanEventType,
      event_date: cleanEventDate,
      message: cleanMessage,
      status: 'new',
      created_at: new Date().toISOString()
    }

    const currentList = await readLocalBookings()
    const updatedList = [newRecord, ...currentList]
    await writeLocalBookings(updatedList)

    if (isSupabaseConfigured) {
      try {
        await supabase.from('bookings').insert([{
          name: newRecord.name,
          email: newRecord.email,
          phone: newRecord.phone,
          event_type: newRecord.event_type,
          event_date: newRecord.event_date,
          message: newRecord.message,
          status: 'new'
        }])
      } catch (err) {
        console.warn('Supabase booking insert error:', err)
      }
    }

    return NextResponse.json({ success: true, data: newRecord })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

// PATCH /api/bookings - Protected: Only authenticated administrators can change status
export async function PATCH(req: Request) {
  const session = getAdminSession(req)
  if (!session.valid) {
    return NextResponse.json({ success: false, error: 'Unauthorized: Admin login required.' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { id, status } = body

    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'Missing id or status' }, { status: 400 })
    }

    const allowedStatuses = ['new', 'read', 'responded', 'confirmed', 'completed', 'cancelled']
    const cleanStatus = allowedStatuses.includes(status) ? status : 'new'

    const currentList = await readLocalBookings()
    const updatedList = currentList.map((b: any) => b.id === id ? { ...b, status: cleanStatus } : b)
    await writeLocalBookings(updatedList)

    if (isSupabaseConfigured && !id.startsWith('book_')) {
      try {
        await supabase.from('bookings').update({ status: cleanStatus }).eq('id', id)
      } catch (err) {
        console.warn('Supabase booking update error:', err)
      }
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

// DELETE /api/bookings - Protected: Only authenticated administrators can delete inquiries
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

    const currentList = await readLocalBookings()
    const updatedList = currentList.filter((b: any) => b.id !== id)
    await writeLocalBookings(updatedList)

    if (isSupabaseConfigured && !id.startsWith('book_')) {
      try {
        await supabase.from('bookings').delete().eq('id', id)
      } catch (err) {
        console.warn('Supabase booking delete error:', err)
      }
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
