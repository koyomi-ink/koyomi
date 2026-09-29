'use server';

import { requireAuth } from '@/libs/auth/require-auth';
import { ActionResponse } from '@/types/action-response';

type CreateBusyBlockInput = {
  artistId: string;
  studioId: string;
  locationId: string | null;
  startsAt: string;
  endsAt: string;
};

export async function createBusyBlock(
  input: CreateBusyBlockInput
): Promise<ActionResponse<{ id: string }>> {
  const { supabase } = await requireAuth();

  const { data, error } = await supabase
    .from('busy_blocks')
    .insert({
      artist_id: input.artistId,
      studio_id: input.studioId,
      location_id: input.locationId,
      starts_at: input.startsAt,
      ends_at: input.endsAt,
      source: 'manual',
    })
    .select('id')
    .single();

  if (error) {
    console.error('Failed to create busy block:', error);

    return {
      data: null,
      error: 'Could not create the busy block.',
    };
  }

  return {
    data: {
      id: data.id,
    },
    error: null,
  };
}