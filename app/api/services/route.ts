import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { getAdminSession } from '@/lib/auth'

const DATA_FILE = path.join(process.cwd(), 'data', 'services.json')

async function readLocalServices() {
  try {
    const content = await fs.readFile(DATA_FILE, 'utf-8')
    return JSON.parse(content)
  } catch {
    return []
  }
}

async function writeLocalServices(data: any[]) {
  try {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8')
  } catch (err) {
    console.error('Error writing services data:', err)
  }
}

// GET /api/services - Public: Website visitors can browse services
export async function GET() {
  try {
    let list = await readLocalServices()
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('services').select('*').order('order_index')
        if (!error && data && data.length > 0) {
          const localIds = new Set(list.map((i: any) => i.id))
          const nonDup = data.filter((i: any) => !localIds.has(i.id))
          list = [...list, ...nonDup]
        }
      } catch (err) {
        console.warn('Supabase fetch services error:', err)
      }
    }
    return NextResponse.json({ success: true, data: list })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

// POST /api/services - Protected: Only authenticated administrators can add services
export async function POST(req: Request) {
  const session = getAdminSession(req)
  if (!session.valid) {
    return NextResponse.json({ success: false, error: 'Unauthorized: Admin login required.' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { title, description, icon, order_index } = body

    if (!title) {
      return NextResponse.json({ success: false, error: 'Missing title' }, { status: 400 })
    }

    const newRecord = {
      id: 'srv_' + Date.now(),
      title: String(title).trim().slice(0, 100),
      description: String(description || '').trim().slice(0, 1000),
      icon: String(icon || '✨').slice(0, 50),
      order_index: Number(order_index) || 0,
      created_at: new Date().toISOString()
    }

    const currentList = await readLocalServices()
    const updatedList = [...currentList, newRecord]
    await writeLocalServices(updatedList)

    if (isSupabaseConfigured) {
      try {
        await supabase.from('services').insert([{
          title: newRecord.title,
          description: newRecord.description,
          icon: newRecord.icon,
          order_index: newRecord.order_index
        }])
      } catch (err) {
        console.warn('Supabase services insert error:', err)
      }
    }

    return NextResponse.json({ success: true, data: newRecord })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

// PUT /api/services - Protected: Only authenticated administrators can update services
export async function PUT(req: Request) {
  const session = getAdminSession(req)
  if (!session.valid) {
    return NextResponse.json({ success: false, error: 'Unauthorized: Admin login required.' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { id, title, description, icon, order_index } = body

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 })
    }

    const currentList = await readLocalServices()
    const updatedList = currentList.map((s: any) =>
      s.id === id ? {
        ...s,
        title: title !== undefined ? String(title).trim().slice(0, 100) : s.title,
        description: description !== undefined ? String(description).trim().slice(0, 1000) : s.description,
        icon: icon !== undefined ? String(icon).slice(0, 50) : s.icon,
        order_index: order_index !== undefined ? Number(order_index) || 0 : s.order_index
      } : s
    )
    await writeLocalServices(updatedList)

    if (isSupabaseConfigured && !id.startsWith('srv_') && isNaN(Number(id))) {
      try {
        await supabase.from('services').update({ title, description, icon, order_index }).eq('id', id)
      } catch (err) {
        console.warn('Supabase update service error:', err)
      }
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

// DELETE /api/services - Protected: Only authenticated administrators can delete services
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

    const currentList = await readLocalServices()
    const updatedList = currentList.filter((i: any) => i.id !== id)
    await writeLocalServices(updatedList)

    if (isSupabaseConfigured && !id.startsWith('srv_') && isNaN(Number(id))) {
      try {
        await supabase.from('services').delete().eq('id', id)
      } catch (err) {
        console.warn('Supabase delete error:', err)
      }
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
