// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

import mdx from '@astrojs/mdx';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  output: 'server',

  adapter: node({
      mode: 'standalone'
  }),

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