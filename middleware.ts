import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  const { data: { session } } = await supabase.auth.getSession()

  // If the user is not logged in and trying to access protected routes, redirect to login
  if (!session && (
    req.nextUrl.pathname.startsWith('/timers') || 
    req.nextUrl.pathname.startsWith('/create-timer')
  )) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/login'
    return NextResponse.redirect(redirectUrl)
  }

  // If the user is logged in and trying to access auth pages, redirect to dashboard
  if (session && (
    req.nextUrl.pathname.startsWith('/login') || 
    req.nextUrl.pathname.startsWith('/register')
  )) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/timers'
    return NextResponse.redirect(redirectUrl)
  }
  
  return res
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
} 