# 🚨 CRITICAL: Fix December Attendance Issue

## The Problem
Only **December 14th** works because it's the only date with an attendance column. The other December Sundays (Dec 7, 21, 28) are missing their attendance columns in your database.

## The Solution
Run the SQL function below in Supabase to allow the app to **automatically create attendance columns** when needed.

---

## Step-by-Step Fix (5 minutes)

### Step 1: Open Supabase SQL Editor
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New query"**

### Step 2: Copy & Paste the SQL
Copy ALL the code from `sql/add_attendance_column_function.sql` and paste it into the SQL Editor.

Or copy this:

```sql
CREATE OR REPLACE FUNCTION add_attendance_column(
  table_name TEXT,
  column_name TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  -- Check if column already exists
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = add_attendance_column.table_name
      AND column_name = add_attendance_column.column_name
  ) THEN
    result := json_build_object(
      'success', true,
      'message', 'Column already exists',
      'column_name', column_name
    );
    RETURN result;
  END IF;

  -- Create the new attendance column
  EXECUTE format(
    'ALTER TABLE %I ADD COLUMN %I TEXT',
    table_name,
    column_name
  );

  result := json_build_object(
    'success', true,
    'message', 'Column created successfully',
    'column_name', column_name,
    'table_name', table_name
  );

  RETURN result;

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error creating attendance column: %', SQLERRM;
END;
$$;

GRANT EXECUTE ON FUNCTION add_attendance_column(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION add_attendance_column(TEXT, TEXT) TO anon;
```

### Step 3: Run It!
1. Click the **"Run"** button (or press `Ctrl+Enter`)
2. You should see: **"Success. No rows returned"**
3. Done! ✅

---

## What This Does
- ✅ Automatically creates attendance columns when you mark attendance for any date
- ✅ Works for all December Sundays (7th, 14th, 21st, 28th)
- ✅ Works for all future months automatically
- ✅ Prevents data loss from temporary local state

## Test It
After running the SQL:

1. **Refresh your app**
2. **Mark someone as Present for Dec 7**
3. **Refresh the page** - it should stay highlighted now!
4. **Check "Edited Members" tab** - they should appear there
5. **Try Dec 21 and Dec 28** - they should also work now

---

## Why Only Dec 14 Worked Before
When you created the December table, only Dec 14's attendance column (`attendance_2025_12_14`) was created. The other Sundays didn't have their columns created yet, so attendance couldn't be saved to the database.

Now, the app will automatically create missing columns when needed! 🎉
