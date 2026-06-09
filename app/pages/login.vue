<template>
  <AuthTemplate>
    <form class="space-y-4" @submit.prevent="handleLogin">
      <AppTextInput
        v-model="email"
        label="Email"
        type="email"
        icon="lucide:mail"
        placeholder="nama@email.com"
      />
      <AppTextInput
        v-model="password"
        label="Password"
        type="password"
        icon="lucide:lock"
        placeholder="Masukkan password"
      />

      <p v-if="message" class="rounded-md bg-red-50 px-3 py-2 text-sm text-danger-text dark:bg-red-950 dark:text-danger-darkText">
        {{ message }}
      </p>

      <AppButton class="w-full" type="submit" icon="lucide:log-in" :disabled="isSubmitting">
        {{ isSubmitting ? 'Memproses...' : 'Masuk' }}
      </AppButton>
    </form>
  </AuthTemplate>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['guest'],
})

const supabase = useSupabaseClient()
const email = ref('')
const password = ref('')
const message = ref('')
const isSubmitting = ref(false)

async function handleLogin() {
  message.value = ''
  isSubmitting.value = true

  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  })

  isSubmitting.value = false

  if (error) {
    message.value = 'Email atau password salah.'
    return
  }

  await navigateTo('/dashboard')
}
</script>
