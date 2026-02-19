import * as z from 'zod';

export const Label = {
    FORUM_SEARCH_START: 'FORUM_SEARCH_START',
    FORUM_CATEGORY: 'FORUM_CATEGORY',
    TOPIC_DETAIL: 'TOPIC_DETAIL',
} as const;

export const LabelSchema = z.enum(Label);

export type Label = z.infer<typeof LabelSchema>;
