import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import {
  hashPassword,
  verifyPassword,
  createSessionToken,
  setSessionCookie,
  clearSessionCookie,
  getAdminSession
} from '@/lib/auth'

const ADMIN_FILE = path.join(process.cwd(), 'data', 'admin.json')

async function getAdminData() {
  try {
    const content = await fs.readFile(ADMIN_FILE, 'utf-8')
    return JSON.parse(content)
  } catch {
    const defaultData = {
      email: 'admin@varshasversatile.com',
      password: hashPassword('admin'),
      recovery_code: 'VARSHA2026',
      updated_at: new Date().toISOString()
    }
    await fs.mkdir(path.dirname(ADMIN_FILE), { recursive: true })
    await fs.writeFile(ADMIN_FILE, JSON.stringify(defaultData, null, 2), 'utf-8')
    return defaultData
  }
}

async function saveAdminData(data: any) {
  await fs.mkdir(path.dirname(ADMIN_FILE), { recursive: true })
  await fs.writeFile(ADMIN_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

export async function GET(req: Request) {
  const session = getAdminSession(req)
  const admin = await getAdminData()
  return NextResponse.json({
    success: true,
    authenticated: session.valid,
    email: session.valid ? (session.email || admin.email) : undefined,
    configured: isSupabaseConfigured
  })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action, email, password, currentPassword, newEmail, newPassword, recoveryCode, newRecoveryCode } = body

    // 0. LOGOUT ACTION
    if (action === 'logout') {
      const response = NextResponse.json({ success: true, message: 'Logged out successfully.' })
      clearSessionCookie(response)
      return response
    }

    const admin = await getAdminData()
    const registeredEmail = (admin.email || 'admin@varshasversatile.com').toLowerCase()
    const validEmails = [registeredEmail, 'varsha@varshasversatile.com', 'admin@varshasversatile.com']

    // 1. LOGIN ACTION
    if (action === 'login') {
      if (!email || !password) {
        return NextResponse.json({ success: false, error: 'Please provide both email and password.' }, { status: 400 })
      }

      // Check with Supabase if configured
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password })
          if (!error && data.user) {
            const token = createSessionToken(data.user.email || email)
            const response = NextResponse.json({
              success: true,
              user: { email: data.user.email },
              token
            })
            setSessionCookie(response, token)
            return response
          }
        } catch (e) {
          console.warn('Supabase signin attempt fallback:', e)
        }
      }

      // Local credential verification with cryptographic hashing support
      const normalizedEmail = email.trim().toLowerCase()
      const isEmailValid = validEmails.includes(normalizedEmail)
      const isPasswordValid = verifyPassword(password, admin.password)

      if (isEmailValid && isPasswordValid) {
        // If password was stored in plaintext, automatically upgrade to salted scrypt hash
        if (!admin.password.startsWith('scrypt$')) {
          admin.password = hashPassword(password)
          admin.updated_at = new Date().toISOString()
          await saveAdminData(admin).catch(() => {})
        }

        const token = createSessionToken(admin.email)
        const response = NextResponse.json({
          success: true,
          user: { email: admin.email },
          token
        })
        setSessionCookie(response, token)
        return response
      }

      return NextResponse.json({ success: false, error: 'Invalid email or password. Please check your credentials.' }, { status: 401 })
    }

    // 2. FORGOT PASSWORD / VERIFY RECOVERY KEY
    if (action === 'forgot_verify') {
      if (!email || !recoveryCode) {
        return NextResponse.json({ success: false, error: 'Please enter both your registered Email and Master Recovery Key.' }, { status: 400 })
      }

      const normalizedEmail = email.trim().toLowerCase()
      if (!validEmails.includes(normalizedEmail)) {
        return NextResponse.json({ success: false, error: 'No admin account found with that email address.' }, { status: 404 })
      }

      const masterKey = (admin.recovery_code || 'VARSHA2026').trim().toUpperCase()
      const providedKey = recoveryCode.trim().toUpperCase()

      if (providedKey !== masterKey) {
        return NextResponse.json({ success: false, error: 'Invalid Master Recovery Key. Only the authorized administrator can reset credentials.' }, { status: 403 })
      }

      return NextResponse.json({
        success: true,
        message: 'Security verification passed. You may now set your new password.'
      })
    }

    // 3. RESET PASSWORD (OUTSIDE LOGIN WITH VERIFIED MASTER KEY)
    if (action === 'reset') {
      if (!email || !newPassword || !recoveryCode) {
        return NextResponse.json({ success: false, error: 'Missing required security verification fields.' }, { status: 400 })
      }

      const normalizedEmail = email.trim().toLowerCase()
      if (!validEmails.includes(normalizedEmail)) {
        return NextResponse.json({ success: false, error: 'No admin account found with that email address.' }, { status: 404 })
      }

      const masterKey = (admin.recovery_code || 'VARSHA2026').trim().toUpperCase()
      const providedKey = recoveryCode.trim().toUpperCase()

      if (providedKey !== masterKey) {
        return NextResponse.json({ success: false, error: 'Unauthorized: Incorrect Master Recovery Key.' }, { status: 403 })
      }

      admin.password = hashPassword(newPassword.trim())
      admin.updated_at = new Date().toISOString()
      await saveAdminData(admin)

      return NextResponse.json({
        success: true,
        message: 'Password updated successfully! You can now sign in with your new password.'
      })
    }

    // 4. UPDATE ADMIN EMAIL (FROM SETTINGS PANEL)
    if (action === 'update_email') {
      const session = getAdminSession(req)
      if (!currentPassword || !newEmail) {
        return NextResponse.json({ success: false, error: 'Please provide current password and new email.' }, { status: 400 })
      }

      if (!session.valid && !verifyPassword(currentPassword, admin.password)) {
        return NextResponse.json({ success: false, error: 'Incorrect current password. Verification failed.' }, { status: 401 })
      }

      admin.email = newEmail.trim().toLowerCase()
      admin.updated_at = new Date().toISOString()
      await saveAdminData(admin)

      const token = createSessionToken(admin.email)
      const response = NextResponse.json({
        success: true,
        message: 'Admin email updated successfully!',
        email: admin.email
      })
      setSessionCookie(response, token)
      return response
    }

    // 5. UPDATE ADMIN PASSWORD (FROM SETTINGS PANEL)
    if (action === 'update_password') {
      if (!currentPassword || !newPassword) {
        return NextResponse.json({ success: false, error: 'Please provide current password and new password.' }, { status: 400 })
      }

      if (!verifyPassword(currentPassword, admin.password)) {
        return NextResponse.json({ success: false, error: 'Incorrect current password. Verification failed.' }, { status: 401 })
      }

      admin.password = hashPassword(newPassword.trim())
      admin.updated_at = new Date().toISOString()
      await saveAdminData(admin)

      return NextResponse.json({
        success: true,
        message: 'Admin password updated successfully!'
      })
    }

    // 6. UPDATE MASTER RECOVERY KEY (FROM SETTINGS PANEL)
    if (action === 'update_recovery_code') {
      if (!currentPassword || !newRecoveryCode) {
        return NextResponse.json({ success: false, error: 'Please provide current password and new recovery key.' }, { status: 400 })
      }

      if (!verifyPassword(currentPassword, admin.password)) {
        return NextResponse.json({ success: false, error: 'Incorrect current password. Verification failed.' }, { status: 401 })
      }

      admin.recovery_code = newRecoveryCode.trim().toUpperCase()
      admin.updated_at = new Date().toISOString()
      await saveAdminData(admin)

      return NextResponse.json({
        success: true,
        message: 'Master Security Recovery Key updated successfully!'
      })
    }

    return NextResponse.json({ success: false, error: 'Invalid action requested.' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
