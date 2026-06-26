// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

import preact from '@astrojs/preact';

// https://astro.build/config
export default defineConfig({
  // GitHub Pages project site. Update `site` to your GitHub username and `base`
  // to your repo name if they differ.
  site: 'https://avetavos.github.io',
  base: '/go-for-typescript-developers',
  output: 'static',
  integrations: [starlight({
      title: 'Go for TypeScript Developers',
      head: [
        { tag: 'script', attrs: { type: 'module', src: '/go-for-typescript-developers/enhance.js' } },
        { tag: 'link', attrs: { rel: 'manifest', href: '/go-for-typescript-developers/manifest.webmanifest' } },
        { tag: 'link', attrs: { rel: 'apple-touch-icon', href: '/go-for-typescript-developers/apple-touch-icon.png' } },
        { tag: 'link', attrs: { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/go-for-typescript-developers/icon-192.png' } },
        { tag: 'meta', attrs: { name: 'theme-color', content: '#00ADD8' } },
        { tag: 'meta', attrs: { name: 'mobile-web-app-capable', content: 'yes' } },
        { tag: 'meta', attrs: { name: 'apple-mobile-web-app-capable', content: 'yes' } },
        { tag: 'meta', attrs: { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' } },
        { tag: 'meta', attrs: { name: 'apple-mobile-web-app-title', content: "Go for TypeScript Developers" } },
        { tag: 'script', content: "if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/go-for-typescript-developers/sw.js',{scope:'/go-for-typescript-developers/'}).catch(function(){})})}" },
      ],
      defaultLocale: 'en',
      locales: {
        en: { label: 'English', lang: 'en' },
        th: { label: 'ไทย', lang: 'th' },
      },
      customCss: ['./src/styles/custom.css'],
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/avetavos/go-for-typescript-developers' }],
      sidebar: [
        { label: 'Introduction & Setup', collapsed: true, items: [{ autogenerate: { directory: 'intro' } }] },
        { label: 'Go 101 — Fundamentals', collapsed: true, items: [{ autogenerate: { directory: 'go-101' } }] },
        { label: "Go You Won't Find in TypeScript", items: [{ autogenerate: { directory: 'go-only' } }] },
        { label: 'Concurrency', collapsed: true, items: [{ autogenerate: { directory: 'concurrency' } }] },
        { label: 'Building an API with Echo', collapsed: true, items: [{ autogenerate: { directory: 'api-echo' } }] },
        { label: 'Advanced Go', collapsed: true, items: [{ autogenerate: { directory: 'advanced' } }] },
        { label: 'Tooling, Testing & Deployment', collapsed: true, items: [{ autogenerate: { directory: 'tooling' } }] },
      ],
      }), preact()],
});