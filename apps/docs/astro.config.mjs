import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://jbogaty.github.io',
  base: '/iron-frontier',
  integrations: [
    starlight({
      title: 'Iron Frontier',
      description: 'Documentation for Iron Frontier - A Steampunk Western RPG',
      logo: {
        src: './src/assets/logo.svg',
        replacesTitle: false,
      },
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/jbogaty/iron-frontier' },
      ],
      customCss: ['./src/styles/custom.css'],
      sidebar: [
        {
          label: 'Introduction',
          items: [
            { label: 'Overview', slug: 'index' },
            { label: 'Getting Started', slug: 'guides/getting-started' },
          ],
        },
        {
          label: 'Guides',
          items: [
            { label: 'Architecture', slug: 'guides/architecture' },
            { label: 'Web App', slug: 'guides/web-app' },
            { label: 'Mobile App', slug: 'guides/mobile-app' },
            { label: 'Shared Packages', slug: 'guides/shared-packages' },
            { label: 'Rendering Abstraction', slug: 'guides/rendering' },
          ],
        },
        {
          label: 'Reference',
          items: [
            { label: 'API Reference', slug: 'reference/api' },
            { label: 'Data Schemas', slug: 'reference/schemas' },
            { label: 'Procedural Generation', slug: 'reference/procedural-generation' },
          ],
        },
        {
          label: 'Contributing',
          items: [{ label: 'Contributing Guide', slug: 'guides/contributing' }],
        },
      ],
      head: [
        {
          tag: 'meta',
          attrs: {
            property: 'og:image',
            content: 'https://jbogaty.github.io/iron-frontier/og-image.png',
          },
        },
      ],
      editLink: {
        baseUrl: 'https://github.com/jbogaty/iron-frontier/edit/main/apps/docs/',
      },
    }),
  ],
});
