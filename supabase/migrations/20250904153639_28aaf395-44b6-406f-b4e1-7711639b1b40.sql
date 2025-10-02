-- Fix security issues with customer data access in orders table

-- 1. Fix the get_current_user_role function to include proper search_path security
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$;

-- 2. Drop existing permissive policies and create more restrictive ones
DROP POLICY IF EXISTS "Authorized staff can view orders" ON public.orders;
DROP POLICY IF EXISTS "Authorized staff can create orders" ON public.orders;
DROP POLICY IF EXISTS "Authorized staff can update orders" ON public.orders;

-- 3. Create restrictive policies that ensure only authorized staff can access customer data
CREATE POLICY "Restrict order viewing to authorized staff only"
ON public.orders
FOR SELECT
TO authenticated
USING (
  get_current_user_role() = ANY (ARRAY['admin'::app_role, 'finance'::app_role, 'customer_care'::app_role])
);

CREATE POLICY "Restrict order creation to authorized staff only"
ON public.orders
FOR INSERT
TO authenticated
WITH CHECK (
  get_current_user_role() = ANY (ARRAY['admin'::app_role, 'finance'::app_role, 'customer_care'::app_role])
);

CREATE POLICY "Restrict order updates to authorized staff only"
ON public.orders
FOR UPDATE
TO authenticated
USING (
  get_current_user_role() = ANY (ARRAY['admin'::app_role, 'finance'::app_role, 'customer_care'::app_role])
)
WITH CHECK (
  get_current_user_role() = ANY (ARRAY['admin'::app_role, 'finance'::app_role, 'customer_care'::app_role])
);

-- 4. Ensure no DELETE policy exists to prevent accidental data deletion
-- (No DELETE policy = no one can delete orders, which is appropriate for audit trail)

-- 5. Add a comment to document the security considerations
COMMENT ON TABLE public.orders IS 'Contains sensitive customer PII. Access restricted to authorized staff only via RLS policies.';