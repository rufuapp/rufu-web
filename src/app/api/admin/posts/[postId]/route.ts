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

// PATCH: update post visibility and resolve related reports
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ postId: string }> },
) {
  const user = await assertAdmin();
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { postId } = await params;
  const { visibility, resolveReports } = await req.json() as {
    visibility?: string;
    resolveReports?: boolean;
  };

  const db = adminSupabase();

  if (visibility) {
    const { error } = await db
      .from('posts')
      .update({ visibility })
      .eq('id', postId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (resolveReports) {
    const { error } = await db
      .from('reports')
      .update({ status: 'resolved' })
      .eq('post_id', postId)
      .eq('status', 'open');
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

// DELETE: delete a post (all reports cascade-deleted via FK)
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ postId: string }> },
) {
  const user = await assertAdmin();
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { postId } = await params;
  const db = adminSupabase();

  const { error } = await db.from('posts').delete().eq('id', postId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
