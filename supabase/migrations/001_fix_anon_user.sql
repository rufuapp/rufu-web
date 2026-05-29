-- 匿名ユーザー (Supabase Anonymous Auth) がメール・メタデータなしで登録される際、
-- name が NULL になりプロフィール作成が失敗する問題を修正する。
-- user_<id先頭8文字> 形式のフォールバック名を生成する。

create or replace function public.handle_new_user()
returns trigger as $$
declare
  generated_name text;
begin
  generated_name := coalesce(
    nullif(new.raw_user_meta_data->>'name', ''),
    case
      when new.email is not null and new.email != ''
        then split_part(new.email, '@', 1)
      else null
    end,
    'user_' || substr(replace(new.id::text, '-', ''), 1, 8)
  );

  insert into public.profiles (id, name, display_name)
  values (
    new.id,
    generated_name,
    coalesce(
      nullif(new.raw_user_meta_data->>'full_name', ''),
      generated_name
    )
  )
  on conflict (id) do nothing;

  return new;
end;
$$ language plpgsql security definer;

-- プラットフォーム統計をまとめて返す関数 (Landing page SSR から呼び出す)
create or replace function public.get_platform_stats()
returns table(
  posts_count  bigint,
  creators_count bigint,
  views_total  bigint
) as $$
  select
    count(*)::bigint                     as posts_count,
    count(distinct user_id)::bigint      as creators_count,
    coalesce(sum(views_count), 0)::bigint as views_total
  from public.posts
  where visibility = 'public';
$$ language sql security definer stable;
