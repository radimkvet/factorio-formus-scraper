import { Actor } from 'apify';
import { CheerioCrawler, Request } from 'crawlee';

import { BASE_URL } from './constants.js';
import { router } from './routes.js';
import { type Input, Label, type UserData } from './types/index.js';

await Actor.init();

const { category, limit } = (await Actor.getInput<Input>())!;

const crawler = new CheerioCrawler({
    requestHandler: router,
    maxRequestRetries: 5,
    maxRequestsPerMinute: 100,
    maxConcurrency: 5,
});

const initialRequest = new Request<UserData[typeof Label.FORUM_SEARCH_START]>({
    url: `${BASE_URL}`,
    label: Label.FORUM_SEARCH_START,
    userData: {
        category,
        limit,
    },
});
await crawler.run([initialRequest]);

await Actor.exit();
