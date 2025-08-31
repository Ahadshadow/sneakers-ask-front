import { supabase } from '@/integrations/supabase/client';

export const createDemoAdmin = async (customEmail?: string, customPassword?: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('create-demo-admin', {
      body: {
        email: customEmail,
        password: customPassword
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('Error creating demo admin:', error);
    throw error;
  }
};