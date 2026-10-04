import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

import { getEnvVar } from '@/utils/get-env-var';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    getEnvVar(process.env.NEXT_PUBLIC_SUPABASE_URL, 'NEXT_PUBLIC_SUPABASE_URL'),
    getEnvVar(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, 'NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet, headers) {
          /*
           * Update the request cookies so
           * downstream Server Components see
           * the refreshed session immediately.
           */
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }

          supabaseResponse = NextResponse.next({
            request,
          });

          /*
           * Send refreshed cookies back to
           * the browser.
           */
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options);
          }

          /*
           * Preserve cache-related headers
           * supplied by @supabase/ssr.
           */
          for (const [key, value] of Object.entries(headers)) {
            supabaseResponse.headers.set(key, value);
          }
        },
      },
    },
  );

  /*
   * Keep getClaims() immediately after
   * createServerClient().
   *
   * It verifies the access token and lets
   * Supabase refresh the session if needed.
   */
  const { data } = await supabase.auth.getClaims();

  const claims = data?.claims;

  const { pathname } = request.nextUrl;

  const isProtectedRoute =
    pathname === '/app' ||
    pathname.startsWith('/app/') ||
    pathname === '/portal' ||
    pathname.startsWith('/portal/') ||
    pathname === '/onboarding' ||
    pathname.startsWith('/onboarding/');

  /*
   * Anonymous users cannot enter authenticated
   * application surfaces.
   *
   * Authentication alone does NOT determine
   * whether someone is an artist or client.
   * Authorization for /app and /portal happens
   * further inside those server-side surfaces.
   */
  if (!claims && isProtectedRoute) {
    const url = request.nextUrl.clone();

    url.pathname = '/login';

    const redirectResponse = NextResponse.redirect(url);

    /*
     * Preserve any cookies refreshed by
     * Supabase.
     */
    for (const cookie of supabaseResponse.cookies.getAll()) {
      redirectResponse.cookies.set(cookie);
    }

    /*
     * Preserve cache-related headers.
     */
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
