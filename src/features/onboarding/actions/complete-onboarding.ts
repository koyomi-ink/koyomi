'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';

import { createSupabaseServerClient } from '@/libs/supabase/supabase-server-client';

const onboardingSchema = z.object({
  slug: z.string().min(3).max(30).regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers, and hyphens only'),
  name: z.string().min(2, 'Studio name is required'),
  currency: z.string().length(3),
  displayName: z.string().min(2, 'Artist display name is required'),
});

export async function completeOnboarding(prevState: any, formData: FormData) {
  const parsed = onboardingSchema.safeParse({
    slug: formData.get('slug'),
    name: formData.get('name'),
    currency: formData.get('currency'),
    displayName: formData.get('displayName'),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  const { slug, name, currency, displayName } = parsed.data;

  // 1. Create the Studio tenant (cast insert payload to any to bypass strict never[] generic inference)
  const { data: studio, error: studioError } = await supabase
    .from('studios')
    .insert({ slug, name, currency })
    .select('id')
    .single();

  if (studioError) {
    if (studioError.code === '23505') {
      return { error: { slug: ['This studio slug is already claimed.'] } };
    }
    return { error: { form: [studioError.message] } };
  }


  // 2. Link the authenticated user as the owner in artists table
  const { error: artistError } = await supabase
    .from('artists' as any)
    .insert({
      id: user.id,
      studio_id: studio.id,
      display_name: displayName,
      role: 'owner',
    } as any);

  if (artistError) {
    await supabase.from('studios').delete().eq('id', studio.id);
    return { error: { form: [artistError.message] } };
  }

  // 3. Success: redirect to artist dashboard
  redirect('/app');
}