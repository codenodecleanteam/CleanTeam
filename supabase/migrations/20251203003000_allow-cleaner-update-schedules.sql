create policy "assigned cleaners update schedules"
  on public.schedules
  for update
  using (
    exists (
      select 1
      from public.cleaners c
      where c.profile_id = auth.uid()
        and c.company_id = schedules.company_id
        and c.id in (schedules.drive_id, schedules.helper1_id, schedules.helper2_id)
    )
  )
  with check (
    exists (
      select 1
      from public.cleaners c
      where c.profile_id = auth.uid()
        and c.company_id = schedules.company_id
        and c.id in (schedules.drive_id, schedules.helper1_id, schedules.helper2_id)
    )
  );
