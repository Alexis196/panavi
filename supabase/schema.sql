-- ============================================================
-- PANAVI - Esquema de base de datos Supabase
-- ============================================================

-- Habilitar extensión UUID
create extension if not exists "uuid-ossp";

-- ============================================================
-- ENUM TYPES
-- ============================================================

create type role_tipo as enum ('cliente', 'admin');
create type estado_pedido as enum ('pendiente', 'confirmado', 'entregado', 'cancelado');
create type tipo_mov_stock as enum ('entrada', 'salida');
create type tipo_mov_cuenta as enum ('debito', 'credito');

-- ============================================================
-- TABLA: profiles
-- ============================================================

create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  phone text,
  role role_tipo not null default 'cliente',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Trigger para crear perfil automáticamente al registrarse
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    'cliente'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- TABLA: productos
-- ============================================================

create table public.productos (
  id uuid primary key default uuid_generate_v4(),
  nombre text not null,
  descripcion text,
  precio numeric(10,2) not null default 0,
  categoria text not null,
  imagen_url text,
  activo boolean not null default true,
  stock_actual integer not null default 0,
  stock_minimo integer not null default 5
);

alter table public.productos enable row level security;

-- ============================================================
-- TABLA: pedidos
-- ============================================================

create table public.pedidos (
  id uuid primary key default uuid_generate_v4(),
  cliente_id uuid references public.profiles(id) on delete restrict not null,
  fecha timestamptz not null default now(),
  estado estado_pedido not null default 'pendiente',
  total numeric(10,2) not null default 0,
  notas text
);

alter table public.pedidos enable row level security;

-- ============================================================
-- TABLA: detalle_pedidos
-- ============================================================

create table public.detalle_pedidos (
  id uuid primary key default uuid_generate_v4(),
  pedido_id uuid references public.pedidos(id) on delete cascade not null,
  producto_id uuid references public.productos(id) on delete restrict not null,
  cantidad integer not null check (cantidad > 0),
  precio_unitario numeric(10,2) not null
);

alter table public.detalle_pedidos enable row level security;

-- ============================================================
-- TABLA: gastos
-- ============================================================

create table public.gastos (
  id uuid primary key default uuid_generate_v4(),
  descripcion text not null,
  monto numeric(10,2) not null,
  categoria text not null,
  fecha timestamptz not null default now(),
  registrado_por uuid references public.profiles(id) on delete restrict not null
);

alter table public.gastos enable row level security;

-- ============================================================
-- TABLA: movimientos_stock
-- ============================================================

create table public.movimientos_stock (
  id uuid primary key default uuid_generate_v4(),
  producto_id uuid references public.productos(id) on delete cascade not null,
  tipo tipo_mov_stock not null,
  cantidad integer not null check (cantidad > 0),
  motivo text,
  fecha timestamptz not null default now()
);

alter table public.movimientos_stock enable row level security;

-- Trigger para actualizar stock en productos
create or replace function public.actualizar_stock()
returns trigger language plpgsql security definer
as $$
begin
  if new.tipo = 'entrada' then
    update public.productos
    set stock_actual = stock_actual + new.cantidad
    where id = new.producto_id;
  else
    update public.productos
    set stock_actual = greatest(0, stock_actual - new.cantidad)
    where id = new.producto_id;
  end if;
  return new;
end;
$$;

create trigger on_movimiento_stock
  after insert on public.movimientos_stock
  for each row execute procedure public.actualizar_stock();

-- ============================================================
-- TABLA: cuentas_corrientes
-- ============================================================

create table public.cuentas_corrientes (
  id uuid primary key default uuid_generate_v4(),
  cliente_id uuid references public.profiles(id) on delete cascade not null unique,
  saldo numeric(10,2) not null default 0,
  ultima_actualizacion timestamptz not null default now()
);

alter table public.cuentas_corrientes enable row level security;

-- ============================================================
-- TABLA: movimientos_cuenta
-- ============================================================

create table public.movimientos_cuenta (
  id uuid primary key default uuid_generate_v4(),
  cuenta_id uuid references public.cuentas_corrientes(id) on delete cascade not null,
  tipo tipo_mov_cuenta not null,
  monto numeric(10,2) not null,
  descripcion text,
  fecha timestamptz not null default now()
);

alter table public.movimientos_cuenta enable row level security;

-- Trigger para actualizar saldo en cuenta corriente
create or replace function public.actualizar_saldo_cuenta()
returns trigger language plpgsql security definer
as $$
begin
  if new.tipo = 'debito' then
    update public.cuentas_corrientes
    set saldo = saldo - new.monto, ultima_actualizacion = now()
    where id = new.cuenta_id;
  else
    update public.cuentas_corrientes
    set saldo = saldo + new.monto, ultima_actualizacion = now()
    where id = new.cuenta_id;
  end if;
  return new;
end;
$$;

create trigger on_movimiento_cuenta
  after insert on public.movimientos_cuenta
  for each row execute procedure public.actualizar_saldo_cuenta();

-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

-- Helper: verificar si el usuario es admin
create or replace function public.is_admin()
returns boolean language sql security definer
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- PROFILES
create policy "Usuarios ven su propio perfil" on public.profiles
  for select using (auth.uid() = id);

create policy "Admin ve todos los perfiles" on public.profiles
  for select using (public.is_admin());

create policy "Usuario actualiza su perfil" on public.profiles
  for update using (auth.uid() = id);

create policy "Admin actualiza cualquier perfil" on public.profiles
  for update using (public.is_admin());

-- PRODUCTOS (lectura pública, escritura solo admin)
create policy "Todos ven productos activos" on public.productos
  for select using (activo = true or public.is_admin());

create policy "Admin gestiona productos" on public.productos
  for all using (public.is_admin());

-- PEDIDOS
create policy "Cliente ve sus pedidos" on public.pedidos
  for select using (auth.uid() = cliente_id);

create policy "Admin ve todos los pedidos" on public.pedidos
  for select using (public.is_admin());

create policy "Cliente crea pedidos propios" on public.pedidos
  for insert with check (auth.uid() = cliente_id);

create policy "Admin gestiona pedidos" on public.pedidos
  for all using (public.is_admin());

-- DETALLE_PEDIDOS
create policy "Cliente ve detalles de sus pedidos" on public.detalle_pedidos
  for select using (
    exists (
      select 1 from public.pedidos p
      where p.id = pedido_id and p.cliente_id = auth.uid()
    )
  );

create policy "Admin ve todos los detalles" on public.detalle_pedidos
  for select using (public.is_admin());

create policy "Admin gestiona detalles" on public.detalle_pedidos
  for all using (public.is_admin());

-- GASTOS (solo admin)
create policy "Admin gestiona gastos" on public.gastos
  for all using (public.is_admin());

-- MOVIMIENTOS_STOCK (solo admin)
create policy "Admin gestiona stock" on public.movimientos_stock
  for all using (public.is_admin());

-- CUENTAS_CORRIENTES
create policy "Cliente ve su cuenta" on public.cuentas_corrientes
  for select using (auth.uid() = cliente_id);

create policy "Admin gestiona cuentas" on public.cuentas_corrientes
  for all using (public.is_admin());

-- MOVIMIENTOS_CUENTA
create policy "Cliente ve movimientos de su cuenta" on public.movimientos_cuenta
  for select using (
    exists (
      select 1 from public.cuentas_corrientes cc
      where cc.id = cuenta_id and cc.cliente_id = auth.uid()
    )
  );

create policy "Admin gestiona movimientos" on public.movimientos_cuenta
  for all using (public.is_admin());

-- ============================================================
-- STORAGE: bucket para imágenes de productos
-- ============================================================

insert into storage.buckets (id, name, public) values ('productos', 'productos', true);

create policy "Imágenes de productos son públicas" on storage.objects
  for select using (bucket_id = 'productos');

create policy "Admin sube imágenes" on storage.objects
  for insert with check (bucket_id = 'productos' and public.is_admin());

create policy "Admin elimina imágenes" on storage.objects
  for delete using (bucket_id = 'productos' and public.is_admin());

-- ============================================================
-- DATOS INICIALES (productos de ejemplo)
-- ============================================================

insert into public.productos (nombre, descripcion, precio, categoria, activo, stock_actual, stock_minimo) values
  ('Pan Francés', 'Clásico pan francés de corteza crujiente y miga tierna', 500, 'Panes', true, 50, 20),
  ('Medialunas', 'Medialunas de manteca, receta artesanal', 800, 'Facturas', true, 30, 15),
  ('Torta de Cumpleaños', 'Torta personalizada para celebraciones', 8500, 'Tortas', true, 5, 2),
  ('Facturas Surtidas', 'Surtido de facturas artesanales (docena)', 2400, 'Facturas', true, 20, 8),
  ('Pan Integral', 'Pan de harina integral con semillas', 650, 'Panes', true, 25, 10),
  ('Budín de Pan', 'Budín casero con pasas de uva', 1200, 'Dulces', true, 10, 4),
  ('Chipas', 'Chipas tradicionales del NEA con queso', 900, 'Salados', true, 40, 15),
  ('Pan Lactal Artesanal', 'Pan de molde artesanal sin conservantes', 750, 'Panes', true, 20, 8);
