import type { CheerioCrawlingContext } from 'crawlee';

import type { UserData } from '../types/index.js';
import { Label } from '../types/index.js';

const selectors = {
    categories: '#page-body .forabg ul.forums li',
    category: {
        firstCell: 'dt:first-child',
        link: 'a.forumtitle',
    },
} as const;

export const forumSearchStartHandler = async (
    ctx: CheerioCrawlingContext<UserData[typeof Label.FORUM_SEARCH_START]>,
) => {
    const { $, request, log, enqueueLinks } = ctx;
    const { category } = request.userData;

    const $categories = $(selectors.categories);

    for (let i = 0; i < $categories.length; i++) {
        const categoryElement = $categories.get(i);
        if (categoryElement == null) {
            continue;
        }
        const $category = $(categoryElement);

        const $firstCell = $category.find(selectors.category.firstCell);
        const $link = $firstCell.find(selectors.category.link).first();

        const url = $link.attr('href');
        const title = $link.text().trim();

        if (!url) {
            log.warning(`[${Label.FORUM_SEARCH_START}] Could not find url for category at index ${i}.`);
            return;
        }

        if (!title) {
            log.warning(`[${Label.FORUM_SEARCH_START}] Could not find title for category at index ${i}.`);
        }

        const normalizedTitle = title.toLowerCase();
        const normalizedCategory = String(category).toLowerCase();

        if (normalizedTitle !== normalizedCategory) {
            // skip, select just the correct category
            continue;
        }

        const userData: UserData[typeof Label.FORUM_CATEGORY] = {
            category,
        };

        log.info(`[${Label.FORUM_SEARCH_START}] enqueued category with name ${title} and url ${url}`);

        await enqueueLinks({
            urls: [url],
            label: Label.FORUM_CATEGORY,
            userData,
        });
    }
};
