// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless';

import mdx from '@astrojs/mdx';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  output: 'server',

  adapter: vercel(),

  site: 'https://www.thewalrusco.net',

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