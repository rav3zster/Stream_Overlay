-- VibeOverlay Studio PostgreSQL Schema Migration
-- Decoupled Widget-First Architecture

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. USERS
create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  username text unique,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table users enable row level security;
create policy "Users can view all users" on users for select using (true);
create policy "Users can edit their own profile" on users for update using (auth.uid() = id);

-- 2. PROJECTS
create table if not exists projects (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table projects enable row level security;
create policy "Users can CRUD their own projects" on projects for all using (auth.uid() = user_id);

-- 3. SCENES
create table if not exists scenes (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  name text not null, -- e.g. 'starting-soon', 'main-stream', 'chat-session'
  label text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table scenes enable row level security;
create policy "Users can CRUD scenes of their projects" on scenes for all
  using (exists (select 1 from projects where projects.id = scenes.project_id and projects.user_id = auth.uid()));

-- 4. WIDGETS (Global widget entity decoupled from scenes)
create table if not exists widgets (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  widget_type text not null, -- e.g. 'timer', 'chat', 'vtuber', 'countdown', 'weather', 'clock'
  name text not null,
  settings jsonb not null default '{}'::jsonb, -- Custom settings for widget contents
  animation jsonb not null default '{}'::jsonb, -- Animation details (fade, float, loop, etc)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table widgets enable row level security;
create policy "Users can CRUD widgets of their projects" on widgets for all
  using (exists (select 1 from projects where projects.id = widgets.project_id and projects.user_id = auth.uid()));

-- 5. WIDGET_STYLES (Granular style overrides for widgets, 1-to-1 with widgets table)
create table if not exists widget_styles (
  id uuid primary key default uuid_generate_v4(),
  widget_id uuid references widgets(id) on delete cascade unique,
  border_radius integer not null default 8,
  background text not null default 'rgba(14, 8, 26, 0.8)',
  border_size integer not null default 1,
  border_style text not null default 'solid',
  border_color text not null default '#A855F7',
  glow_color text,
  glow_blur integer not null default 0,
  shadow_x integer not null default 0,
  shadow_y integer not null default 4,
  shadow_blur integer not null default 10,
  shadow_color text not null default 'rgba(0,0,0,0.5)',
  font_family text,
  font_size double precision,
  font_weight text,
  font_color text,
  text_align text not null default 'center',
  padding integer not null default 4,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table widget_styles enable row level security;
create policy "Users can CRUD styles of their widgets" on widget_styles for all
  using (exists (
    select 1 from widgets 
    join projects on projects.id = widgets.project_id
    where widgets.id = widget_styles.widget_id and projects.user_id = auth.uid()
  ));

-- 6. SCENE_WIDGETS (Junction table storing widget placement and visibility per scene)
create table if not exists scene_widgets (
  id uuid primary key default uuid_generate_v4(),
  scene_id uuid references scenes(id) on delete cascade,
  widget_id uuid references widgets(id) on delete cascade,
  parent_id uuid references scene_widgets(id) on delete set null, -- Grouping support
  x double precision not null default 0.0,
  y double precision not null default 0.0,
  width double precision not null default 10.0,
  height double precision not null default 10.0,
  rotation double precision not null default 0.0,
  opacity double precision not null default 100.0,
  scale double precision not null default 1.0,
  z_index integer not null default 1,
  visible boolean not null default true,
  locked boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(scene_id, widget_id)
);

alter table scene_widgets enable row level security;
create policy "Users can CRUD scene placements for their projects" on scene_widgets for all
  using (exists (
    select 1 from scenes
    join projects on projects.id = scenes.project_id
    where scenes.id = scene_widgets.scene_id and projects.user_id = auth.uid()
  ));

-- 7. SETTINGS (Global Stream Settings)
create table if not exists settings (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade unique,
  streamer_name text not null default 'Rave_VT',
  stream_title text not null default 'Indie Game Night!',
  active_game text not null default 'Hollow Knight',
  ticker_text text,
  socials jsonb not null default '{}'::jsonb,
  border_radius integer not null default 8,
  animation_speed text not null default 'normal',
  overlay_opacity integer not null default 85,
  particle_density text not null default 'medium',
  ticker_speed text not null default 'normal',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table settings enable row level security;
create policy "Users can CRUD settings of their projects" on settings for all
  using (exists (select 1 from projects where projects.id = settings.project_id and projects.user_id = auth.uid()));

-- Enable realtime replication for tables we want to sync instantly
alter publication supabase_realtime add table widgets;
alter publication supabase_realtime add table widget_styles;
alter publication supabase_realtime add table scene_widgets;
alter publication supabase_realtime add table settings;
alter publication supabase_realtime add table scenes;
alter publication supabase_realtime add table projects;
