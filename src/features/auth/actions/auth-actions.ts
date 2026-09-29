'use server';

import { redirect } from 'next/navigation';

import { createSupabaseServerClient } from '@/libs/supabase/supabase-server-client';
import { ActionResponse } from '@/types/action-response';
import { getURL } from '@/utils/get-url';

export async function signInWithOAuth(
  provider: 'google'
): Promise<ActionResponse> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: getURL('/auth/callback'),
    },
  });

  if (error) {
    console.error('OAuth sign-in failed:', error);

    return {
      data: null,
      error: 'Could not sign in. Please try again.',
    };
  }

  redirect(data.url);
}

export async function signInWithEmail(
  email: string
): Promise<ActionResponse> {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: getURL('/auth/callback'),
    },
  });

  if (error) {
    console.error('Email sign-in failed:', error);

    return {
      data: null,
      error: 'Could not send the sign-in email. Please try again.',
    };
  }

  return {
    data: null,
    error: null,
  };
}

export async function logout() {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Logout failed:', error);
    return;
  }

  redirect('/login');
}