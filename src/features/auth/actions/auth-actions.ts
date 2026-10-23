'use server';

import { redirect } from 'next/navigation';

import { sendLoginHelpEmail } from '@/features/auth/emails/send-login-help-email';
import { checkAuthEmailRateLimit } from '@/features/auth/rate-limit/check-auth-email-rate-limit';
import { authEmailSchema } from '@/features/auth/schemas/auth-email-schema';
import { createSupabaseServerClient } from '@/libs/supabase/supabase-server-client';
import type { ActionResponse } from '@/types/action-response';
import { getURL } from '@/utils/get-url';

type AuthIntent = 'login' | 'artist-signup';

type ValidatedEmail =
  | {
      email: string;
      error: null;
    }
  | {
      email: null;
      error: ActionResponse;
    };

function getCallbackUrl(intent: AuthIntent) {
  return getURL(`/auth/callback?intent=${intent}`);
}

function validateAuthEmail(email: string): ValidatedEmail {
  const result = authEmailSchema.safeParse({
    email,
  });

  if (!result.success) {
    return {
      email: null,
      error: {
        data: null,
        error: result.error.issues[0]?.message ?? 'Enter a valid email address.',
      },
    };
  }

  return {
    email: result.data.email,
    error: null,
  };
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

function isUnknownOtpUserError(error: { code?: string; message?: string }) {
  return error.code === 'otp_disabled' && error.message?.toLowerCase().includes('signups not allowed for otp');
}

function isSupabaseRateLimitError(error: { code?: string }) {
  return error.code === 'over_email_send_rate_limit' || error.code === 'over_request_rate_limit';
}

/*
 * Google OAuth
 *
 * These are safe to leave in place even though Google
 * isn't configured yet. The UI can hide the buttons
 * until the provider is actually enabled.
 */
async function startGoogleOAuth(intent: AuthIntent): Promise<ActionResponse> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: getCallbackUrl(intent),
    },
  });

  if (error) {
    console.error('Google authentication failed:', error);

    return {
      data: null,
      error: 'Could not continue with Google. Please try again.',
    };
  }

  redirect(data.url);
}

export async function signInWithGoogle(): Promise<ActionResponse> {
  return startGoogleOAuth('login');
}

export async function signUpArtistWithGoogle(): Promise<ActionResponse> {
  return startGoogleOAuth('artist-signup');
}

/*
 * EMAIL LOGIN
 *
 * Existing accounts only.
 */
export async function signInWithEmail(email: string): Promise<ActionResponse> {
  const validation = validateAuthEmail(email);

  if (validation.error) {
    return validation.error;
  }

  const normalizedEmail = validation.email;

  /*
   * Validate first, then consume the rate-limit bucket.
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
       * /login must not create a new Auth user.
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
   * Supabase currently returns:
   *
   *   code: otp_disabled
   *   message: "Signups not allowed for otp"
   *
   * when shouldCreateUser=false and the user
   * doesn't exist.
   *
   * Do not treat every otp_disabled error as this,
   * because otp_disabled can also mean email OTP
   * itself is disabled in the project.
   */
  if (isUnknownOtpUserError(error)) {
    try {
      await sendLoginHelpEmail(normalizedEmail);
    } catch (emailError) {
      console.error('Could not send login help email:', emailError);

      return {
        data: null,
        error: 'We could not send an email right now. Please try again or get in touch with support.',
      };
    }

    /*
     * Deliberately return the same browser result as
     * a successful login request so we don't expose
     * account existence through the UI.
     */
    return {
      data: null,
      error: null,
    };
  }

  if (isSupabaseRateLimitError(error)) {
    return {
      data: null,
      error: 'Too many email attempts. Please wait a few minutes and try again.',
    };
  }

  console.error('Email sign-in failed:', error);

  return {
    data: null,
    error: 'Could not send the email. Please try again.',
  };
}

/*
 * ARTIST SIGNUP
 *
 * New Auth users are allowed here.
 */
export async function signUpArtistWithEmail(email: string): Promise<ActionResponse> {
  const validation = validateAuthEmail(email);

  if (validation.error) {
    return validation.error;
  }

  const normalizedEmail = validation.email;

  /*
   * Login and signup intentionally share the limiter,
   * preventing users from switching endpoints to
   * bypass email-auth limits.
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
       * /signup explicitly allows creation of a
       * new Supabase Auth identity.
       */
      shouldCreateUser: true,
    },
  });

  if (!error) {
    return {
      data: null,
      error: null,
    };
  }

  if (isSupabaseRateLimitError(error)) {
    return {
      data: null,
      error: 'Too many email attempts. Please wait a few minutes and try again.',
    };
  }

  console.error('Artist email signup failed:', error);

  return {
    data: null,
    error: 'Could not send the email. Please try again.',
  };
}
