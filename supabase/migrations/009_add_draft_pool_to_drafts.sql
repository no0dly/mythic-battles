-- Добавляем поле draft_pool если его нет
alter table public.drafts 
add column if not exists draft_pool text[] not null default '{}';

-- Создаем индекс для быстрого поиска
create index if not exists idx_drafts_draft_pool on public.drafts using gin (draft_pool);

