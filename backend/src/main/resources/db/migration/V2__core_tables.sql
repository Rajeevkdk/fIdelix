create table if not exists customers (
  id bigserial primary key,
  full_name varchar(200) not null,
  phone varchar(50) not null,
  address varchar(300) not null,
  pan_vat varchar(50),
  created_at timestamptz not null default now()
);

create table if not exists receipts (
  id bigserial primary key,
  receipt_no varchar(30) not null unique,         -- FGL-YYYYMM-0001
  receipt_yyyymm varchar(6) not null,
  receipt_seq int not null,
  receipt_date timestamptz not null default now(),

  currency varchar(10) not null default 'NPR',
  payment_mode varchar(20) not null,              -- CASH/BANK/ONLINE
  payment_status varchar(10) not null,            -- PAID/DUE

  subtotal numeric(12,2) not null,
  discount numeric(12,2) not null default 0,
  grand_total numeric(12,2) not null,
  due_amount numeric(12,2) not null default 0,

  issued_by varchar(100) not null,

  customer_id bigint not null references customers(id)
);

create table if not exists receipt_items (
  id bigserial primary key,
  receipt_id bigint not null references receipts(id) on delete cascade,
  sn int not null,
  description varchar(300) not null,
  qty numeric(12,2) not null,
  rate numeric(12,2) not null,
  amount numeric(12,2) not null
);

create table if not exists shipments (
  id bigserial primary key,
  tracking_no varchar(30) not null unique,         -- FGL-YYYYMM-00001
  tracking_yyyymm varchar(6) not null,
  tracking_seq int not null,
  created_at timestamptz not null default now(),

  receipt_id bigint not null references receipts(id),

  shipment_type varchar(20) not null,              -- DOCUMENT/PARCEL/CARGO
  service_type varchar(20),                        -- AIR/SURFACE/EXPRESS/ECONOMY
  weight_kg numeric(12,3),
  pieces int not null default 1,
  notes varchar(500),

  receiver_name varchar(200) not null,
  receiver_phone varchar(50) not null,
  receiver_address varchar(300) not null,
  receiver_city_country varchar(200) not null,
  receiver_postal_code varchar(20) not null,
  receiver_email varchar(200)
);

create table if not exists tracking_events (
  id bigserial primary key,
  shipment_id bigint not null references shipments(id) on delete cascade,
  status varchar(40) not null,
  location varchar(200),
  note varchar(300),
  event_time timestamptz not null default now(),
  updated_by varchar(100) not null
);

create index if not exists idx_shipments_tracking_no on shipments(tracking_no);
create index if not exists idx_receipts_receipt_no on receipts(receipt_no);
create index if not exists idx_customers_phone on customers(phone);
create index if not exists idx_tracking_events_ship_time on tracking_events(shipment_id, event_time);