-- Add delete policy for admins to reject users
CREATE POLICY "Admins can delete profiles"
ON public.profiles
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Insert existing admin user into profiles as approved
INSERT INTO public.profiles (user_id, email, is_approved, approved_at)
SELECT id, email, true, now()
FROM auth.users
WHERE id = 'b879afff-7719-4213-8ed7-f9e493ac0ba2'
ON CONFLICT (user_id) DO UPDATE SET is_approved = true, approved_at = now();