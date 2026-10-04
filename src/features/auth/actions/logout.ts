'use server';

import { redirect, RedirectType } from 'next/navigation';

import { createSupabaseServerClient } from '@/libs/supabase/supabase-server-client';

export async function logout() {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error('Failed to log out.');
  }

  redirect('/login', RedirectType.replace);
}
