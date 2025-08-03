// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
        trailingSlash: 'always',
        redirects: {
            // This catches any URL without trailing slash and adds it
            '/[...path]': {
            status: 301,
            destination: '/[...path]/'
            }
        },
        site: 'https://www.thewalrusco.net',
});
