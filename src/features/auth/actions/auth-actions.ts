'use server';

import { redirect } from 'next/navigation';

import { sendLoginHelpEmail } from '@/features/auth/emails/send-login-help-email';
import { checkAuthEmailRateLimit } from '@/features/auth/rate-limit/check-auth-email-rate-limit';
import { createSupabaseServerClient } from '@/libs/supabase/supabase-server-client';
import type { ActionResponse } from '@/types/action-response';
import { getURL } from '@/utils/get-url';

type AuthIntent = 'login' | 'artist-signup';

function getCallbackUrl(intent: AuthIntent) {
  return getURL(`/auth/callback?intent=${intent}`);
}

async function checkEmailRateLimit(email: string): Promise<ActionResponse | null> {
  try {
    const allowed = await checkAuthEmailRateLimit(email);

    if (!allowed) {
      return {
        data: null,
        error: 'Too many email attempts. Please wait a few minutes and try again.',
      };
    }

    return null;
  } catch (error) {
    console.error('Auth rate limiter failed:', error);

    return {
      data: null,
      error: 'We could not process your request right now. Please try again.',
    };
  }
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

export async function signInWithOAuth(provider: 'google'): Promise<ActionResponse> {
  return startOAuth(provider, 'login');
}

export async function signInWithEmail(email: string): Promise<ActionResponse> {
  const normalizedEmail = email.trim().toLowerCase();

  /*
   * Rate-limit BEFORE Supabase or Resend.
   */
  const rateLimitError = await checkEmailRateLimit(normalizedEmail);

  if (rateLimitError) {
    return rateLimitError;
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signInWithOtp({
    email: normalizedEmail,
    options: {
      emailRedirectTo: getCallbackUrl('login'),

      /*
       * Signing in must never create
       * a brand-new Koyomi identity.
       */
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
   * Unknown/non-email-login identity:
   * send the informational Resend email
   * without revealing account existence
   * in the browser.
   */
  if (error.code === 'otp_disabled') {
    try {
      await sendLoginHelpEmail(normalizedEmail);
    } catch (emailError) {
      console.error('Could not send login help email:', emailError);

      return {
        data: null,
        error: 'We could not send an email right now. Please try again or get in touch with support.',
      };
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
  const normalizedEmail = email.trim().toLowerCase();

  /*
   * Same limiter as login.
   *
   * This prevents someone from bypassing
   * /login limits simply by using /signup.
   */
  const rateLimitError = await checkEmailRateLimit(normalizedEmail);

  if (rateLimitError) {
    return rateLimitError;
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signInWithOtp({
    email: normalizedEmail,
    options: {
      emailRedirectTo: getCallbackUrl('artist-signup'),

      /*
       * /signup is explicitly the artist
       * account creation flow.
       */
      shouldCreateUser: true,
    },
  });

  if (error) {
    console.error('Artist email signup failed:', error);

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
