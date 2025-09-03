-- src/sql/sales.sql

-- Helper function to check if the current user is a sales person
CREATE OR REPLACE FUNCTION is_sales_user()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN get_my_user_type() = 6;
END;
$$;

-- Policies for the 'organisations' table
-- Allow sales users to view all organisations
CREATE POLICY "Allow sales users to view all organisations"
ON public.organisations
FOR SELECT
TO authenticated
USING (is_sales_user());

-- Allow sales users to insert new organisations
CREATE POLICY "Allow sales users to insert organisations"
ON public.organisations
FOR INSERT
TO authenticated
WITH CHECK (is_sales_user());

-- Allow sales users to update organisations
CREATE POLICY "Allow sales users to update organisations"
ON public.organisations
FOR UPDATE
TO authenticated
USING (is_sales_user());

-- No DELETE policy for sales users on organisations table


-- Policies for the 'user' table
-- Allow sales users to view admin users (for owner selection) and their own profile
CREATE POLICY "Allow sales users to view admins and own profile"
ON public.user
FOR SELECT
TO authenticated
USING (
  is_sales_user() AND (user_type = 2 OR id = get_my_user_id())
);

-- Policies for the 'organisations_website' table
-- Allow sales users full access to manage website content
CREATE POLICY "Allow sales users full access to organisation websites"
ON public.organisations_website
FOR ALL
TO authenticated
USING (is_sales_user())
WITH CHECK (is_sales_user());

-- Policies for 'organisation_types' table
-- Allow sales users to read organisation types
CREATE POLICY "Allow sales users to read organisation types"
ON public.organisation_types
FOR SELECT
TO authenticated
USING (is_sales_user());
