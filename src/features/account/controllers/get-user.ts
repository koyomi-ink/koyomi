import { createSupabaseServerClient } from '@/libs/supabase/supabase-server-client';

export async function getUserProfile() {
  const supabase = await createSupabaseServerClient();

  // Step 1: Securely verify the session and get the Identity ID
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null; // Not logged in, or session expired
  }

  // Step 2: Fetch the Koyomi-specific application profile
  const { data: profile, error: profileError } = await supabase
    .from('artists')
    .select(
      `
      id,
      display_name,
      role,
      studio_id,
      studios (
        name,
        slug,
        currency
      )
    `,
    )
    .eq('id', user.id)
    .single();

  if (profileError) {
    console.error('Database error fetching artist profile:', profileError);
    return null;
  }

  // Step 3: Return a unified object
  return {
    auth: {
      id: user.id,
      email: user.email,
    },
    artist: profile,
  };
}
