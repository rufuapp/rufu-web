import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkContent } from '@/lib/content-filter';
import { isRateLimitError } from '@/lib/guest-post';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'リクエストが不正です' }, { status: 400 });
  }

  const { title, html_content, visibility, tags, remix_source_id, author_name } = body as {
    title: string;
    html_content: string;
    visibility: string;
    tags: string[];
    remix_source_id: string | null;
    author_name: string | null;
  };

  if (!title?.trim() || !html_content?.trim()) {
    return NextResponse.json({ error: 'タイトルとHTMLは必須です' }, { status: 400 });
  }

  const filterResult = checkContent(html_content);
  if (!filterResult.ok) {
    return NextResponse.json({ error: filterResult.reason }, { status: 422 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }

  // Ensure profile exists (fallback if DB trigger failed for anonymous users)
  if (user.is_anonymous) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile) {
      const guestName = `guest_${user.id.replace(/-/g, '').substring(0, 12)}`;
      const { error: profileError } = await supabase.from('profiles').insert({
        id: user.id,
        name: guestName,
        display_name: guestName,
      });
      if (profileError) {
        return NextResponse.json({ error: 'プロフィールの作成に失敗しました' }, { status: 500 });
      }
    }
  }

  const { data: post, error: postError } = await supabase
    .from('posts')
    .insert({
      user_id: user.id,
      title: title.trim(),
      html_content,
      author_name: author_name ?? null,
      visibility: visibility ?? 'public',
      remix_source_id: remix_source_id ?? null,
    })
    .select('id')
    .single();

  if (postError || !post) {
    return NextResponse.json(
      { error: isRateLimitError(postError) ? 'rate_limit_exceeded' : (postError?.message ?? 'unknown error') },
      { status: isRateLimitError(postError) ? 429 : 500 }
    );
  }

  if (tags?.length > 0) {
    await supabase.from('post_tags').insert(
      tags.map((tag: string) => ({ post_id: post.id, tag }))
    );
  }

  return NextResponse.json({ id: post.id }, { status: 201 });
}
