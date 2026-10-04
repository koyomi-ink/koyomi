begin;

create extension if not exists pgtap
with schema extensions;

select plan(4);

select has_table(
  'public',
  'studios',
  'studios table should exist'
);

select has_table(
  'public',
  'artists',
  'artists table should exist'
);

select has_table(
  'public',
  'studio_settings',
  'studio_settings table should exist'
);

select has_function(
  'public',
  'complete_onboarding',
  array['text', 'text', 'text', 'text'],
  'complete_onboarding(text, text, text, text) should exist'
);

select * from finish();

rollback;