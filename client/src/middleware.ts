import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Edge Middleware for Server-Side Route Protection
 * Prevents Flash of Unauthenticated Content (FOUC) and unauthorized page visits.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get('seva_session')?.value;

  // 1. Protected Admin Route Guard
  if (pathname.startsWith('/admin')) {
    if (!sessionToken) {
      const cmsLoginUrl = new URL('/cms', request.url);
      cmsLoginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(cmsLoginUrl);
    }
  }

  // 2. Protected Field Volunteer Route Guard
  if (pathname.startsWith('/volunteer')) {
    if (!sessionToken) {
      const cmsLoginUrl = new URL('/cms', request.url);
      cmsLoginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(cmsLoginUrl);
    }
  }

  // 3. Protected Donor Hub Route Guard
  if (pathname === '/donor' || pathname.startsWith('/donor/')) {
    if (!sessionToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/volunteer/:path*', '/donor/:path*']
};

