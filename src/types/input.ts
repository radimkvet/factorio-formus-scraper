import * as z from 'zod';

export const InputSchema = z.object({
    category: z.string(),
    limit: z.number().optional(),
});

export type Input = z.infer<typeof InputSchema>;
