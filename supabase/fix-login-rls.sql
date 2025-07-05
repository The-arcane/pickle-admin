-- =================================================================
-- SQL SCRIPT TO FIX THE LOGIN LOOP
-- This script removes broken security rules on the "user" table
-- and replaces them with a single correct rule needed for login.
-- =================================================================

-- Step 1: Drop the function that is causing the infinite recursion error.
-- The `CASCADE` keyword also removes any broken policies that depend on it.
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;


-- Step 2: Remove any other potentially conflicting policies on the "user" table.
-- This is a safety measure to ensure a clean state.
DROP POLICY IF EXISTS "Allow users to read their own data" ON public."user";
DROP POLICY IF EXISTS "Allow users to read their own profile" ON public."user";
DROP POLICY IF EXISTS "Admins can view all users" ON public."user";


-- Step 3: Create the one policy that is ESSENTIAL for login.
-- This allows any logged-in user to securely read their own profile information.
CREATE POLICY "Allow users to read their own profile" ON public."user"
FOR SELECT TO authenticated USING (auth.uid() = user_uuid);
