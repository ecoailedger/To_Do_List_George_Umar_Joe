# Supabase Setup Guide

This guide will help you set up cloud sync for the Midwich To-Do Matrix application using Supabase.

## Prerequisites

- A free Supabase account (https://supabase.com)
- Basic understanding of SQL databases

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in or create an account
2. Click "New Project"
3. Fill in the details:
   - **Name**: Midwich To-Do Matrix (or any name you prefer)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the closest region to you
4. Click "Create new project" and wait for it to initialize (1-2 minutes)

## Step 2: Set Up Database Tables

1. In your Supabase project dashboard, go to **SQL Editor**
2. Copy and paste the following SQL script:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workspaces table (for team collaboration)
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  owner_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workspace members
CREATE TABLE workspace_members (
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  PRIMARY KEY (workspace_id, user_id)
);

-- Todo data table
CREATE TABLE todo_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  data JSONB NOT NULL,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE todo_data ENABLE ROW LEVEL SECURITY;

-- Policies for users table
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Policies for workspaces
CREATE POLICY "Users can read workspaces they're members of" ON workspaces
  FOR SELECT USING (
    id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create workspaces" ON workspaces
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update workspaces" ON workspaces
  FOR UPDATE USING (owner_id = auth.uid());

-- Policies for workspace members
CREATE POLICY "Users can read workspace members" ON workspace_members
  FOR SELECT USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace owners can manage members" ON workspace_members
  FOR ALL USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
    )
  );

-- Policies for todo_data
CREATE POLICY "Users can read todo data from their workspaces" ON todo_data
  FOR SELECT USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert todo data" ON todo_data
  FOR INSERT WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update todo data" ON todo_data
  FOR UPDATE USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

-- Indexes for performance
CREATE INDEX idx_todo_data_workspace ON todo_data(workspace_id);
CREATE INDEX idx_todo_data_updated ON todo_data(updated_at DESC);
CREATE INDEX idx_workspace_members_user ON workspace_members(user_id);

-- Function to automatically create user record on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name)
  VALUES (new.id, new.email, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

3. Click "Run" to execute the script
4. You should see "Success. No rows returned" if everything worked

## Step 3: Configure Authentication

### Enable Email Authentication

1. Go to **Authentication** → **Providers** in your Supabase dashboard
2. Ensure **Email** is enabled (it should be by default)
3. Configure email templates if desired

### Enable Google OAuth (Optional but Recommended)

1. Go to **Authentication** → **Providers**
2. Click on **Google**
3. Enable Google auth
4. You'll need:
   - **Client ID** and **Client Secret** from Google Cloud Console
   - Follow Supabase's instructions to set up Google OAuth

## Step 4: Get Your API Credentials

1. Go to **Settings** → **API** in your Supabase dashboard
2. You'll need two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **Anon/Public Key** (a long string starting with `eyJ...`)

## Step 5: Configure Your Application

Create a `.env` file in the root of your project with the following:

```env
VITE_SUPABASE_URL=your-project-url-here
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important**:
- Replace `your-project-url-here` with your actual Project URL
- Replace `your-anon-key-here` with your actual Anon key
- Never commit this `.env` file to version control!

## Step 6: Test the Connection

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open the application in your browser

3. Look for the cloud sync status in the header:
   - If setup correctly, you'll see "Offline mode" button
   - Click it to sign in

4. Sign in with your email or Google account

5. Once signed in, your data will automatically sync to the cloud!

## Troubleshooting

### "Cloud sync disabled" always showing

- Check that your `.env` file exists and has the correct keys
- Make sure the keys don't have quotes or extra spaces
- Restart your development server after creating/editing `.env`

### Sign-in not working

- Check your email spam folder for the magic link
- Ensure Email authentication is enabled in Supabase
- Check the browser console for error messages

### Data not syncing

- Check your browser's network tab for failed requests
- Verify Row Level Security policies are set up correctly
- Check the Supabase dashboard logs for errors

### Permission denied errors

- Ensure all RLS policies were created correctly
- Check that the trigger for creating user records is working
- Try signing out and signing in again

## Advanced: Team Collaboration

To invite team members to your workspace:

1. They need to sign up for an account in the app
2. You'll need to manually add them to your workspace in Supabase:

```sql
-- Get your workspace ID
SELECT id FROM workspaces WHERE owner_id = 'your-user-id';

-- Add team member
INSERT INTO workspace_members (workspace_id, user_id, role)
VALUES ('workspace-id', 'team-member-user-id', 'member');
```

In a future update, we can add a UI for inviting team members!

## Security Notes

- Never share your database password or API keys
- The `anon` key is safe to use in your frontend (it's public)
- Row Level Security ensures users can only access their own data
- Always use environment variables for sensitive configuration

## Cost

- Supabase offers a generous free tier:
  - 500MB database storage
  - 1GB file storage
  - 2GB bandwidth
  - 50,000 monthly active users

This is more than enough for personal and small team use!

## Support

If you encounter issues:
1. Check the Supabase documentation: https://supabase.com/docs
2. Check your browser console for errors
3. Review the Supabase project logs
4. Ask for help in the Supabase Discord: https://discord.supabase.com

---

**That's it!** You now have cloud backup and sync enabled for your to-do list application! 🎉
