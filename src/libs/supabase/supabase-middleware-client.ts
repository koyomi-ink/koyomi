import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

import { getEnvVar } from '@/utils/get-env-var';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    getEnvVar(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      'NEXT_PUBLIC_SUPABASE_URL'
    ),
    getEnvVar(
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      'NEXT_PUBLIC_SUPABASE_ANON_KEY'
    ),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet, headers) {
          // Update the request cookies so downstream server code
          // sees the refreshed session during this request.
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }

          // Recreate the response with the updated request.
          supabaseResponse = NextResponse.next({
            request,
          });

          // Send refreshed cookies back to the browser.
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options);
          }

          // Apply cache-related headers supplied by @supabase/ssr
          // when a session refresh occurs.
          for (const [key, value] of Object.entries(headers)) {
            supabaseResponse.headers.set(key, value);
          }
        },
      },
    }
  );

  // Do not put code between createServerClient() and getClaims().
  // getClaims() verifies the access token and also allows Supabase
  // to refresh the session when necessary.
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  const { pathname } = request.nextUrl;

  const isAuthRoute =
    pathname === '/login' ||
    pathname.startsWith('/login/') ||
    pathname === '/signup' ||
    pathname.startsWith('/signup/');

  const isProtectedRoute =
    pathname === '/app' ||
    pathname.startsWith('/app/') ||
    pathname === '/portal' ||
    pathname.startsWith('/portal/');

  // Authenticated users don't need to visit login/signup.
  if (claims && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/app';

    const redirectResponse = NextResponse.redirect(url);

    // Preserve any cookies refreshed by Supabase.
    for (const cookie of supabaseResponse.cookies.getAll()) {
      redirectResponse.cookies.set(cookie);
    }

    // Preserve the cache-related headers from Supabase.
    for (const header of ['cache-control', 'expires', 'pragma']) {
      const value = supabaseResponse.headers.get(header);

      if (value) {
        redirectResponse.headers.set(header, value);
      }
    }

    return redirectResponse;
  }

  // Unauthenticated users cannot access protected routes.
  if (!claims && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';

    const redirectResponse = NextResponse.redirect(url);

    // Preserve any cookies refreshed by Supabase.
    for (const cookie of supabaseResponse.cookies.getAll()) {
      redirectResponse.cookies.set(cookie);
    }

    // Preserve the cache-related headers from Supabase.
    for (const header of ['cache-control', 'expires', 'pragma']) {
      const value = supabaseResponse.headers.get(header);

      if (value) {
        redirectResponse.headers.set(header, value);
      }
    }

    return redirectResponse;
  }

  return supabaseResponse;
}