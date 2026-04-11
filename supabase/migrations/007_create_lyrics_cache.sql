-- Create lyrics cache table for history-first retrieval
-- Stores successful lyrics lookups with source and TTL metadata

create table public.lyrics_cache (
  id uuid primary key default gen_random_uuid(),
  
  -- Search query metadata
  query text not null, -- Original user search query
  normalized_query text not null, -- Lowercased + trimmed for deduplication
  
  -- Song metadata
  title text not null, -- Bhajan/song title found
  artist text, -- Singer/artist if available
  normalized_title text not null, -- Normalized for matching
  
  -- Lyrics data
  lyrics text not null, -- Full lyrics text
  source text not null, -- Where lyrics came from (lrclib, lyrics.ovh, local, user_upload, backend_fallback)
  confidence numeric default 1.0, -- 0-1 score of match quality
  
  -- Cache control
  ttl_seconds integer default 2592000, -- 30 days default TTL
  created_at timestamp with time zone default now() not null,
  last_accessed timestamp with time zone default now() not null,
  access_count integer default 1, -- How many times this cache was used
  
  -- Content hash for duplicate detection
  lyrics_hash text, -- SHA256 hash of lyrics for content dedup
  
  -- Metadata
  metadata jsonb, -- Store extra data: language, deity, related_bhajans, etc.
  
  constraint lyrics_cache_query_check check (char_length(query) > 0)
);

-- Indexes for fast lookups
create index idx_lyrics_cache_normalized_query on public.lyrics_cache(normalized_query);
create index idx_lyrics_cache_source on public.lyrics_cache(source);
create index idx_lyrics_cache_created_at on public.lyrics_cache(created_at desc);
create index idx_lyrics_cache_last_accessed on public.lyrics_cache(last_accessed desc);
create index idx_lyrics_cache_lyrics_hash on public.lyrics_cache(lyrics_hash);

-- Function to clean expired cache entries
create or replace function public.cleanup_expired_lyrics_cache()
returns setof bigint as $$
  delete from public.lyrics_cache
  where created_at + (ttl_seconds || ' seconds')::interval < now()
  returning id::bigint;
$$ language sql;

-- Function to update last_accessed timestamp
create or replace function public.update_lyrics_cache_access(cache_id uuid)
returns void as $$
  update public.lyrics_cache
  set 
    last_accessed = now(),
    access_count = access_count + 1
  where id = cache_id;
$$ language sql;

-- Grant permissions
grant select on public.lyrics_cache to authenticated;
grant select on public.lyrics_cache to anon;
grant insert on public.lyrics_cache to authenticated;
grant update on public.lyrics_cache to authenticated;
grant delete on public.lyrics_cache to authenticated;

grant execute on function public.cleanup_expired_lyrics_cache() to authenticated;
grant execute on function public.update_lyrics_cache_access(uuid) to authenticated;
