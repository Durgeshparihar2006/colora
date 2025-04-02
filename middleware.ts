import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define public and protected paths
const publicPaths = ['/login', '/signup', '/verify']

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  // Get user from cookies
  const user = request.cookies.get('user')?.value

  // If user is not logged in and trying to access any path except public paths,
  // redirect to login
  if (!user && !publicPaths.includes(path)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If user is logged in and trying to access login/signup pages,
  // redirect to game
  if (user && publicPaths.includes(path)) {
    return NextResponse.redirect(new URL('/game', request.url))
  }

  return NextResponse.next()
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * 1. /api (API routes)
     * 2. /_next (Next.js internals)
     * 3. /static (static files)
     * 4. .*\\..*$ (files with extensions)
     */
    '/((?!api|_next|static|.*\\..*$).*)',
  ],
} 