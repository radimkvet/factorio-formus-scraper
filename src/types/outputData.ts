import * as z from 'zod';

export const TopicSchema = z.object({
    category: z.string(),
    title: z.string(),
    url: z.string(),
    author: z.string(),
    createdAt: z.iso.datetime(),
    lastPostAt: z.iso.datetime(),
    views: z.number().optional(),
    isAnnouncement: z.boolean(),
    totalPosts: z.number(),
});

export type Topic = z.infer<typeof TopicSchema>;

export const PostSchema = z.object({
    publishedAt: z.iso.datetime(),
    author: z.string(),
    text: z.string(),
    topic: TopicSchema,
});

export type Post = z.infer<typeof PostSchema>;
