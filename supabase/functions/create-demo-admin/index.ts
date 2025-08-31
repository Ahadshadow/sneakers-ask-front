import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  email?: string;
  password?: string;
}

Deno.serve(async (req) => {
  console.log('Create demo admin function called')

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { email, password }: RequestBody = await req.json().catch(() => ({}))

    // Default demo admin credentials
    const demoEmail = email || 'admin@demo.com'
    const demoPassword = password || 'DemoAdmin123!'

    console.log(`Creating demo admin account: ${demoEmail}`)

    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: demoEmail,
      password: demoPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        first_name: 'Demo',
        last_name: 'Admin'
      }
    })

    if (authError) {
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create auth user', 
          details: authError.message 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const userId = authData.user?.id

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Failed to get user ID' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Created auth user with ID: ${userId}`)

    // Create or update profile with admin role
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        user_id: userId,
        first_name: 'Demo',
        last_name: 'Admin',
        email: demoEmail,
        role: 'admin',
        is_active: true
      })
      .select()

    if (profileError) {
      console.error('Profile error:', profileError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create profile', 
          details: profileError.message 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Demo admin account created successfully')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Demo admin account created successfully',
        user: {
          id: userId,
          email: demoEmail,
          role: 'admin'
        },
        credentials: {
          email: demoEmail,
          password: demoPassword
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})