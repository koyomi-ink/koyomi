import 'server-only';

import { requireAuth } from '@/libs/auth/require-auth';

export async function UserInfo() {
  const { supabase, userId } = await requireAuth();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('Could not load authenticated user');
  }

  const { data: artists, error: artistsError } = await supabase
    .from('artists')
    .select(
      `
      id,
      display_name,
      role,
      is_active,
      is_bookable,
      studio_id,
      studios (
        id,
        name
      )
    `,
    )
    .eq('auth_user_id', userId);

  if (artistsError) {
    console.error('Failed to load artist memberships:', artistsError);
    throw new Error('Could not load artist memberships');
  }

  return (
    <div>
      <div>{user.email}</div>
      {artists.map((artist) => (
        <div key={artist.id}>
          <div>
            {artist.display_name} @ {artist.studios?.name} as an {artist.role}
          </div>
        </div>
      ))}
    </div>
  );
}
