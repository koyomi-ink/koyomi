import { type NextRequest } from 'next/server';

import { updateSession } from '@/libs/supabase/supabase-middleware-client';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};


/*
for the subdomains in the future (app.koyomi.ink, swallowstudio.koyomi.ink)

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const url = request.nextUrl;

  // 1. If visiting the artist/owner app domain
  if (hostname === 'app.koyomi.ink') {
    return NextResponse.rewrite(new URL(`/app${url.pathname}`, request.url));
  }

  // 2. If visiting a client digital hub domain (e.g. swallowstudio.koyomi.ink)
  const currentHost = hostname.replace('.koyomi.ink', '');
  if (currentHost && currentHost !== 'koyomi') {
    return NextResponse.rewrite(new URL(`/${currentHost}${url.pathname}`, request.url));
  }

  // 3. Otherwise, let marketing pages load normally
  return await updateSession(request);
}

*/