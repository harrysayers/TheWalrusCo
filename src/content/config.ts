import { defineCollection, z } from 'astro:content';

const stories = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    type: z.enum(['Data Story', 'Data Tool']),
    date: z.string(),
    description: z.string(),
    image: z.string(),

    // For standalone React apps (complex tools)
    isStandalone: z.boolean().default(false),
    standaloneUrl: z.string().optional(),
    hasLandingPage: z.boolean().default(true), // Show intro page before launching tool

    // Optional metadata
    techStack: z.array(z.string()).optional(),
    featured: z.boolean().default(false),
  })
});

export const collections = { stories };
