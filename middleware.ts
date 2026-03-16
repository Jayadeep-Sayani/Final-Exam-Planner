import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const COOKIE_NAME = 'locked_session'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const token = request.cookies.get(COOKIE_NAME)?.value
  const loggedIn = !!token && token.length > 0

  if (loggedIn && (pathname === '/' || pathname === '/login')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (!loggedIn && (pathname === '/dashboard' || pathname.startsWith('/dashboard/'))) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/login', '/dashboard', '/dashboard/:path*'],
}
