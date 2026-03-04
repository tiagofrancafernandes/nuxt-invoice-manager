import tailwindcss from '@tailwindcss/vite';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    experimental: {
        scanPageMeta: false,
        appManifest: false,
    },
    devtools: {
        enabled: true,
    },
    vite: {
        plugins: [
            tailwindcss(),
            //
        ],
    },
    css: ['./app/assets/css/main.css'],
});
