import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { createSupabaseServerClient } from '@/libs/supabase/supabase-server-client';
import { getURL } from '@/utils/get-url';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const siteUrl = getURL();

  if (code) {
    const supabase = await createSupabaseServerClient();

    // 1. Exchange the auth code for a secure session cookie
    await supabase.auth.exchangeCodeForSession(code);

    // 2. Get the authenticated user details
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.id || !user?.email) {
      return NextResponse.redirect(`${siteUrl}/login`);
    }

    // 3. Check if the user is an ARTIST
    const { data: artistData } = await supabase
      .from('artists')
      .select('studio_id, studios(slug)')
      .eq('id', user.id)
      .maybeSingle();

    const artistRecord = artistData as any;

    // 4. ARTIST ROUTING
    if (artistRecord) {
      const hasCompletedOnboarding = artistRecord.studios?.slug;
      
      if (!hasCompletedOnboarding) {
        // Send new artists to claim their slug and set up their studio
        return NextResponse.redirect(`${siteUrl}/onboarding`);
      } else {
        // Send returning artists to the dashboard
        return NextResponse.redirect(`${siteUrl}/app`);
      }
    }

    // 5. CLIENT ROUTING (If they are not an artist)
    const { data: clientRecord } = await supabase
      .from('clients')
      .select('id')
      .eq('email', user.email)
      .maybeSingle();

    if (clientRecord) {
      // Send returning clients directly to their portal
      return NextResponse.redirect(`${siteUrl}/portal`);
    }
  }

  // Fallback if no code is present or the user doesn't exist in either table yet
  return NextResponse.redirect(siteUrl);
}