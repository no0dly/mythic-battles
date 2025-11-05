# Database Migrations

## Migration Order

**IMPORTANT**: Migrations must be applied in the following order:

1. `000_create_users_table.sql` - creates the users table
2. `001_create_friendships_table.sql` - creates the friendships table

## Users Table

### Overview
The `users` table contains extended user profiles. Records are automatically created upon registration via a trigger.

### Schema

#### Table: `users`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, references auth.users(id) |
| `email` | TEXT | User email |
| `display_name` | TEXT | User display name |
| `avatar_url` | TEXT | Avatar URL |
| `friends` | TEXT[] | Array of friend IDs (deprecated, use friendships table) |
| `statistics` | JSONB | User game statistics |
| `created_at` | TIMESTAMP | Profile creation date |
| `updated_at` | TIMESTAMP | Last update date |

### Statistics Structure

```json
{
  "wins": 0,
  "losses": 0,
  "total_games": 0,
  "win_rate": 0.0,
  "longest_win_streak": 0,
  "longest_loss_streak": 0
}
```

### RLS Policies

1. **View**: Everyone can view profiles (for friend search)
2. **Update**: Users can only update their own profile

### Auto-creation Trigger

When a new user registers in `auth.users`, a record is automatically created in `public.users` with:
- `id` from auth.users
- `email` from auth.users
- `display_name` from metadata or email

## Friendships Table

### Overview
The `friendships` table manages friendship relationships between users, including friend requests, accepted friendships, rejected requests, and blocks.

### Schema

#### Table: `friendships`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | ID of the user who initiated the request |
| `friend_id` | UUID | ID of the recipient user |
| `status` | TEXT | Relationship status: `pending`, `accepted`, `rejected`, `blocked` |
| `created_at` | TIMESTAMP | Record creation date |
| `updated_at` | TIMESTAMP | Last update date |

### Status Values

- **`pending`**: Friend request sent, awaiting response
- **`accepted`**: Request accepted, users became friends
- **`rejected`**: Request rejected
- **`blocked`**: User blocked

### Constraints

1. **Unique Friendship**: Prevents duplication of `(user_id, friend_id)` pair
2. **No Self Friendship**: Prevents user from adding themselves as a friend
3. **Prevent Duplicate Bidirectional**: Trigger prevents creation of reverse records (if A→B exists, cannot create B→A)

### Indexes

- `idx_friendships_user_id`: Fast search by initiator
- `idx_friendships_friend_id`: Fast search by recipient
- `idx_friendships_status`: Filter by status
- `idx_friendships_user_status`: Combined index for frequent queries

### RLS Policies

1. **View**: Users only see their own relationships (where they are user_id or friend_id)
2. **Insert**: Users can only send requests on their own behalf with `pending` status
3. **Update**: Users can only update requests where they are the recipient (friend_id)
4. **Delete**: Users can delete relationships where they participate

### Applying the Migrations

#### Using Supabase CLI:

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Apply all migrations
supabase db push

# Or apply specific migration
supabase migration up
```

#### Using Supabase Dashboard:

1. Open Supabase Dashboard
2. Navigate to SQL Editor section
3. **First** execute the contents of `000_create_users_table.sql`
4. **Then** execute the contents of `001_create_friendships_table.sql`

#### Manual Application:

```bash
# Connect to your database
psql postgresql://your-connection-string

# Run migration files in order
\i supabase/migrations/000_create_users_table.sql
\i supabase/migrations/001_create_friendships_table.sql
```

#### IMPORTANT: Creating profiles for existing users

If you already have users in `auth.users`, execute after migration:

```sql
-- Create profiles for all existing users
INSERT INTO public.users (id, email, display_name)
SELECT 
  id, 
  COALESCE(email, ''),
  COALESCE(raw_user_meta_data->>'display_name', SPLIT_PART(email, '@', 1), '')
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users);
```

### API Usage (tRPC)

After applying the migration, the following methods are available:

```typescript
// Get list of friends
const friends = await trpc.friendships.getFriends.query();

// Get incoming requests
const requests = await trpc.friendships.getPendingRequests.query();

// Get sent requests
const sentRequests = await trpc.friendships.getSentRequests.query();

// Send friend request
await trpc.friendships.sendRequest.mutate({
  friendEmail: "friend@example.com"
});

// Accept request
await trpc.friendships.acceptRequest.mutate({
  friendshipId: "uuid"
});

// Reject request
await trpc.friendships.rejectRequest.mutate({
  friendshipId: "uuid"
});

// Remove friend
await trpc.friendships.removeFriend.mutate({
  friendId: "uuid"
});

// Block user
await trpc.friendships.blockUser.mutate({
  userId: "uuid"
});
```

### Testing

Create test records:

```sql
-- Insert test friend request
INSERT INTO friendships (user_id, friend_id, status)
VALUES (
  'user-uuid-1',
  'user-uuid-2',
  'pending'
);

-- Accept request
UPDATE friendships
SET status = 'accepted'
WHERE user_id = 'user-uuid-1' AND friend_id = 'user-uuid-2';
```

### Rollback

If you need to rollback the migration:

```sql
-- Drop triggers
DROP TRIGGER IF EXISTS prevent_duplicate_friendship_trigger ON public.friendships;
DROP TRIGGER IF EXISTS update_friendships_updated_at ON public.friendships;

-- Drop functions
DROP FUNCTION IF EXISTS prevent_duplicate_friendship();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop table (this will also remove all indexes and policies)
DROP TABLE IF EXISTS public.friendships CASCADE;
```

