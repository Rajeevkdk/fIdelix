create table if not exists users (
  id bigserial primary key,
  username varchar(80) not null unique,
  full_name varchar(150) not null,
  password_hash varchar(200) not null,
  role varchar(30) not null, -- SUPER_ADMIN, STAFF
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);