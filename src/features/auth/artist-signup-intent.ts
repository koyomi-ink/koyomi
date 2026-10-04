import 'server-only';

import { cookies } from 'next/headers';

import { ARTIST_SIGNUP_INTENT_COOKIE } from '@/features/auth/constants';

export async function hasArtistSignupIntent() {
  const cookieStore = await cookies();

  return cookieStore.get(ARTIST_SIGNUP_INTENT_COOKIE)?.value === '1';
}

export async function clearArtistSignupIntent() {
  const cookieStore = await cookies();

  cookieStore.set({
    name: ARTIST_SIGNUP_INTENT_COOKIE,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/onboarding',
    maxAge: 0,
  });
}
