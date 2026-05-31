-- =====================================================================
-- missing-schema.sql
-- schema.sql のうち DB に未適用の部分のみ（安全に再実行可能）
-- =====================================================================

-- ─── comment_likes テーブル ────────────────────────────────────────────────

create table if not exists public.comment_likes (
  user_id uuid references public.profiles(id) on delete cascade,
  comment_id uuid references public.comments(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, comment_id)
);

alter table public.comment_likes enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'comment_likes' and policyname = 'comment_likes are viewable by everyone') then
    create policy "comment_likes are viewable by everyone" on public.comment_likes for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'comment_likes' and policyname = 'authenticated users can like comments') then
    create policy "authenticated users can like comments" on public.comment_likes for insert with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'comment_likes' and policyname = 'users can unlike comments') then
    create policy "users can unlike comments" on public.comment_likes for delete using (auth.uid() = user_id);
  end if;
end $$;

-- ─── reports テーブル ────────────────────────────────────────────────────────

create table if not exists public.reports (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  reporter_id uuid references public.profiles(id) on delete set null,
  reason text not null,
  created_at timestamptz default now()
);

alter table public.reports enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'reports' and policyname = 'anyone can report') then
    create policy "anyone can report" on public.reports for insert with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'reports' and policyname = 'reporter can view own reports') then
    create policy "reporter can view own reports" on public.reports for select using (auth.uid() = reporter_id);
  end if;
end $$;

-- ─── コメントいいね数同期トリガー ──────────────────────────────────────────

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

drop trigger if exists trg_comment_likes_count on public.comment_likes;
create trigger trg_comment_likes_count
  after insert or delete on public.comment_likes
  for each row execute procedure public.sync_comment_likes_count();

-- ─── いいね数同期トリガー ───────────────────────────────────────────────────

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

drop trigger if exists trg_likes_count on public.likes;
create trigger trg_likes_count
  after insert or delete on public.likes
  for each row execute procedure public.sync_likes_count();

-- ─── ブックマーク数同期トリガー ─────────────────────────────────────────────

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

drop trigger if exists trg_bookmarks_count on public.bookmarks;
create trigger trg_bookmarks_count
  after insert or delete on public.bookmarks
  for each row execute procedure public.sync_bookmarks_count();

-- ─── フォロー数同期トリガー ─────────────────────────────────────────────────

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

drop trigger if exists trg_follows_count on public.follows;
create trigger trg_follows_count
  after insert or delete on public.follows
  for each row execute procedure public.sync_follows_count();

-- ─── 投稿数同期トリガー ─────────────────────────────────────────────────────

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

drop trigger if exists trg_post_count on public.posts;
create trigger trg_post_count
  after insert or delete on public.posts
  for each row execute procedure public.sync_post_count();

-- ─── 閲覧数更新 RPC ─────────────────────────────────────────────────────────

create or replace function public.increment_views(post_id uuid)
returns void as $$
begin
  update public.posts set views_count = views_count + 1 where id = post_id;
end;
$$ language plpgsql security definer;

-- ─── 匿名ユーザーのレートリミット ───────────────────────────────────────────

create or replace function public.check_anon_rate_limit()
returns trigger as $$
declare
  anon_post_count integer;
  is_anon boolean;
begin
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

drop trigger if exists trg_anon_rate_limit on public.posts;
create trigger trg_anon_rate_limit
  before insert on public.posts
  for each row execute procedure public.check_anon_rate_limit();

-- ─── 新規ユーザー登録時プロフィール自動作成 ──────────────────────────────────

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
