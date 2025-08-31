-- Create a function to create demo admin account
-- This will create a user in the auth system and set up the profile

-- First, let's create the demo admin user in auth.users
-- Since we can't directly insert into auth.users, we'll create a function that uses the admin API

-- Create a demo admin profile that can be linked to a manually created auth user
INSERT INTO public.profiles (
  user_id,
  first_name,
  last_name, 
  email,
  role,
  is_active
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Demo',
  'Admin',
  'admin@demo.com',
  'admin'::app_role,
  true
) ON CONFLICT (user_id) DO UPDATE SET
  role = 'admin'::app_role,
  is_active = true;

-- Create a function to easily promote users to admin role
CREATE OR REPLACE FUNCTION public.promote_user_to_admin(user_email text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id uuid;
  result json;
BEGIN
  -- Check if requesting user is admin
  IF NOT is_admin(auth.uid()) THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  -- Find user by email
  SELECT user_id INTO target_user_id 
  FROM public.profiles 
  WHERE email = user_email;

  IF target_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User not found');
  END IF;

  -- Update user role to admin
  UPDATE public.profiles 
  SET role = 'admin'::app_role, 
      is_active = true,
      updated_at = now()
  WHERE user_id = target_user_id;

  RETURN json_build_object(
    'success', true, 
    'message', 'User promoted to admin successfully',
    'user_id', target_user_id
  );
END;
$$;