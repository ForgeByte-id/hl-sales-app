import { config as loadEnv } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

loadEnv({ path: '.env.local', quiet: true })
loadEnv({ quiet: true })

const supabaseUrl = process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const email = process.env.SEED_USER_EMAIL
const password = process.env.SEED_USER_PASSWORD
const name = process.env.SEED_USER_NAME || 'Pemilik'

function fail(message) {
  console.error(message)
  process.exit(1)
}

if (!supabaseUrl) {
  fail('SUPABASE_URL belum diisi di .env.local')
}

if (!serviceRoleKey) {
  fail('SUPABASE_SERVICE_ROLE_KEY belum diisi di .env.local')
}

if (!email) {
  fail('SEED_USER_EMAIL belum diisi di .env.local')
}

if (!password || password.length < 8) {
  fail('SEED_USER_PASSWORD wajib diisi minimal 8 karakter')
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function findUserByEmail(targetEmail) {
  let page = 1

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 1000,
    })

    if (error) {
      throw error
    }

    const user = data.users.find((candidate) => candidate.email?.toLowerCase() === targetEmail.toLowerCase())

    if (user) {
      return user
    }

    if (data.users.length < 1000) {
      return null
    }

    page += 1
  }
}

async function main() {
  const existingUser = await findUserByEmail(email)

  if (existingUser) {
    const { error } = await supabase.auth.admin.updateUserById(existingUser.id, {
      password,
      email_confirm: true,
      user_metadata: { name },
    })

    if (error) {
      throw error
    }

    console.log(`User awal diperbarui: ${email}`)
    return
  }

  const { error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  })

  if (error) {
    throw error
  }

  console.log(`User awal dibuat: ${email}`)
}

main().catch((error) => {
  console.error(error.message || error)
  process.exit(1)
})
