import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { upsertUser } from '@/lib/db';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Error exchanging code for session:', error);
      return NextResponse.redirect(new URL('/login?error=auth', requestUrl.origin));
    }

    if (session?.user) {
      try {
        // Correctly get the user object
        const { data: userData, error: userError } = await supabase.auth.getUser();
        const user = userData.user;
        if (!user) {
          console.error('No user found after session exchange');
          return NextResponse.redirect(new URL('/login?error=auth', requestUrl.origin));
        }

        // Helper to ensure string | null
        const toStringOrNull = (value: unknown): string | null => typeof value === 'string' ? value : null;

        await upsertUser({
          uid: user.id,
          email: toStringOrNull(user.email),
          name: toStringOrNull(user.user_metadata?.name),
          picture: toStringOrNull(user.user_metadata?.avatar_url),
        });
      } catch (error) {
        console.error('Error creating/updating user:', error);
        if (error instanceof Error) {
          return NextResponse.redirect(new URL(`/login?error=db&msg=${encodeURIComponent(error.message)}`, requestUrl.origin));
        }
        return NextResponse.redirect(new URL('/login?error=db', requestUrl.origin));
      }
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL('/dashboard', requestUrl.origin));
} 