import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create a Supabase client with the service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function upsertUser(userData: {
  uid: string;
  email: string | null;
  name: string | null;
  picture: string | null;
}) {
  const { data, error } = await supabase
    .from('ai_user')
    .upsert(
      {
        uid: userData.uid,
        email: userData.email,
        name: userData.name,
        picture: userData.picture,
        credits: 3, // Default credits for new users
      },
      {
        onConflict: 'uid',
        ignoreDuplicates: false,
      }
    )
    .select();

  if (error) {
    console.error('Error upserting user:', error);
    throw error;
  }

  return data;
} 