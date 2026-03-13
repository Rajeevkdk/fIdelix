create table if not exists monthly_counters (
  key varchar(40) primary key,
  current_value int not null,
  updated_at timestamptz not null default now()
);
