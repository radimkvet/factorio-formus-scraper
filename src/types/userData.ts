import * as z from 'zod';

import { Label } from './label.js';
import { TopicSchema } from './outputData.js';

export const UserDataSchema = z.object({
    [Label.FORUM_SEARCH_START]: TopicSchema.pick({ category: true }),
    [Label.FORUM_CATEGORY]: TopicSchema.pick({
        category: true,
    }),
    [Label.TOPIC_DETAIL]: z.object({
        topic: TopicSchema,
    }),
});

export type UserData = z.infer<typeof UserDataSchema>;
