create policy "authenticated users create companies"
  on public.companies
  for insert
  with check (
    auth.role() = 'service_role'
    or auth.uid() is not null
  );

create policy "users create self profile"
  on public.profiles
  for insert
  with check (auth.uid() = id);
