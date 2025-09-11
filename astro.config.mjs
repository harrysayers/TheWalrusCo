// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
    site: 'https://www.thewalrusco.net',
    vite: {
        server: {
            middlewareMode: false,
            fs: {
                allow: ['..']
            }
        },
        plugins: [{
            name: 'static-stories',
            configureServer(server) {
                server.middlewares.use('/stories', (req, res, next) => {
                    if (req.url.endsWith('/')) {
                        req.url += 'index.html';
                    }
                    next();
                });
            }
        }]
    }
});
