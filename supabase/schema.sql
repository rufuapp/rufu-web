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

-- フォロー
create table public.follows (
  follower_id uuid references public.profiles(id) on delete cascade,
  following_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (follower_id, following_id)
);

-- RLS（Row Level Security）を有効化
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.post_tags enable row level security;
alter table public.likes enable row level security;
alter table public.bookmarks enable row level security;
alter table public.comments enable row level security;
alter table public.follows enable row level security;

-- プロフィールのポリシー
create policy "profiles are viewable by everyone" on public.profiles for select using (true);
create policy "users can update own profile" on public.profiles for update using (auth.uid() = id);

-- 投稿のポリシー
create policy "public posts are viewable by everyone" on public.posts for select using (visibility = 'public' or auth.uid() = user_id);
create policy "authenticated users can insert posts" on public.posts for insert with check (auth.uid() = user_id);
create policy "users can update own posts" on public.posts for update using (auth.uid() = user_id);
create policy "users can delete own posts" on public.posts for delete using (auth.uid() = user_id);

-- タグのポリシー
create policy "post_tags are viewable by everyone" on public.post_tags for select using (true);
create policy "users can manage tags for own posts" on public.post_tags for all using (
  exists (select 1 from public.posts where id = post_id and user_id = auth.uid())
);

-- いいねのポリシー
create policy "likes are viewable by everyone" on public.likes for select using (true);
create policy "authenticated users can like" on public.likes for insert with check (auth.uid() = user_id);
create policy "users can unlike" on public.likes for delete using (auth.uid() = user_id);

-- ブックマークのポリシー
create policy "users can view own bookmarks" on public.bookmarks for select using (auth.uid() = user_id);
create policy "authenticated users can bookmark" on public.bookmarks for insert with check (auth.uid() = user_id);
create policy "users can remove bookmark" on public.bookmarks for delete using (auth.uid() = user_id);

-- コメントのポリシー
create policy "comments are viewable by everyone" on public.comments for select using (true);
create policy "authenticated users can comment" on public.comments for insert with check (auth.uid() = user_id);
create policy "users can delete own comments" on public.comments for delete using (auth.uid() = user_id);

-- フォローのポリシー
create policy "follows are viewable by everyone" on public.follows for select using (true);
create policy "authenticated users can follow" on public.follows for insert with check (auth.uid() = follower_id);
create policy "users can unfollow" on public.follows for delete using (auth.uid() = follower_id);

-- 新規ユーザー登録時にプロフィールを自動作成するトリガー
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
