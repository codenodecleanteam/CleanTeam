create or replace function public.create_company_with_owner(
  p_company_name text,
  p_owner_name text default null,
  p_owner_email text default null,
  p_language public.language_code default 'en'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_company_id uuid;
  owner_id uuid := auth.uid();
  final_email text;
  final_name text;
  final_language public.language_code := coalesce(p_language, 'en'::public.language_code);
begin
  if owner_id is null then
    raise exception 'Usuário precisa estar autenticado para criar a empresa';
  end if;

  select email into final_email
  from auth.users
  where id = owner_id;

  final_email := coalesce(p_owner_email, final_email);

  if final_email is null then
    raise exception 'Endereço de e-mail obrigatório para criar o perfil';
  end if;

  final_name := coalesce(
    nullif(btrim(p_owner_name), ''),
    split_part(final_email, '@', 1)
  );

  if coalesce(nullif(btrim(p_company_name), ''), null) is null then
    raise exception 'Nome da empresa obrigatório';
  end if;

  if exists (
    select 1
    from public.profiles p
    where p.id = owner_id
      and p.company_id is not null
  ) then
    raise exception 'Usuário já possui empresa vinculada';
  end if;

  insert into public.companies (name)
    values (p_company_name)
    returning id into new_company_id;

  insert into public.profiles (id, company_id, role, name, email, language)
    values (owner_id, new_company_id, 'owner', final_name, final_email, final_language)
  on conflict (id) do update
    set company_id = excluded.company_id,
        role = excluded.role,
        name = excluded.name,
        email = excluded.email,
        language = excluded.language,
        updated_at = timezone('utc'::text, now());

  return new_company_id;
end;
$$;
