-- Create friendships table
CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  -- Ensure unique friendship pairs (unidirectional)
  CONSTRAINT unique_friendship UNIQUE (user_id, friend_id),
  -- Prevent self-friendship
  CONSTRAINT no_self_friendship CHECK (user_id != friend_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON public.friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend_id ON public.friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON public.friendships(status);
CREATE INDEX IF NOT EXISTS idx_friendships_user_status ON public.friendships(user_id, status);

-- Enable Row Level Security
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can view their own friendships (both as user_id and friend_id)
CREATE POLICY "Users can view their own friendships"
  ON public.friendships
  FOR SELECT
  USING (
    auth.uid() = user_id OR auth.uid() = friend_id
  );

-- Users can create friend requests (as user_id)
CREATE POLICY "Users can send friend requests"
  ON public.friendships
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND status = 'pending'
  );

-- Users can update friendships where they are the recipient (friend_id)
-- This allows accepting, rejecting, or blocking requests
CREATE POLICY "Users can respond to friend requests"
  ON public.friendships
  FOR UPDATE
  USING (
    auth.uid() = friend_id
  )
  WITH CHECK (
    auth.uid() = friend_id
  );

-- Users can delete friendships where they are involved (either user_id or friend_id)
CREATE POLICY "Users can delete their friendships"
  ON public.friendships
  FOR DELETE
  USING (
    auth.uid() = user_id OR auth.uid() = friend_id
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_friendships_updated_at
  BEFORE UPDATE ON public.friendships
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to prevent duplicate bidirectional friendships
CREATE OR REPLACE FUNCTION prevent_duplicate_friendship()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if reverse friendship already exists
  IF EXISTS (
    SELECT 1 FROM public.friendships
    WHERE user_id = NEW.friend_id AND friend_id = NEW.user_id
  ) THEN
    RAISE EXCEPTION 'Friendship already exists in reverse direction';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to prevent duplicate bidirectional friendships
CREATE TRIGGER prevent_duplicate_friendship_trigger
  BEFORE INSERT ON public.friendships
  FOR EACH ROW
  EXECUTE FUNCTION prevent_duplicate_friendship();

