import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

// Keep the wiki's page names as URLs (/Getting-Started/), so a wiki link maps one to one.
const generateId = ({ entry }: { entry: string }) => entry.replace(/\.md$/, '');

export const collections = {
	docs: defineCollection({
		loader: docsLoader({ generateId }),
		schema: docsSchema({ extend: z.object({ eyebrow: z.string().optional() }) }),
	}),
};
