import { config as loadEnv } from 'dotenv'

loadEnv({ path: '.env.local', quiet: true })
loadEnv({ quiet: true })

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  modules: ['@nuxtjs/tailwindcss', '@nuxt/icon', '@nuxtjs/supabase'],
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],
  runtimeConfig: {
    public: {
      supabase: {
        url: process.env.NUXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
        key:
          process.env.NUXT_PUBLIC_SUPABASE_KEY ||
          process.env.SUPABASE_KEY ||
          process.env.SUPABASE_PUBLISHABLE_KEY ||
          process.env.SUPABASE_ANON_KEY,
      },
    },
  },
  supabase: {
    redirect: false,
    types: '~~/types/database.types.ts',
  },
  tailwindcss: {
    cssPath: '~/assets/css/main.css',
    configPath: 'tailwind.config.ts',
  },
})
