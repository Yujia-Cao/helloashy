import { z, defineCollection, type DataEntryMap } from 'astro:content';
import { glob } from 'astro/loaders';
import { fileToUrl, notionLoader, notionPageSchema } from 'notion-astro-loader';
import { transformedPropertySchema } from 'notion-astro-loader/schemas';

const videos = defineCollection({
  loader: notionLoader({
    auth: import.meta.env.NOTION_TOKEN,
    database_id: "30621eb647fe80c09589c79f0bf1dbc9",
  }),
  schema: notionPageSchema({
    properties: z.object({
      Name: transformedPropertySchema.title,
      Date: transformedPropertySchema.date.transform((x) => x!.start),
      Categories: transformedPropertySchema.multi_select,
      Description: transformedPropertySchema.rich_text,
      UID: transformedPropertySchema.rich_text,
    }),
  }),
});

export interface VideoProps {
  uid: string;
  title: string;
  date: Date;
  categories: string[];
  description: string;
  image: string;
}

export const preprocessVideo = async (entry: DataEntryMap["videos"][string]) => {
  const properties = entry.data.properties;
  const image = fileToUrl(entry.data.cover!);
  return {
    uid: entry.data.properties.UID,
    title: properties.Name,
    date: properties.Date,
    categories: properties.Categories,
    description: properties.Description,
    image,
  } satisfies VideoProps;
};

const metadataDefinition = () =>
  z
    .object({
      title: z.string().optional(),
      ignoreTitleTemplate: z.boolean().optional(),

      canonical: z.string().url().optional(),

      robots: z
        .object({
          index: z.boolean().optional(),
          follow: z.boolean().optional(),
        })
        .optional(),

      description: z.string().optional(),

      openGraph: z
        .object({
          url: z.string().optional(),
          siteName: z.string().optional(),
          images: z
            .array(
              z.object({
                url: z.string(),
                width: z.number().optional(),
                height: z.number().optional(),
              })
            )
            .optional(),
          locale: z.string().optional(),
          type: z.string().optional(),
        })
        .optional(),

      twitter: z
        .object({
          handle: z.string().optional(),
          site: z.string().optional(),
          cardType: z.string().optional(),
        })
        .optional(),
    })
    .optional();

const postCollection = defineCollection({
  loader: glob({ pattern: ['*.md', '*.mdx'], base: 'src/data/post' }),
  schema: z.object({
    publishDate: z.date().optional(),
    updateDate: z.date().optional(),
    draft: z.boolean().optional(),

    title: z.string(),
    excerpt: z.string().optional(),
    image: z.string().optional(),

    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    author: z.string().optional(),

    metadata: metadataDefinition(),
  }),
});

export const collections = {
  post: postCollection,
  videos: videos,
};
