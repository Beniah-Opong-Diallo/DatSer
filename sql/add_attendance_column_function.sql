-- SQL Function to Add Attendance Columns Dynamically
-- Run this in your Supabase SQL Editor

-- This function allows the app to create attendance columns on-the-fly
-- when marking attendance for dates that don't have columns yet

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
    -- Column already exists, return success
    result := json_build_object(
      'success', true,
      'message', 'Column already exists',
      'column_name', column_name
    );
    RETURN result;
  END IF;

  -- Create the new attendance column (TEXT type to store 'Present' or 'Absent')
  EXECUTE format(
    'ALTER TABLE %I ADD COLUMN %I TEXT',
    table_name,
    column_name
  );

  -- Return success
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION add_attendance_column(TEXT, TEXT) TO authenticated;

-- Grant execute permission to anon users (if you want non-authenticated users to mark attendance)
GRANT EXECUTE ON FUNCTION add_attendance_column(TEXT, TEXT) TO anon;
