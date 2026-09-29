import { z } from 'zod';

export const createBusyBlockSchema = z
  .object({
    artistId: z.uuid(),
    studioId: z.uuid(),
    locationId: z.uuid().nullable(),
    startsAt: z.iso.datetime({ offset: true }),
    endsAt: z.iso.datetime({ offset: true }),
  })
  .refine(
    (data) => new Date(data.endsAt) > new Date(data.startsAt),
    {
      message: 'End time must be after start time.',
      path: ['endsAt'],
    }
  );

export type CreateBusyBlockInput = z.infer<
  typeof createBusyBlockSchema
>;