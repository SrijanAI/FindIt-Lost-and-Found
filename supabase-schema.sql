-- ============================================
-- FindIt: Lost & Found Matcher - Database Schema
-- Run this in Supabase SQL Editor
-- Safe to re-run: uses DROP IF EXISTS + IF NOT EXISTS
-- ============================================

-- 1. CLEAN SLATE: Drop everything in reverse dependency order
DROP FUNCTION IF EXISTS notify_new_message() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS find_matches_for_item(UUID) CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TYPE IF EXISTS item_category;
DROP TYPE IF EXISTS item_status;
DROP TYPE IF EXISTS item_type;

-- 2. ENUMS
CREATE TYPE item_type AS ENUM ('lost', 'found');
CREATE TYPE item_status AS ENUM ('open', 'matched', 'resolved', 'closed');
CREATE TYPE item_category AS ENUM (
  'electronics', 'documents', 'clothing', 'accessories',
  'keys', 'bags', 'bottles', 'books', 'other'
);

-- 3. PROFILES TABLE
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  college_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles readable" ON profiles FOR SELECT USING (true);
CREATE POLICY "Own profile insertable" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Own profile editable" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on signup (SECURITY DEFINER bypasses RLS)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 4. ITEMS TABLE
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type item_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category item_category NOT NULL,
  tags TEXT[] DEFAULT '{}',
  date_occurred DATE NOT NULL,
  location_name TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  image_urls TEXT[] DEFAULT '{}',
  status item_status DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_items_type ON items(type);
CREATE INDEX idx_items_category ON items(category);
CREATE INDEX idx_items_status ON items(status);
CREATE INDEX idx_items_tags ON items USING GIN(tags);
CREATE INDEX idx_items_date ON items(date_occurred);

ALTER TABLE items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Items readable" ON items FOR SELECT USING (true);
CREATE POLICY "Own items insertable" ON items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own items updatable" ON items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Own items deletable" ON items FOR DELETE USING (auth.uid() = user_id);

-- 5. MATCHES TABLE
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lost_item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  found_item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  score REAL NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(lost_item_id, found_item_id)
);

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Matches readable" ON matches FOR SELECT USING (true);
CREATE POLICY "Matches insertable" ON matches FOR INSERT WITH CHECK (true);
CREATE POLICY "Matches updatable" ON matches FOR UPDATE USING (true);

-- 6. CONVERSATIONS TABLE
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  participant_1 UUID NOT NULL REFERENCES profiles(id),
  participant_2 UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants can read conversations" ON conversations
  FOR SELECT USING (auth.uid() = participant_1 OR auth.uid() = participant_2);
CREATE POLICY "Participants can create conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- 7. MESSAGES TABLE
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants read messages" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
      AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
    )
  );
CREATE POLICY "Participants send messages" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
      AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
    )
  );
CREATE POLICY "Participants update messages" ON messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
      AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
    )
  );

-- 8. NOTIFICATIONS TABLE
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own notifications readable" ON notifications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Own notifications updatable" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Notifications insertable" ON notifications
  FOR INSERT WITH CHECK (true);

-- 9. MATCHING FUNCTION
CREATE OR REPLACE FUNCTION find_matches_for_item(new_item_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  new_item RECORD;
  candidate RECORD;
  match_score REAL;
  tag_overlap INT;
  tag_total INT;
  date_score REAL;
  location_score REAL;
  day_diff INT;
  dist_km REAL;
BEGIN
  SELECT * INTO new_item FROM items WHERE id = new_item_id;

  IF new_item IS NULL THEN RETURN; END IF;

  FOR candidate IN
    SELECT * FROM items
    WHERE type != new_item.type
    AND status = 'open'
    AND category = new_item.category
    AND id != new_item_id
  LOOP
    -- Tag overlap (Jaccard similarity)
    SELECT COUNT(*) INTO tag_overlap
    FROM unnest(new_item.tags) t1
    INNER JOIN unnest(candidate.tags) t2 ON LOWER(t1) = LOWER(t2);

    SELECT COUNT(DISTINCT LOWER(t)) INTO tag_total FROM (
      SELECT unnest(new_item.tags) AS t
      UNION
      SELECT unnest(candidate.tags)
    ) combined;

    -- Date proximity
    day_diff := ABS(new_item.date_occurred - candidate.date_occurred);
    IF day_diff <= 7 THEN
      date_score := 1.0;
    ELSIF day_diff <= 30 THEN
      date_score := 1.0 - ((day_diff - 7)::REAL / 23.0);
    ELSE
      date_score := 0.0;
    END IF;

    -- Location proximity
    IF new_item.latitude IS NOT NULL AND candidate.latitude IS NOT NULL THEN
      dist_km := 111.0 * SQRT(
        POWER(new_item.latitude - candidate.latitude, 2) +
        POWER((new_item.longitude - candidate.longitude) * COS(RADIANS(new_item.latitude)), 2)
      );
      IF dist_km <= 0.1 THEN
        location_score := 1.0;
      ELSIF dist_km <= 0.5 THEN
        location_score := 0.7;
      ELSIF dist_km <= 2.0 THEN
        location_score := 0.3;
      ELSE
        location_score := 0.0;
      END IF;
    ELSE
      location_score := 0.5;
    END IF;

    -- Combined score
    match_score := (
      0.35 * (CASE WHEN tag_total > 0 THEN tag_overlap::REAL / tag_total ELSE 0 END) +
      0.25 * 1.0 +
      0.20 * date_score +
      0.20 * location_score
    );

    -- Store matches above threshold
    IF match_score > 0.4 THEN
      INSERT INTO matches (lost_item_id, found_item_id, score)
      VALUES (
        CASE WHEN new_item.type = 'lost' THEN new_item.id ELSE candidate.id END,
        CASE WHEN new_item.type = 'found' THEN new_item.id ELSE candidate.id END,
        match_score
      )
      ON CONFLICT (lost_item_id, found_item_id) DO UPDATE SET score = EXCLUDED.score;

      -- Notify the other user
      INSERT INTO notifications (user_id, type, title, body, link)
      VALUES (
        candidate.user_id,
        'new_match',
        'Great news — we found a match!',
        'An item matching your "' || candidate.title || '" was reported.',
        '/dashboard/matches'
      );
    END IF;
  END LOOP;
END;
$$;

-- 10. MESSAGE NOTIFICATION TRIGGER
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  conv RECORD;
  recipient UUID;
BEGIN
  SELECT * INTO conv FROM conversations WHERE id = NEW.conversation_id;
  recipient := CASE
    WHEN conv.participant_1 = NEW.sender_id THEN conv.participant_2
    ELSE conv.participant_1
  END;

  INSERT INTO notifications (user_id, type, title, body, link)
  VALUES (recipient, 'new_message', 'New message', LEFT(NEW.content, 50), '/chat/' || NEW.conversation_id);

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_message
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION notify_new_message();

-- 11. ENABLE REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- 12. STORAGE BUCKET (run in Supabase dashboard or via API)
-- Create bucket: item-images
-- Public: true
-- Allowed MIME types: image/jpeg, image/png, image/webp
-- Max file size: 5MB
