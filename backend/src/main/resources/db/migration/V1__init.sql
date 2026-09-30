-- Soft multi-tenant schema: every business row belongs to a user.

create table users (
    id            uuid primary key,
    email         varchar(120) not null unique,
    password_hash varchar(100) not null,
    display_name  varchar(120) not null,
    created_at    timestamptz  not null
);

create table clients (
    id         uuid primary key,
    user_id    uuid         not null references users (id) on delete cascade,
    name       varchar(200) not null,
    nip        varchar(20),
    email      varchar(120),
    address    varchar(300),
    created_at timestamptz  not null,
    updated_at timestamptz  not null
);

create index idx_clients_user_name on clients (user_id, lower(name));

create table invoices (
    id          uuid primary key,
    user_id     uuid           not null references users (id) on delete cascade,
    client_id   uuid           not null references clients (id),
    number      varchar(40)    not null,
    status      varchar(20)    not null,
    issue_date  date           not null,
    due_date    date           not null,
    net_total   numeric(14, 2) not null,
    vat_total   numeric(14, 2) not null,
    gross_total numeric(14, 2) not null,
    notes       varchar(500),
    created_at  timestamptz    not null,
    updated_at  timestamptz    not null,
    constraint uq_invoices_user_number unique (user_id, number)
);

create index idx_invoices_user_status on invoices (user_id, status);
create index idx_invoices_user_issue_date on invoices (user_id, issue_date);
create index idx_invoices_user_due_date on invoices (user_id, due_date);

create table invoice_items (
    id             uuid primary key,
    invoice_id     uuid           not null references invoices (id) on delete cascade,
    position_asc   int            not null,
    description    varchar(300)   not null,
    quantity       numeric(12, 3) not null,
    unit_net_price numeric(14, 2) not null,
    vat_rate       numeric(5, 2)  not null
);

create index idx_invoice_items_invoice on invoice_items (invoice_id, position_asc);
