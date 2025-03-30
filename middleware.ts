import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    const pathname = req.nextUrl.pathname

    // Debug info
    console.log(`Middleware running for path: ${pathname}, Session exists: ${!!session}`)

    // Check if the path is a protected route
    const isProtectedRoute = 
      pathname.startsWith('/timers') || 
      pathname.startsWith('/create-timer') ||
      pathname.startsWith('/edit-timer') ||
      pathname.startsWith('/dashboard') ||
      pathname.startsWith('/profile');

    // Check if the path is an auth page
    const isAuthRoute = 
      pathname.startsWith('/login') || 
      pathname.startsWith('/register');

    // If there's a "from" parameter, save it for now
    const fromParam = req.nextUrl.searchParams.get('from')
    
    // If the user is not logged in and trying to access protected routes, redirect to login
    if (!session && isProtectedRoute) {
      console.log('Redirecting to login: no session found for protected route', pathname);
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/login'
      redirectUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // If the user is logged in and trying to access auth pages, redirect to dashboard
    if (session && isAuthRoute) {
      console.log('Redirecting to dashboard: session found for auth route', pathname);
      
      // If there was a "from" parameter in the URL, and it's a valid protected route, redirect there
      if (fromParam) {
        const isValidRedirect = 
          fromParam.startsWith('/dashboard') || 
          fromParam.startsWith('/timers') || 
          fromParam.startsWith('/create-timer') || 
          fromParam.startsWith('/edit-timer') || 
          fromParam.startsWith('/profile');
          
        if (isValidRedirect) {
          console.log(`Redirecting to original destination: ${fromParam}`);
          const redirectUrl = req.nextUrl.clone()
          redirectUrl.pathname = fromParam
          redirectUrl.search = ''
          return NextResponse.redirect(redirectUrl)
        }
      }
      
      // Otherwise, go to dashboard
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/dashboard'
      return NextResponse.redirect(redirectUrl)
    }

    // If the request is for the root path and the user is logged in, redirect to dashboard
    if (session && pathname === '/') {
      console.log('Redirecting root path to dashboard for logged in user');
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/dashboard'
      return NextResponse.redirect(redirectUrl)
    }
    
    return res
  } catch (error) {
    console.error('Middleware error:', error);
    // In case of error, let the request through rather than blocking navigation
    return res;
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
} 