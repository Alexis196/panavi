import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://rikpiaiudjkhfldpajzi.supabase.co'
const SERVICE_ROLE_KEY = process.argv[2]

if (!SERVICE_ROLE_KEY) {
  console.error('Uso: node scripts/seed-users.mjs <service_role_key>')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})
 console.log("hola")
const users = [
  { email: 'admin@panavi.com',    password: 'panavi123', full_name: 'Admin Panavi',   role: 'admin' },
  { email: 'cliente@panavi.com',  password: 'panavi123', full_name: 'Cliente Demo',   role: 'cliente' },
]

for (const u of users) {
  const { data, error } = await supabase.auth.admin.createUser({
    email: u.email,
    password: u.password,
    email_confirm: true,
    user_metadata: { full_name: u.full_name },
  })

  if (error) {
    console.error(`✗ ${u.email}: ${error.message}`)
    continue
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ role: u.role, full_name: u.full_name })
    .eq('id', data.user.id)

  if (profileError) {
    console.error(`✗ perfil de ${u.email}: ${profileError.message}`)
  } else {
    console.log(`✓ ${u.email} (${u.role}) creado`)
  }
}
