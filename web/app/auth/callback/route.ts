import { createClient } from '@/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/';

    if (code) {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (!error) {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }

    // If something fails, redirect to login with error
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  } catch (error) {
    console.error('Callback error:', error);
    // Redirect to login with error
    const { origin } = new URL(request.url);
    return NextResponse.redirect(`${origin}/login?error=server_error`);
  }
}