# Project & Expense Management Application
## Supabase Backend Migration Plan (Production-Grade)

---

## 1. Purpose
This document defines the production-ready backend migration plan for the Project & Expense Management Application, built using Supabase.

It complements the existing frontend-only implementation and provides:

- Secure backend architecture  
- Project-centric financial enforcement  
- Role-based access control (Owner / Supervisor)  
- Safe, phased migration  
- Industry-standard security hardening  
- Audit-ready financial data handling  

**This file is the single source of truth for backend implementation.**

---

## 2. Non-Negotiable Design Principles

- Project is the root entity  
- Expenses always belong to a project  
- No global expense records  
- Company totals are derived, never stored  
- Supervisors never see profit/loss  
- Owners see all financial data  
- No direct table writes from frontend  
- Audit logs are append-only and enforced  

Violating any of these is considered a design failure.

---

## 3. Supabase Stack Usage

| Component | Usage |
|--------|------|
| Supabase Auth | Authentication & identity |
| PostgreSQL | Primary datastore |
| RLS | Authorization enforcement |
| SQL Functions (RPC) | Controlled writes |
| Views (Security Barrier) | Financial reads |
| Triggers | Audit enforcement |
| Edge Functions (future) | Exports (PDF / Excel / CSV) |

Frontend never decides permissions — backend is authoritative.

---

## 4. Migration Strategy (Phased & Safe)

**Phase 0 – Frontend Only**  
Local / mock data

**Phase 1 – Auth & Roles**  
Profiles table + role mapping

**Phase 2 – Project Read APIs**  
Read-only backend

**Phase 3 – Expense Read (Shadow Mode)**  
Backend totals, frontend comparison

**Phase 4 – Expense Writes via RPC**  
No direct inserts

**Phase 5 – Financial Authority Migration**  
Backend is single source of truth

**Phase 6 – Reports & Exports**  
Edge Functions + signed URLs

**Phase 7 – Hardening & Compliance**  
RLS tightening, monitoring, audit review

---

## 5. Database Schema (Production)

### 5.1 Profiles
```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('owner', 'supervisor')),
  created_at timestamptz default now()
);
```

### 5.2 Projects
```sql
create table projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null,
  due_date date,
  budget numeric,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);
```

### 5.3 Expenses
```sql
create table expenses (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  amount numeric not null check (amount > 0),
  category text not null,
  expense_date date not null,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);
```

### 5.4 Audit Logs
```sql
create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  action text not null,
  entity text not null,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz default now()
);
```

---

## 6. Row Level Security (RLS)

```sql
alter table profiles enable row level security;
alter table projects enable row level security;
alter table expenses enable row level security;
alter table audit_logs enable row level security;
```

---

## 7. RPC-Only Writes

```sql
create or replace function create_expense(
  p_project_id uuid,
  p_amount numeric,
  p_category text,
  p_expense_date date
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_role text;
  v_expense_id uuid;
begin
  select role into v_role
  from profiles
  where id = auth.uid();

  if v_role not in ('owner', 'supervisor') then
    raise exception 'Unauthorized';
  end if;

  insert into expenses (
    project_id,
    amount,
    category,
    expense_date,
    created_by
  )
  values (
    p_project_id,
    p_amount,
    p_category,
    p_expense_date,
    auth.uid()
  )
  returning id into v_expense_id;

  return v_expense_id;
end;
$$;
```

---

## 8. Audit Enforcement

```sql
create or replace function audit_expense_insert()
returns trigger
language plpgsql
as $$
begin
  insert into audit_logs (
    user_id,
    action,
    entity,
    entity_id,
    metadata
  )
  values (
    auth.uid(),
    'INSERT',
    'expense',
    new.id,
    row_to_json(new)
  );
  return new;
end;
$$;

create trigger expense_audit_trigger
after insert on expenses
for each row
execute function audit_expense_insert();
```

---

## 9. Seed Data (SQL)

> Run **after** schema + RLS setup  
> Use **real auth user UUIDs** in production

### 9.1 Profiles Seed
```sql
insert into profiles (id, full_name, role) values
('11111111-1111-1111-1111-111111111111', 'Owner One', 'owner'),
('22222222-2222-2222-2222-222222222222', 'Owner Two', 'owner'),
('33333333-3333-3333-3333-333333333333', 'Supervisor One', 'supervisor'),
('44444444-4444-4444-4444-444444444444', 'Supervisor Two', 'supervisor');
```

### 9.2 Projects Seed
```sql
insert into projects (id, name, status, due_date, budget, created_by) values
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Highway Expansion', 'active', '2026-06-30', 5000000, '11111111-1111-1111-1111-111111111111'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Bridge Construction', 'active', '2026-12-31', 3200000, '11111111-1111-1111-1111-111111111111'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Metro Survey', 'planning', '2026-03-31', 1200000, '22222222-2222-2222-2222-222222222222');
```

### 9.3 Expenses Seed
```sql
insert into expenses (project_id, amount, category, expense_date, created_by) values
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 120000, 'Materials', '2026-01-05', '33333333-3333-3333-3333-333333333333'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 85000, 'Labor', '2026-01-10', '33333333-3333-3333-3333-333333333333'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 95000, 'Machinery', '2026-01-12', '44444444-4444-4444-4444-444444444444'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 45000, 'Transport', '2026-01-15', '44444444-4444-4444-4444-444444444444'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 30000, 'Survey Equipment', '2026-01-20', '33333333-3333-3333-3333-333333333333');
```

---

## 10. Final Notes

- Backend is the **single source of truth**
- Financial integrity is enforced **server-side**
- Frontend remains **project-centric**
- Architecture is **production-grade & audit-ready**
