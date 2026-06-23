-- VibeOverlay Studio PostgreSQL Schema Migration
-- Decoupled Widget-First Architecture (Evolved)

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES (Linked to auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique,
  avatar_url text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table profiles enable row level security;
create policy "Profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can update their own profile" on profiles for update using (auth.uid() = id);

-- Trigger function to automatically create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', substring(new.email from '([^@]+)')),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Recreate trigger if exists
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. PROJECTS
create table if not exists projects (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
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

-- 4. WIDGET_STYLES (Decoupled, reusable style templates)
create table if not exists widget_styles (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  name text not null default 'Default Style',
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
create policy "Users can CRUD styles of their projects" on widget_styles for all
  using (exists (select 1 from projects where projects.id = widget_styles.project_id and projects.user_id = auth.uid()));

-- 5. WIDGETS (Global widget entities decoupled from scenes, referencing reusable styles)
create table if not exists widgets (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  style_id uuid references widget_styles(id) on delete set null, -- Reusable style link
  widget_type text not null, -- e.g. 'timer', 'chat', 'vtuber'
  name text not null,
  settings jsonb not null default '{}'::jsonb, -- Custom structural configuration settings
  content jsonb not null default '{}'::jsonb, -- Dynamic content payload/data
  animation jsonb not null default '{}'::jsonb, -- Animation details (fade, float, loop, etc)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table widgets enable row level security;
create policy "Users can CRUD widgets of their projects" on widgets for all
  using (exists (select 1 from projects where projects.id = widgets.project_id and projects.user_id = auth.uid()));

-- 6. SCENE_WIDGETS (Junction table representing widget placements in scenes)
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

-- 8. THEMES
create table if not exists themes (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  name text not null,
  label text not null,
  colors jsonb not null default '{}'::jsonb,
  fonts jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table themes enable row level security;
create policy "Users can CRUD themes of their projects" on themes for all
  using (exists (select 1 from projects where projects.id = themes.project_id and projects.user_id = auth.uid()));

-- 9. SCENE_HISTORY (Undo/redo stack persistence)
create table if not exists scene_history (
  id uuid primary key default uuid_generate_v4(),
  scene_id uuid references scenes(id) on delete cascade,
  snapshot jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table scene_history enable row level security;
create policy "Users can CRUD history of their scenes" on scene_history for all
  using (exists (
    select 1 from scenes
    join projects on projects.id = scenes.project_id
    where scenes.id = scene_history.scene_id and projects.user_id = auth.uid()
  ));

-- 10. TEMPLATES
create table if not exists templates (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  category text,
  preview_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table templates enable row level security;
create policy "Templates are viewable by everyone" on templates for select using (true);

-- 11. TEMPLATE_WIDGETS
create table if not exists template_widgets (
  id uuid primary key default uuid_generate_v4(),
  template_id uuid references templates(id) on delete cascade,
  widget_type text not null,
  name text not null,
  settings jsonb not null default '{}'::jsonb,
  style jsonb not null default '{}'::jsonb
);

alter table template_widgets enable row level security;
create policy "Template widgets are viewable by everyone" on template_widgets for select using (true);

-- 12. ANIMATIONS
create table if not exists animations (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  name text not null,
  keyframes jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table animations enable row level security;
create policy "Users can CRUD animations of their projects" on animations for all
  using (exists (select 1 from projects where projects.id = animations.project_id and projects.user_id = auth.uid()));

-- 13. GOALS
create table if not exists goals (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  goal_type text not null, -- 'sub', 'donation', 'follower'
  title text not null,
  current_value double precision not null default 0.0,
  target_value double precision not null,
  end_date timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table goals enable row level security;
create policy "Users can CRUD goals of their projects" on goals for all
  using (exists (select 1 from projects where projects.id = goals.project_id and projects.user_id = auth.uid()));

-- 14. EVENTS
create table if not exists events (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  event_type text not null, -- 'follow', 'subscribe', 'donation', 'raid'
  username text not null,
  message text,
  amount text,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table events enable row level security;
create policy "Users can CRUD events of their projects" on events for all
  using (exists (select 1 from projects where projects.id = events.project_id and projects.user_id = auth.uid()));

-- 15. CHAT_MESSAGES
create table if not exists chat_messages (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  username text not null,
  message_text text not null,
  platform text not null default 'twitch',
  badge text,
  color text,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table chat_messages enable row level security;
create policy "Users can CRUD chat messages of their projects" on chat_messages for all
  using (exists (select 1 from projects where projects.id = chat_messages.project_id and projects.user_id = auth.uid()));

-- 16. SCHEDULER
create table if not exists scheduler (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  trigger_time time not null,
  action_type text not null, -- e.g. 'switch_scene'
  payload jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table scheduler enable row level security;
create policy "Users can CRUD schedules of their projects" on scheduler for all
  using (exists (select 1 from projects where projects.id = scheduler.project_id and projects.user_id = auth.uid()));

-- 17. INTEGRATIONS
create table if not exists integrations (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  platform text not null, -- 'twitch', 'youtube', 'discord', 'spotify'
  config jsonb not null default '{}'::jsonb,
  is_connected boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(project_id, platform)
);

alter table integrations enable row level security;
create policy "Users can CRUD integrations of their projects" on integrations for all
  using (exists (select 1 from projects where projects.id = integrations.project_id and projects.user_id = auth.uid()));

-- 18. MARKETPLACE
create table if not exists marketplace (
  id uuid primary key default uuid_generate_v4(),
  item_type text not null, -- 'theme', 'widget', 'asset'
  title text not null,
  description text,
  price double precision not null default 0.0,
  creator_id uuid references profiles(id) on delete set null,
  download_count integer not null default 0,
  rating double precision,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table marketplace enable row level security;
create policy "Marketplace items are viewable by everyone" on marketplace for select using (true);

-- Enable realtime replication for tables we want to sync instantly
alter publication supabase_realtime add table widgets;
alter publication supabase_realtime add table widget_styles;
alter publication supabase_realtime add table scene_widgets;
alter publication supabase_realtime add table settings;
alter publication supabase_realtime add table scenes;
alter publication supabase_realtime add table projects;

-- Future extensions to sync in real time
alter publication supabase_realtime add table themes;
alter publication supabase_realtime add table goals;
alter publication supabase_realtime add table events;
alter publication supabase_realtime add table chat_messages;
alter publication supabase_realtime add table scheduler;
alter publication supabase_realtime add table integrations;

-- 19. ASSETS (User-uploaded media assets)
create table if not exists assets (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  name text not null,
  type text not null, -- 'image', 'gif', 'video', 'lottie', 'svg', 'audio'
  url text not null,
  width integer,
  height integer,
  size integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table assets enable row level security;
create policy "Users can CRUD their own assets" on assets for all
  using (exists (select 1 from projects where projects.id = assets.project_id and projects.user_id = auth.uid()));

alter publication supabase_realtime add table assets;

-- Create Supabase Storage Bucket for user assets if not exists
insert into storage.buckets (id, name, public) 
values ('assets', 'assets', true)
on conflict (id) do nothing;

create policy "Users can upload their own assets to storage" on storage.objects for insert
  with check (bucket_id = 'assets' and auth.role() = 'authenticated');

create policy "Users can read all public assets from storage" on storage.objects for select
  using (bucket_id = 'assets');

