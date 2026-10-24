CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS login_otps (
  email VARCHAR(255) PRIMARY KEY,
  code_hash BYTEA NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts SMALLINT NOT NULL DEFAULT 0,
  last_sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  person_name VARCHAR(120) NOT NULL,
  title VARCHAR(160) NOT NULL DEFAULT '',
  event_type VARCHAR(40) NOT NULL DEFAULT 'Custom',
  custom_type VARCHAR(60) NOT NULL DEFAULT '',
  event_date DATE NOT NULL,
  repeat_yearly BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT NOT NULL DEFAULT '',
  reminders INTEGER[] NOT NULL DEFAULT ARRAY[1,7],
  contact_phone VARCHAR(80) NOT NULL DEFAULT '',
  contact_email VARCHAR(255) NOT NULL DEFAULT '',
  social_url TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (event_type IN ('Birthday','Anniversary','Wedding','Graduation','Work','Festival','Custom'))
);
ALTER TABLE events ADD COLUMN IF NOT EXISTS custom_type VARCHAR(60) NOT NULL DEFAULT '';
ALTER TABLE events ADD COLUMN IF NOT EXISTS instagram_url TEXT NOT NULL DEFAULT '';
ALTER TABLE events ADD COLUMN IF NOT EXISTS facebook_url TEXT NOT NULL DEFAULT '';
ALTER TABLE events ADD COLUMN IF NOT EXISTS linkedin_url TEXT NOT NULL DEFAULT '';
ALTER TABLE events ADD COLUMN IF NOT EXISTS snapchat_url TEXT NOT NULL DEFAULT '';
CREATE INDEX IF NOT EXISTS events_user_date_idx ON events(user_id, event_date);

CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  theme VARCHAR(8) NOT NULL DEFAULT 'light' CHECK (theme IN ('light','dark')),
  reminders_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  action VARCHAR(40) NOT NULL DEFAULT 'event_saved',
  UNIQUE(user_id, activity_date, action)
);

CREATE TABLE IF NOT EXISTS badge_definitions (
  id VARCHAR(40) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  requirement JSONB NOT NULL
);
INSERT INTO badge_definitions(id,name,requirement) VALUES
 ('first-steps','First Steps','{"events":1}'),
 ('consistent','Consistent','{"streak":7}'),
 ('celebrant','Celebrant','{"events":5}'),
 ('collector','Collector','{"events":10}'),
 ('dedicated','Dedicated','{"events":30}'),
 ('party-starter','Party Starter','{"events":25}'),
 ('wishful','Wishful','{"wishes":10}'),
 ('anniversary-pro','Anniversary Pro','{"anniversaries":5}'),
 ('memory-master','Memory Master','{"events":50}'),
 ('champion','Champion','{"events":100}'),
 ('legendary','Legendary','{"events":365}')
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, requirement=EXCLUDED.requirement;
CREATE TABLE IF NOT EXISTS user_badges (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id VARCHAR(40) NOT NULL REFERENCES badge_definitions(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY(user_id, badge_id)
);
