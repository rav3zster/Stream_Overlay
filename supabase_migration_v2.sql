-- Supabase Migration Schema Expansion v2
-- Transitions VibeOverlay Studio to Canva/Figma-like Database Structure
-- Safe, Idempotent, and Repeatedly Executable Migration Script

-- 1. EDITOR PREFERENCES
create table if not exists editor_preferences (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade unique,
  grid_size integer not null default 8,
  snap_strength double precision not null default 1.5,
  show_guides boolean not null default true,
  show_safe_area boolean not null default true,
  theme text not null default 'dark',
  zoom double precision not null default 100.0,
  pan_x double precision not null default 0.0,
  pan_y double precision not null default 0.0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table editor_preferences enable row level security;
drop policy if exists "Users can CRUD editor preferences of their projects" on editor_preferences;
create policy "Users can CRUD editor preferences of their projects" on editor_preferences for all
  using (exists (select 1 from projects where projects.id = editor_preferences.project_id and projects.user_id = auth.uid()));

-- 2. ASSET COLLECTIONS (Folders)
create table if not exists asset_collections (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  name text not null,
  color text,
  icon text,
  parent_id uuid references asset_collections(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table asset_collections enable row level security;
drop policy if exists "Users can CRUD asset collections of their projects" on asset_collections;
create policy "Users can CRUD asset collections of their projects" on asset_collections for all
  using (exists (select 1 from projects where projects.id = asset_collections.project_id and projects.user_id = auth.uid()));

-- Add collection folder reference to assets safely
do $$
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'assets' and column_name = 'collection_id'
  ) then
    alter table assets add column collection_id uuid references asset_collections(id) on delete set null;
  end if;
end $$;

-- 3. ASSET TAGS
create table if not exists asset_tags (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(project_id, name)
);

alter table asset_tags enable row level security;
drop policy if exists "Users can CRUD asset tags of their projects" on asset_tags;
create policy "Users can CRUD asset tags of their projects" on asset_tags for all
  using (exists (select 1 from projects where projects.id = asset_tags.project_id and projects.user_id = auth.uid()));

-- 4. ASSET TAG MAP
create table if not exists asset_tag_map (
  asset_id uuid references assets(id) on delete cascade,
  tag_id uuid references asset_tags(id) on delete cascade,
  primary key (asset_id, tag_id)
);

alter table asset_tag_map enable row level security;
drop policy if exists "Users can CRUD asset tag associations" on asset_tag_map;
create policy "Users can CRUD asset tag associations" on asset_tag_map for all
  using (exists (
    select 1 from assets 
    join projects on projects.id = assets.project_id 
    where assets.id = asset_tag_map.asset_id and projects.user_id = auth.uid()
  ));

-- 5. THEME PRESETS
create table if not exists theme_presets (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  name text not null,
  category text,
  description text,
  preview_image text,
  config jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table theme_presets enable row level security;
drop policy if exists "Users can CRUD theme presets of their projects" on theme_presets;
create policy "Users can CRUD theme presets of their projects" on theme_presets for all
  using (exists (select 1 from projects where projects.id = theme_presets.project_id and projects.user_id = auth.uid()));

-- 6. ANIMATION PRESETS
create table if not exists animation_presets (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  name text not null,
  category text,
  preview text,
  config jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table animation_presets enable row level security;
drop policy if exists "Users can CRUD animation presets of their projects" on animation_presets;
create policy "Users can CRUD animation presets of their projects" on animation_presets for all
  using (exists (select 1 from projects where projects.id = animation_presets.project_id and projects.user_id = auth.uid()));

-- 7. WIDGET GROUPS (For nested groups in Layer Panel)
create table if not exists widget_groups (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  scene_id uuid references scenes(id) on delete cascade,
  name text not null,
  locked boolean not null default false,
  collapsed boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table widget_groups enable row level security;
drop policy if exists "Users can CRUD widget groups of their projects" on widget_groups;
create policy "Users can CRUD widget groups of their projects" on widget_groups for all
  using (exists (select 1 from projects where projects.id = widget_groups.project_id and projects.user_id = auth.uid()));

-- 8. Enable Realtime Replication for the new and core tables safely (checks pg catalogs to prevent duplicate errors)
do $$
declare
  t_name text;
  tables_to_add text[] := array[
    'editor_preferences', 'asset_collections', 'asset_tags', 
    'theme_presets', 'animation_presets', 'widget_groups',
    'settings', 'goals', 'widgets', 'scene_widgets', 'scenes'
  ];
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    foreach t_name in array tables_to_add loop
      if not exists (
        select 1 from pg_publication_rel pr
        join pg_class c on c.oid = pr.prrelid
        join pg_publication p on p.oid = pr.prpubid
        where p.pubname = 'supabase_realtime' and c.relname = t_name
      ) then
        execute format('alter publication supabase_realtime add table %I', t_name);
      end if;
    end loop;
  end if;
end $$;

-- 9. Fix grouping support by dropping UUID foreign key constraint and altering parent_id column type to text
alter table scene_widgets drop constraint if exists scene_widgets_parent_id_fkey;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'scene_widgets' and column_name = 'parent_id' and data_type = 'uuid'
  ) then
    alter table scene_widgets alter column parent_id type text;
  end if;
end $$;

-- 10. Add timer state columns to settings (so OBS can sync timer via realtime)
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'settings' and column_name = 'timer_seconds'
  ) then
    alter table settings add column timer_seconds integer not null default 600;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'settings' and column_name = 'timer_is_running'
  ) then
    alter table settings add column timer_is_running boolean not null default true;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'settings' and column_name = 'timer_is_paused'
  ) then
    alter table settings add column timer_is_paused boolean not null default false;
  end if;
end $$;

