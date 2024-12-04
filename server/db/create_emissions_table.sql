create or replace function create_emissions_table()
returns void
language plpgsql
security definer
as $$
begin
  -- Drop existing table if it exists
  drop table if exists emissions cascade;

  -- Create emissions table
  create table emissions (
    id bigint primary key generated always as identity,
    company_name text not null,
    scope integer not null check (scope in (1, 2, 3)),
    category text not null,
    value decimal not null check (value >= 0),
    year integer not null default extract(year from current_date),
    created_at timestamptz not null default current_timestamp,
    updated_at timestamptz not null default current_timestamp
  );

  -- Create indexes
  create index idx_emissions_company on emissions(company_name);
  create index idx_emissions_scope on emissions(scope);
  create index idx_emissions_category on emissions(category);
end;
$$;
