import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { supabaseAdminClient } from '@/libs/supabase/supabase-admin';
import { createSupabaseServerClient } from '@/libs/supabase/supabase-server-client';
import { getURL } from '@/utils/get-url';

import { ARTIST_SIGNUP_INTENT_COOKIE } from '@/features/auth/constants';

type AuthIntent = 'login' | 'artist-signup';

function getAuthIntent(value: string | null): AuthIntent {
  return value === 'artist-signup' ? 'artist-signup' : 'login';
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);

  const code = requestUrl.searchParams.get('code');

  const intent = getAuthIntent(requestUrl.searchParams.get('intent'));

  if (!code) {
    return NextResponse.redirect(getURL('/login?error=auth-callback'));
  }

  const supabase = await createSupabaseServerClient();

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    console.error('Auth code exchange failed:', exchangeError);

    return NextResponse.redirect(getURL('/login?error=auth-callback'));
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.redirect(getURL('/login?error=auth-callback'));
  }

  /*
   * These are trusted routing lookups.
   *
   * We use the authenticated user's ID,
   * never a user-provided ID.
   *
   * client_identities is intentionally
   * private from normal Data API access,
   * so the server-side admin client is
   * appropriate here.
   */

  const { data: artistMembership, error: artistError } = await supabaseAdminClient
    .from('artists')
    .select('id')
    .eq('auth_user_id', user.id)
    .eq('is_active', true)
    .limit(1)
    .maybeSingle();

  if (artistError) {
    console.error('Artist routing lookup failed:', artistError);

    await supabase.auth.signOut();

    return NextResponse.redirect(getURL('/login?error=auth-routing'));
  }

  /*
   * Existing artists always go to
   * their dashboard, regardless of
   * whether they entered through
   * /login or /signup.
   */
  if (artistMembership) {
    return NextResponse.redirect(getURL('/app'));
  }

  /*
   * Artist signup is explicit.
   *
   * A brand-new identity, or even an
   * existing client who also wants to
   * become an artist, can now enter
   * artist onboarding.
   */
  if (intent === 'artist-signup') {
    const response = NextResponse.redirect(getURL('/onboarding'));

    response.cookies.set({
      name: ARTIST_SIGNUP_INTENT_COOKIE,
      value: '1',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/onboarding',
      maxAge: 60 * 10,
    });

    return response;
  }

  const { data: clientIdentity, error: clientError } = await supabaseAdminClient
    .from('client_identities')
    .select('client_id')
    .eq('auth_user_id', user.id)
    .limit(1)
    .maybeSingle();

  if (clientError) {
    console.error('Client routing lookup failed:', clientError);

    await supabase.auth.signOut();

    return NextResponse.redirect(getURL('/login?error=auth-routing'));
  }

  if (clientIdentity) {
    return NextResponse.redirect(getURL('/portal'));
  }

  /*
   * Someone authenticated through
   * the login flow but has neither
   * artist nor client access.
   *
   * Do NOT turn them into an artist.
   */
  await supabase.auth.signOut();

  return NextResponse.redirect(getURL('/login?error=no-account'));
}
