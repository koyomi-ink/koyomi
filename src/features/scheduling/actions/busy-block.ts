'use server';

import { requireAuth } from '@/libs/auth/require-auth';
import {
  createBusyBlockSchema,
  type CreateBusyBlockInput,
} from '@/features/scheduling/schemas/busy-block';
import { ActionResponse } from '@/types/action-response';

export async function createBusyBlock(
  input: CreateBusyBlockInput
): Promise<ActionResponse<{ id: string }>> {
  const { supabase } = await requireAuth();

  const parsed = createBusyBlockSchema.safeParse(input);

  if (!parsed.success) {
    return {
      data: null,
      error: 'Invalid busy block data.',
    };
  }

  const validatedInput = parsed.data;

  const { data, error } = await supabase
    .from('busy_blocks')
    .insert({
      artist_id: validatedInput.artistId,
      studio_id: validatedInput.studioId,
      location_id: validatedInput.locationId,
      starts_at: validatedInput.startsAt,
      ends_at: validatedInput.endsAt,
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