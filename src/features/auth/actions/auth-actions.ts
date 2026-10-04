'use server';

import { redirect } from 'next/navigation';

import { createSupabaseServerClient } from '@/libs/supabase/supabase-server-client';
import type { ActionResponse } from '@/types/action-response';
import { getURL } from '@/utils/get-url';

import { sendLoginHelpEmail } from '@/features/auth/emails/send-login-help-email';

type AuthIntent = 'login' | 'artist-signup';

function getCallbackUrl(intent: AuthIntent) {
  return getURL(`/auth/callback?intent=${intent}`);
}

async function startOAuth(provider: 'google', intent: AuthIntent): Promise<ActionResponse> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: getCallbackUrl(intent),
    },
  });

  if (error) {
    console.error('OAuth authentication failed:', error);

    return {
      data: null,
      error: 'Could not continue with Google. Please try again.',
    };
  }

  redirect(data.url);
}

async function startEmailAuth(email: string, intent: AuthIntent): Promise<ActionResponse> {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: getCallbackUrl(intent),

      /*
       * Login must never silently create
       * a new Koyomi identity.
       *
       * Artist signup is explicitly allowed
       * to create one.
       */
      shouldCreateUser: intent === 'artist-signup',
    },
  });

  if (error) {
    console.error('Email authentication failed:', error);

    return {
      data: null,
      error: 'Could not send the email. Please try again.',
    };
  }

  return {
    data: null,
    error: null,
  };
}

export async function signInWithOAuth(provider: 'google'): Promise<ActionResponse> {
  return startOAuth(provider, 'login');
}

export async function signInWithEmail(email: string): Promise<ActionResponse> {
  const normalizedEmail = email.trim().toLowerCase();

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signInWithOtp({
    email: normalizedEmail,
    options: {
      emailRedirectTo: getCallbackUrl('login'),

      shouldCreateUser: false,
    },
  });

  if (!error) {
    return {
      data: null,
      error: null,
    };
  }

  /*
   * With shouldCreateUser: false,
   * Supabase returns otp_disabled when it
   * cannot provision/sign in this address.
   *
   * Don't expose that distinction to the
   * browser.
   */
  if (error.code === 'otp_disabled') {
    try {
      await sendLoginHelpEmail(normalizedEmail);
    } catch (emailError) {
      /*
       * Log the operational failure, but don't
       * reveal account existence through a
       * different browser response.
       */
      console.error('Could not send login help email:', emailError);
    }

    return {
      data: null,
      error: null,
    };
  }

  console.error('Email sign-in failed:', error);

  return {
    data: null,
    error: 'Could not send the email. Please try again.',
  };
}

export async function signUpArtistWithOAuth(provider: 'google'): Promise<ActionResponse> {
  return startOAuth(provider, 'artist-signup');
}

export async function signUpArtistWithEmail(email: string): Promise<ActionResponse> {
  return startEmailAuth(email, 'artist-signup');
}
