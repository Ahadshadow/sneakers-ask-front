
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

    console.log(`Creating/finding demo admin account: ${demoEmail}`)

    // Try to create auth user, or get existing one
    let authData: any
    let userId: string

    const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: demoEmail,
      password: demoPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        first_name: 'Demo',
        last_name: 'Admin'
      }
    })

    if (createError && createError.message.includes('already been registered')) {
      console.log('User already exists, fetching existing user')
      
      // User already exists, get the existing user
      const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers()
      
      if (listError) {
        console.error('List error:', listError)
        return new Response(
          JSON.stringify({ 
            error: 'Failed to find existing user', 
            details: listError.message 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      const existingUser = listData.users.find(u => u.email === demoEmail)
      if (!existingUser) {
        return new Response(
          JSON.stringify({ error: 'User exists but could not be found' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      userId = existingUser.id
      authData = { user: existingUser }
    } else if (createError) {
      console.error('Auth error:', createError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create auth user', 
          details: createError.message 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } else {
      authData = createData
      userId = createData.user?.id
    }

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

    // Check if profile already exists
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    let profileData
    if (existingProfile) {
      console.log('Profile already exists, updating role to admin')
      // Update existing profile to ensure admin role
      const { data: updateData, error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({
          role: 'admin',
          is_active: true
        })
        .eq('user_id', userId)
        .select()

      if (updateError) {
        console.error('Profile update error:', updateError)
        return new Response(
          JSON.stringify({ 
            error: 'Failed to update profile', 
            details: updateError.message 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      profileData = updateData
    } else {
      console.log('Creating new profile')
      // Create new profile
      const { data: createProfileData, error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          user_id: userId,
          first_name: 'Demo',
          last_name: 'Admin',
          email: demoEmail,
          role: 'admin',
          is_active: true
        })
        .select()

      if (profileError) {
        console.error('Profile creation error:', profileError)
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
      profileData = createProfileData
    }

    console.log('Demo admin account created/updated successfully')

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
