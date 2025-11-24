-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create events table
create table public.events (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  type text not null check (type in ('league', 'tournament')),
  bowling_alley text not null,
  status text not null default 'active' check (status in ('active', 'completed')),
  created_at timestamptz default now() not null
);

-- Create sessions table
create table public.sessions (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  date timestamptz not null,
  games_count integer not null,
  created_at timestamptz default now() not null
);

-- Create games table
create table public.games (
  id uuid default uuid_generate_v4() primary key,
  session_id uuid references public.sessions(id) on delete cascade not null,
  game_number integer not null,
  score integer not null,
  created_at timestamptz default now() not null
);

-- Create frames table
create table public.frames (
  id uuid default uuid_generate_v4() primary key,
  game_id uuid references public.games(id) on delete cascade not null,
  frame_number integer not null check (frame_number between 1 and 10),
  ball1 integer not null,
  ball2 integer,
  ball3 integer,
  ball1_pins integer[] not null default '{}',
  ball2_pins integer[],
  ball3_pins integer[],
  is_split boolean default false not null
);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
alter table public.events enable row level security;
alter table public.sessions enable row level security;
alter table public.games enable row level security;
alter table public.frames enable row level security;

-- Events policies
create policy "Users can view their own events"
  on public.events for select
  using (auth.uid() = user_id);

create policy "Users can create their own events"
  on public.events for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own events"
  on public.events for update
  using (auth.uid() = user_id);

create policy "Users can delete their own events"
  on public.events for delete
  using (auth.uid() = user_id);

-- Sessions policies
create policy "Users can view sessions for their events"
  on public.sessions for select
  using (
    exists (
      select 1 from public.events
      where events.id = sessions.event_id
      and events.user_id = auth.uid()
    )
  );

create policy "Users can create sessions for their events"
  on public.sessions for insert
  with check (
    exists (
      select 1 from public.events
      where events.id = sessions.event_id
      and events.user_id = auth.uid()
    )
  );

create policy "Users can update sessions for their events"
  on public.sessions for update
  using (
    exists (
      select 1 from public.events
      where events.id = sessions.event_id
      and events.user_id = auth.uid()
    )
  );

create policy "Users can delete sessions for their events"
  on public.sessions for delete
  using (
    exists (
      select 1 from public.events
      where events.id = sessions.event_id
      and events.user_id = auth.uid()
    )
  );

-- Games policies
create policy "Users can view games for their sessions"
  on public.games for select
  using (
    exists (
      select 1 from public.sessions
      join public.events on events.id = sessions.event_id
      where sessions.id = games.session_id
      and events.user_id = auth.uid()
    )
  );

create policy "Users can create games for their sessions"
  on public.games for insert
  with check (
    exists (
      select 1 from public.sessions
      join public.events on events.id = sessions.event_id
      where sessions.id = games.session_id
      and events.user_id = auth.uid()
    )
  );

create policy "Users can update games for their sessions"
  on public.games for update
  using (
    exists (
      select 1 from public.sessions
      join public.events on events.id = sessions.event_id
      where sessions.id = games.session_id
      and events.user_id = auth.uid()
    )
  );

create policy "Users can delete games for their sessions"
  on public.games for delete
  using (
    exists (
      select 1 from public.sessions
      join public.events on events.id = sessions.event_id
      where sessions.id = games.session_id
      and events.user_id = auth.uid()
    )
  );

-- Frames policies
create policy "Users can view frames for their games"
  on public.frames for select
  using (
    exists (
      select 1 from public.games
      join public.sessions on sessions.id = games.session_id
      join public.events on events.id = sessions.event_id
      where games.id = frames.game_id
      and events.user_id = auth.uid()
    )
  );

create policy "Users can create frames for their games"
  on public.frames for insert
  with check (
    exists (
      select 1 from public.games
      join public.sessions on sessions.id = games.session_id
      join public.events on events.id = sessions.event_id
      where games.id = frames.game_id
      and events.user_id = auth.uid()
    )
  );

create policy "Users can update frames for their games"
  on public.frames for update
  using (
    exists (
      select 1 from public.games
      join public.sessions on sessions.id = games.session_id
      join public.events on events.id = sessions.event_id
      where games.id = frames.game_id
      and events.user_id = auth.uid()
    )
  );

create policy "Users can delete frames for their games"
  on public.frames for delete
  using (
    exists (
      select 1 from public.games
      join public.sessions on sessions.id = games.session_id
      join public.events on events.id = sessions.event_id
      where games.id = frames.game_id
      and events.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
create index events_user_id_idx on public.events(user_id);
create index sessions_event_id_idx on public.sessions(event_id);
create index games_session_id_idx on public.games(session_id);
create index frames_game_id_idx on public.frames(game_id);
