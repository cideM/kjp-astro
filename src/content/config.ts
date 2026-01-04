import { z, defineCollection } from "astro:content";
import { glob } from "astro/loaders";

const therapeuten = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/therapeuten" }),
  schema: ({ image }) =>
    z.object({
      displayName: z.string(),
      photo: image(),
      photoAlt: z.string(),
      email: z.string().email(),
      phone: z.string(),
    }),
});

const gallerie = defineCollection({
  loader: glob({ pattern: "**/*.yaml", base: "./src/content/gallerie" }),
  schema: ({ image }) =>
    z.object({
      srcLandscape: image(),
      alt: z.string(),
    }),
});

export const collections = {
  therapeuten: therapeuten,
  gallerie: gallerie,
};
