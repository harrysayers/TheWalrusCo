// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

import mdx from '@astrojs/mdx';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  output: 'server', // SSR mode with caching

  adapter: vercel({
    isr: {
      // Cache pages for 1 hour, then revalidate in background
      expiration: 3600,
    }
  }),

  site: 'https://www.thewalrusco.com',

  vite: {
      server: {
          middlewareMode: false,
          fs: {
              allow: ['..']
          }
      }
  },

  integrations: [mdx(), react()]
});