alter table shipments add column if not exists forwarding_tracking_no varchar(255);
alter table shipments add column if not exists forwarding_tracking_url varchar(1000);