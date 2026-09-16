import { NextResponse, type NextRequest } from 'next/server';

import { updateSession } from '@/libs/supabase/supabase-middleware-client';
import { createSupabaseServerClient } from './libs/supabase/supabase-server-client';

export async function proxy(request: NextRequest) {
  const response = await updateSession(request);

  const path = request.nextUrl.pathname;
  const isAuthRoute = path.startsWith('/login') || path.startsWith('/signup');
  const isProtectedRoute = path.startsWith('/app') || path.startsWith('/portal');

  if (isAuthRoute || isProtectedRoute) {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user && isAuthRoute) {
      return NextResponse.redirect(new URL('/app', request.url));
    }

    if (!user && isProtectedRoute) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};