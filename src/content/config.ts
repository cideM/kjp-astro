import { z, defineCollection } from "astro:content";

const therapeuten = defineCollection({
  type: "content",
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
  type: "data",
  schema: ({ image }) =>
    z.object({
      srcLandscape: image().refine(
        (img) => Math.round(img.width / img.height) === 2,
        (img) => ({
          message: `Landscape images must have a 16:9 aspect ratio but was ${Math.round(
            img.width / img.height,
          )}}`,
        }),
      ),
      alt: z.string(),
    }),
});

export const collections = {
  therapeuten: therapeuten,
  gallerie: gallerie,
};
