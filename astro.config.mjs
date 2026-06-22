// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

import preact from '@astrojs/preact';

import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  integrations: [starlight({
      title: 'My Docs',
      defaultLocale: 'en',
      locales: {
        en: { label: 'English', lang: 'en' },
        th: { label: 'ไทย', lang: 'th' },
      },
      customCss: ['./src/styles/custom.css'],
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/' }],
      sidebar: [
        { label: 'Introduction & Setup', items: [{ autogenerate: { directory: 'intro' } }] },
        { label: 'Go 101 — Fundamentals', items: [{ autogenerate: { directory: 'go-101' } }] },
        { label: "Go You Won't Find in TypeScript", items: [{ autogenerate: { directory: 'go-only' } }] },
        { label: 'Concurrency', items: [{ autogenerate: { directory: 'concurrency' } }] },
        { label: 'Building an API with Echo', items: [{ autogenerate: { directory: 'api-echo' } }] },
        { label: 'Advanced Go', items: [{ autogenerate: { directory: 'advanced' } }] },
        { label: 'Tooling, Testing & Deployment', items: [{ autogenerate: { directory: 'tooling' } }] },
      ],
      }), preact()],

  adapter: vercel(),
});