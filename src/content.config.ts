import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "*.{md,mdx}", base: "./src/_blogposts" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    socials: z.array(z.object({
      site: z.string(),
      url: z.string()
    })).optional()
  }),
});

export const collections = { blog };
