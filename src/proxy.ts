import { type NextRequest, NextResponse } from 'next/server';

import { updateSession } from '@/libs/supabase/supabase-middleware-client';

const PRELAUNCH_MODE = process.env.PRELAUNCH_MODE === 'true';

const PRELAUNCH_ALLOWED_ROUTES = new Set(['/', '/robots.txt', '/sitemap.xml']);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PRELAUNCH_MODE && !PRELAUNCH_ALLOWED_ROUTES.has(pathname) && !pathname.startsWith('/api/webhooks/')) {
    const url = request.nextUrl.clone();

    url.pathname = '/';
    url.search = '';

    return NextResponse.redirect(url);
  }

  return updateSession(request);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
