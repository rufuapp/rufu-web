-- ユーザープロフィール（Supabase Auth の users テーブルを拡張）
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text unique not null,
  display_name text not null,
  bio text default '',
  avatar_url text,
  followers_count integer default 0,
  following_count integer default 0,
  post_count integer default 0,
  created_at timestamptz default now()
);

-- 投稿
create table public.posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  html_content text not null,
  author_name text,                  -- ゲスト投稿時のニックネーム
  visibility text default 'public' check (visibility in ('public', 'limited', 'private')),
  likes_count integer default 0,
  bookmarks_count integer default 0,
  views_count integer default 0,
  remix_source_id uuid references public.posts(id) on delete set null,
  created_at timestamptz default now()
);

-- タグ
create table public.post_tags (
  post_id uuid references public.posts(id) on delete cascade,
  tag text not null,
  primary key (post_id, tag)
);

-- いいね
create table public.likes (
  user_id uuid references public.profiles(id) on delete cascade,
  post_id uuid references public.posts(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, post_id)
);

-- ブックマーク
create table public.bookmarks (
  user_id uuid references public.profiles(id) on delete cascade,
  post_id uuid references public.posts(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, post_id)
);

-- コメント
create table public.comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  body text not null,
  likes_count integer default 0,
  created_at timestamptz default now()
);

-- コメントいいね
create table public.comment_likes (
  user_id uuid references public.profiles(id) on delete cascade,
  comment_id uuid references public.comments(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, comment_id)
);

-- フォロー
create table public.follows (
  follower_id uuid references public.profiles(id) on delete cascade,
  following_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (follower_id, following_id)
);

-- 通報
create table public.reports (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  reporter_id uuid references public.profiles(id) on delete set null,
  reason text not null,
  created_at timestamptz default now()
);

-- ─── RLS（Row Level Security）を有効化 ────────────────────────────────────────

alter table public.profiles  enable row level security;
alter table public.posts      enable row level security;
alter table public.post_tags  enable row level security;
alter table public.likes      enable row level security;
alter table public.bookmarks  enable row level security;
alter table public.comments   enable row level security;
alter table public.follows    enable row level security;
alter table public.reports    enable row level security;

-- ─── RLS ポリシー ────────────────────────────────────────────────────────────

-- プロフィール
create policy "profiles are viewable by everyone"  on public.profiles for select using (true);
create policy "users can update own profile"        on public.profiles for update using (auth.uid() = id);

-- 投稿
create policy "public posts are viewable by everyone" on public.posts
  for select using (visibility = 'public' or auth.uid() = user_id);
create policy "authenticated users can insert posts" on public.posts
  for insert with check (auth.uid() = user_id);
create policy "users can update own posts" on public.posts for update using (auth.uid() = user_id);
create policy "users can delete own posts" on public.posts for delete using (auth.uid() = user_id);

-- タグ
create policy "post_tags are viewable by everyone" on public.post_tags for select using (true);
create policy "users can manage tags for own posts" on public.post_tags for all using (
  exists (select 1 from public.posts where id = post_id and user_id = auth.uid())
);

-- いいね
create policy "likes are viewable by everyone"   on public.likes for select using (true);
create policy "authenticated users can like"     on public.likes for insert with check (auth.uid() = user_id);
create policy "users can unlike"                 on public.likes for delete using (auth.uid() = user_id);

-- ブックマーク
create policy "users can view own bookmarks"     on public.bookmarks for select using (auth.uid() = user_id);
create policy "authenticated users can bookmark" on public.bookmarks for insert with check (auth.uid() = user_id);
create policy "users can remove bookmark"        on public.bookmarks for delete using (auth.uid() = user_id);

-- コメント
create policy "comments are viewable by everyone"  on public.comments for select using (true);
create policy "authenticated users can comment"    on public.comments for insert with check (auth.uid() = user_id);
create policy "users can delete own comments"      on public.comments for delete using (auth.uid() = user_id);

-- フォロー
create policy "follows are viewable by everyone"   on public.follows for select using (true);
create policy "authenticated users can follow"     on public.follows for insert with check (auth.uid() = follower_id);
create policy "users can unfollow"                 on public.follows for delete using (auth.uid() = follower_id);

-- コメントいいね
alter table public.comment_likes enable row level security;
create policy "comment_likes are viewable by everyone" on public.comment_likes for select using (true);
create policy "authenticated users can like comments"  on public.comment_likes for insert with check (auth.uid() = user_id);
create policy "users can unlike comments"              on public.comment_likes for delete using (auth.uid() = user_id);

-- コメントいいね数（comments.likes_count）
create or replace function public.sync_comment_likes_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.comments set likes_count = likes_count + 1 where id = NEW.comment_id;
  elsif TG_OP = 'DELETE' then
    update public.comments set likes_count = greatest(likes_count - 1, 0) where id = OLD.comment_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

create trigger trg_comment_likes_count
  after insert or delete on public.comment_likes
  for each row execute procedure public.sync_comment_likes_count();

-- 通報（誰でも投稿可、閲覧は本人のみ）
create policy "anyone can report"                  on public.reports for insert with check (true);
create policy "reporter can view own reports"      on public.reports for select using (auth.uid() = reporter_id);

-- ─── カウンター同期トリガー ───────────────────────────────────────────────────

-- いいね数（posts.likes_count）
create or replace function public.sync_likes_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.posts set likes_count = likes_count + 1 where id = NEW.post_id;
  elsif TG_OP = 'DELETE' then
    update public.posts set likes_count = greatest(likes_count - 1, 0) where id = OLD.post_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

create trigger trg_likes_count
  after insert or delete on public.likes
  for each row execute procedure public.sync_likes_count();

-- ブックマーク数（posts.bookmarks_count）
create or replace function public.sync_bookmarks_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.posts set bookmarks_count = bookmarks_count + 1 where id = NEW.post_id;
  elsif TG_OP = 'DELETE' then
    update public.posts set bookmarks_count = greatest(bookmarks_count - 1, 0) where id = OLD.post_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

create trigger trg_bookmarks_count
  after insert or delete on public.bookmarks
  for each row execute procedure public.sync_bookmarks_count();

-- フォロワー数 / フォロー数（profiles.followers_count / following_count）
create or replace function public.sync_follows_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.profiles set followers_count = followers_count + 1 where id = NEW.following_id;
    update public.profiles set following_count = following_count + 1 where id = NEW.follower_id;
  elsif TG_OP = 'DELETE' then
    update public.profiles set followers_count = greatest(followers_count - 1, 0) where id = OLD.following_id;
    update public.profiles set following_count = greatest(following_count - 1, 0) where id = OLD.follower_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

create trigger trg_follows_count
  after insert or delete on public.follows
  for each row execute procedure public.sync_follows_count();

-- 投稿数（profiles.post_count）
create or replace function public.sync_post_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.profiles set post_count = post_count + 1 where id = NEW.user_id;
  elsif TG_OP = 'DELETE' then
    update public.profiles set post_count = greatest(post_count - 1, 0) where id = OLD.user_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

create trigger trg_post_count
  after insert or delete on public.posts
  for each row execute procedure public.sync_post_count();

-- ─── 閲覧数更新 RPC ─────────────────────────────────────────────────────────

-- クライアントから呼び出す: supabase.rpc('increment_views', { post_id: id })
create or replace function public.increment_views(post_id uuid)
returns void as $$
begin
  update public.posts set views_count = views_count + 1 where id = post_id;
end;
$$ language plpgsql security definer;

-- ─── 匿名ユーザーの投稿レートリミット ──────────────────────────────────────

create or replace function public.check_anon_rate_limit()
returns trigger as $$
declare
  anon_post_count integer;
  is_anon boolean;
begin
  -- auth.users の is_anonymous フラグを確認
  select (raw_user_meta_data->>'is_anonymous')::boolean
    into is_anon
    from auth.users
   where id = NEW.user_id;

  if is_anon then
    select count(*) into anon_post_count
      from public.posts
     where user_id = NEW.user_id
       and created_at >= now() - interval '24 hours';

    if anon_post_count >= 3 then
      raise exception 'rate_limit_exceeded' using errcode = 'P0001';
    end if;
  end if;

  return NEW;
end;
$$ language plpgsql security definer;

create trigger trg_anon_rate_limit
  before insert on public.posts
  for each row execute procedure public.check_anon_rate_limit();

-- ─── 新規ユーザー登録時のプロフィール自動作成 ────────────────────────────

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
