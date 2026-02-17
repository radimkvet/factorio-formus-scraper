import { Actor } from 'apify';
import { CheerioCrawler, Request } from 'crawlee';

import { BASE_URL } from './constants.js';
import { router } from './routes.js';
import { type Input, Label, type UserData } from './types/index.js';

await Actor.init();

const { category, limit } = (await Actor.getInput<Input>())!;

const proxyConfiguration = await Actor.createProxyConfiguration({
    useApifyProxy: true,
});

const crawler = new CheerioCrawler({
    proxyConfiguration,
    requestHandler: router,
    // this is 2 requests per second, this should be fine and not overload the site since it is not so frequently used one
    maxRequestsPerMinute: 120,
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
