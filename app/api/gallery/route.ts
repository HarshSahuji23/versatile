import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { getAdminSession } from '@/lib/auth'

const DATA_FILE = path.join(process.cwd(), 'data', 'gallery.json')
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads')
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif'])
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

async function readLocalGallery() {
  try {
    const content = await fs.readFile(DATA_FILE, 'utf-8')
    return JSON.parse(content)
  } catch {
    return []
  }
}

async function writeLocalGallery(data: any[]) {
  try {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8')
  } catch (err) {
    console.error('Error writing gallery data:', err)
  }
}

// GET /api/gallery - Public: Website visitors can browse gallery images
export async function GET() {
  try {
    let list = await readLocalGallery()
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('gallery').select('*').order('created_at', { ascending: false })
        if (!error && data && data.length > 0) {
          const localIds = new Set(list.map((i: any) => i.id))
          const nonDup = data.filter((i: any) => !localIds.has(i.id))
          list = [...list, ...nonDup]
        }
      } catch (err) {
        console.warn('Supabase fetch error in API route:', err)
      }
    }
    return NextResponse.json({ success: true, data: list })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

// POST /api/gallery - Protected: Only authenticated administrators can upload photos
export async function POST(req: Request) {
  const session = getAdminSession(req)
  if (!session.valid) {
    return NextResponse.json({ success: false, error: 'Unauthorized: Admin login required.' }, { status: 401 })
  }

  try {
    await fs.mkdir(UPLOADS_DIR, { recursive: true })
    let caption = 'Event Photograph'
    let imageUrl = ''

    const contentType = req.headers.get('content-type') || ''
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      const file = formData.get('file') as File | null
      caption = ((formData.get('caption') as string) || caption).slice(0, 150)

      if (file && file.size > 0) {
        if (file.size > MAX_FILE_SIZE) {
          return NextResponse.json({ success: false, error: 'File exceeds maximum limit of 10MB' }, { status: 400 })
        }

        const ext = path.extname(file.name).toLowerCase() || '.jpg'
        if (!ALLOWED_EXTENSIONS.has(ext)) {
          return NextResponse.json({ success: false, error: 'Invalid file type. Only JPG, PNG, WEBP, and AVIF are allowed.' }, { status: 400 })
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const filename = `gal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${ext}`
        const filePath = path.join(UPLOADS_DIR, filename)
        await fs.writeFile(filePath, buffer)
        imageUrl = `/uploads/${filename}`
      }
    } else {
      const body = await req.json()
      caption = (body.caption || caption).slice(0, 150)
      if (body.image_data && typeof body.image_data === 'string' && body.image_data.startsWith('data:image')) {
        const matches = body.image_data.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/)
        if (matches) {
          const rawExt = matches[1].toLowerCase()
          const ext = rawExt === 'jpeg' ? '.jpg' : `.${rawExt}`
          if (!ALLOWED_EXTENSIONS.has(ext)) {
            return NextResponse.json({ success: false, error: 'Invalid image format' }, { status: 400 })
          }
          const buffer = Buffer.from(matches[2], 'base64')
          if (buffer.length > MAX_FILE_SIZE) {
            return NextResponse.json({ success: false, error: 'Image exceeds maximum limit of 10MB' }, { status: 400 })
          }
          const filename = `gal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${ext}`
          const filePath = path.join(UPLOADS_DIR, filename)
          await fs.writeFile(filePath, buffer)
          imageUrl = `/uploads/${filename}`
        }
      } else if (body.image_url && typeof body.image_url === 'string') {
        imageUrl = body.image_url.slice(0, 500)
      }
    }

    if (!imageUrl) {
      return NextResponse.json({ success: false, error: 'No valid image provided' }, { status: 400 })
    }

    const newRecord = {
      id: 'gal_' + Date.now(),
      image_url: imageUrl,
      caption: caption.trim() || 'Event Photograph',
      created_at: new Date().toISOString()
    }

    const currentList = await readLocalGallery()
    const updatedList = [newRecord, ...currentList]
    await writeLocalGallery(updatedList)

    if (isSupabaseConfigured) {
      try {
        await supabase.from('gallery').insert([{
          image_url: newRecord.image_url,
          caption: newRecord.caption
        }])
      } catch (err) {
        console.warn('Supabase gallery insert error:', err)
      }
    }

    return NextResponse.json({ success: true, data: newRecord })
  } catch (err: any) {
    console.error('Gallery upload error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

// DELETE /api/gallery - Protected: Only authenticated administrators can delete gallery photos
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

    const currentList = await readLocalGallery()
    const itemToDelete = currentList.find((i: any) => i.id === id)

    // Secure path sanitization to prevent path traversal
    if (itemToDelete?.image_url?.startsWith('/uploads/')) {
      const filename = path.basename(itemToDelete.image_url)
      const filePath = path.join(UPLOADS_DIR, filename)
      try {
        await fs.unlink(filePath)
      } catch {
        // file might already be removed
      }
    }

    const updatedList = currentList.filter((i: any) => i.id !== id)
    await writeLocalGallery(updatedList)

    if (isSupabaseConfigured && !id.startsWith('gal_')) {
      try {
        await supabase.from('gallery').delete().eq('id', id)
      } catch (err) {
        console.warn('Supabase delete error:', err)
      }
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
