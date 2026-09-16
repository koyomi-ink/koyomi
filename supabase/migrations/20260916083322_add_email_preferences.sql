-- 1. Add personal notification toggles for the artist
alter table artists
add column notification_preferences jsonb default '{
  "email_new_request": true,
  "email_booking_cancelled": true,
  "email_client_message": true,
  "email_daily_digest": false
}'::jsonb;

-- 2. Add client communication rules for the studio
alter table studios
add column client_communication_settings jsonb default '{
  "reminders": {
    "enabled": true,
    "schedule_hours_before": [48, 24],
    "template_mode": "default",
    "custom_text": null
  },
  "follow_ups": {
    "enabled": true,
    "schedule_days_after": [14],
    "template_mode": "default",
    "custom_text": null
  }
}'::jsonb;