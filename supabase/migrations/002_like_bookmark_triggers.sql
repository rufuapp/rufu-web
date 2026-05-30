-- likes/bookmarks の insert/delete で posts のカウントを自動同期するトリガー

create or replace function public.handle_like_change()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.posts set likes_count = likes_count + 1 where id = NEW.post_id;
  elsif TG_OP = 'DELETE' then
    update public.posts set likes_count = greatest(0, likes_count - 1) where id = OLD.post_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists on_like_change on public.likes;
create trigger on_like_change
  after insert or delete on public.likes
  for each row execute function public.handle_like_change();

create or replace function public.handle_bookmark_change()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.posts set bookmarks_count = bookmarks_count + 1 where id = NEW.post_id;
  elsif TG_OP = 'DELETE' then
    update public.posts set bookmarks_count = greatest(0, bookmarks_count - 1) where id = OLD.post_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists on_bookmark_change on public.bookmarks;
create trigger on_bookmark_change
  after insert or delete on public.bookmarks
  for each row execute function public.handle_bookmark_change();
