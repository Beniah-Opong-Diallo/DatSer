# 🎉 Share Access Feature - Setup Guide

## What This Does

Add collaborators to your database **just like Google Drive**! Simple email-based sharing:
- ✅ Add people by email
- ✅ They get full access to view and edit all data
- ✅ Remove access anytime
- ✅ See who has access

---

## Quick Setup (10 Minutes)

### Step 1: Run SQL in Supabase

1. Open **Supabase Dashboard** → **SQL Editor** → **New query**
2. Copy ALL the code from `sql/share_access_setup.sql`
3. Click **"Run"**
4. You should see: `Success`

### Step 2: Update Your Monthly Tables

The SQL file includes a template. You need to apply it to each monthly table:

**For December_2025:**
```sql
DROP POLICY IF EXISTS "Users can view their own data" ON "December_2025";
DROP POLICY IF EXISTS "Users can insert their own data" ON "December_2025";
DROP POLICY IF EXISTS "Users can update their own data" ON "December_2025";
DROP POLICY IF EXISTS  "Users can delete their own data" ON "December_2025";

CREATE POLICY "Users can view own or shared data"
  ON "December_2025" FOR SELECT
  USING (is_owner_or_collaborator(user_id));

CREATE POLICY "Users can insert own data"
  ON "December_2025" FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own or shared data"
  ON "December_2025" FOR UPDATE
  USING (is_owner_or_collaborator(user_id))
  WITH CHECK (is_owner_or_collaborator(user_id));

CREATE POLICY "Users can delete own or shared data"
  ON "December_2025" FOR DELETE
  USING (is_owner_or_collaborator(user_id));
```

**Then repeat for:** November_2025, October_2025, etc.

---

## How to Use

### For Admins (You):

1. **Go to Admin Dashboard**
2. **Click "Share" button** (next to Logout)
3. **Enter email** of person you want to add
4. **Click "Add"**
5. Done! They can now log in and access everything

### For Collaborators (People You Add):

1. **Go to your website**
2. **Click "Continue with Google"**
3. **Sign in with the email you were invited with**
4. **They'll see all your data automatically!**

---

## Example Workflow

**You (Owner):**
1. Add `john@example.com` to collaborators
2. John gets an email saying you shared access

**John (Collaborator):**
1. Opens your website
2. Signs in with Google using `john@example.com`
3. Sees all your members and can edit attendance

**You can remove John's access anytime** by clicking the trash icon next to his email in the Share modal.

---

## Important Notes

✅ **Security**: Only people with emails you add can access the data  
✅ **Permissions**: Collaborators can view and edit everything (same as you)  
✅ **Data Isolation**: Your data stays separate from other users' data  
✅ **Easy Removal**: Remove access instantly by deleting them from the list

---

## Troubleshooting

### "Failed to add collaborator"
- Make sure you ran the SQL setup in Supabase
- Check that the `collaborators` table exists

### "Collaborator can't see data"
- Make sure they're signing in with the EXACT email you added
- Check that you updated the RLS policies on your monthly tables
- Try logging out and back in

### "Column user_id does not exist"
- Your monthly tables need a `user_id` column
- Run this for each table:
  ```sql
  ALTER TABLE "December_2025" ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
  ```

---

## Features

- ✨ **Simple UI** - Just like Google Drive sharing
- 📧 **Email-based** - No complex permissions
- 🔒 **Secure** - Uses Supabase Row Level Security
- ⚡ **Instant** - Changes take effect immediately
- 👥 **Multiple collaborators** - Add as many as you want

---

## What Gets Shared?

When you add a collaborator, they can:
- ✅ View all members
- ✅ Mark attendance  
- ✅ Edit member information
- ✅ Delete members
- ✅ Switch between months
- ✅ View analytics

They CANNOT:
- ❌ Add more collaborators (only you can)
- ❌ See your collaborators list
- ❌ Change ownership

---

Need help? Check the SQL file for detailed comments on how everything works!
