import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect all /admin sub-routes (e.g. /admin/dashboard, /admin/bookings, etc.)
  // but allow the login page /admin itself
  if (pathname.startsWith('/admin/') && pathname !== '/admin') {
    const sessionCookie = request.cookies.get('admin_session')?.value

    if (!sessionCookie || !sessionCookie.includes('.')) {
      const loginUrl = new URL('/admin', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
