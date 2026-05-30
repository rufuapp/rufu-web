import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'sho24.noubeau@gmail.com';

function adminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
  );
}

async function assertAdmin() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) return null;
  return user;
}

export async function GET() {
  const user = await assertAdmin();
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const db = adminSupabase();

  const { data: reports, error } = await db
    .from('reports')
    .select(`
      id,
      post_id,
      reason,
      status,
      admin_note,
      created_at,
      reporter_id,
      posts (
        id,
        title,
        visibility,
        reports_count,
        user_id,
        created_at,
        profiles!posts_user_id_fkey ( name, display_name )
      ),
      reporter:profiles!reports_reporter_id_fkey ( name, display_name )
    `)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ reports: reports ?? [] });
}
