import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  try {
    const { data: { session } } = await supabase.auth.getSession()

    // Check if the path is a protected route
    const isProtectedRoute = 
      req.nextUrl.pathname.startsWith('/timers') || 
      req.nextUrl.pathname.startsWith('/create-timer') ||
      req.nextUrl.pathname.startsWith('/edit-timer') ||
      req.nextUrl.pathname.startsWith('/dashboard') ||
      req.nextUrl.pathname.startsWith('/profile');

    // Check if the path is an auth page
    const isAuthRoute = 
      req.nextUrl.pathname.startsWith('/login') || 
      req.nextUrl.pathname.startsWith('/register');

    // If the user is not logged in and trying to access protected routes, redirect to login
    if (!session && isProtectedRoute) {
      console.log('Redirecting to login: no session found for protected route', req.nextUrl.pathname);
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/login'
      redirectUrl.searchParams.set('from', req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // If the user is logged in and trying to access auth pages, redirect to dashboard
    if (session && isAuthRoute) {
      console.log('Redirecting to dashboard: session found for auth route', req.nextUrl.pathname);
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/dashboard'
      return NextResponse.redirect(redirectUrl)
    }

    // If the request is for the root path and the user is logged in, redirect to dashboard
    if (session && req.nextUrl.pathname === '/') {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/dashboard'
      return NextResponse.redirect(redirectUrl)
    }
    
    return res
  } catch (error) {
    console.error('Middleware error:', error);
    return res;
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
} 