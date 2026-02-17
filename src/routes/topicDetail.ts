import { Actor } from 'apify';
import type { CheerioCrawlingContext } from 'crawlee';

import { CrawlingStatistics } from '../state/crawlingStatistics.js';
import type { UserData } from '../types/index.js';
import { Label } from '../types/index.js';
import { checkPagination, normalizeText } from '../utils/index.js';

const selectors = {
    pagination: '#page-body .pagination',
    posts: '#page-body .post',
    post: {
        details: '.postbody .author',
        authorName: 'span',
        postDate: 'time',
        content: '.postbody .content, .content, .postbody',
    },
    nextPageLink: 'a',
} as const;

/**
 * Handler for topic detail. It handles scraping of separate commnts (aka posts).
 */
export const topicDetailHandler = async (ctx: CheerioCrawlingContext<UserData[typeof Label.TOPIC_DETAIL]>) => {
    const crawlingStatistics = await CrawlingStatistics.getInstance();
    const { $, request, log, enqueueLinks } = ctx;
    const { topic } = request.userData;

    const url = request.loadedUrl ?? request.url;

    const $pagination = $(selectors.pagination).first();
    const { isLastPage, hasMultiplePages, nextPageElement } = checkPagination($pagination);

    const posts = $(selectors.posts)
        .get()
        .map((postElement) => {
            const $post = $(postElement);

            const $details = $post.find(selectors.post.details).first();

            const authorName = $details.find(selectors.post.authorName).first().text().replace('^by ', '').trim();
            const postDate = $details.find(selectors.post.postDate).attr('datetime');

            const text = normalizeText($post.find(selectors.post.content).first().text() || '');

            return {
                author: authorName || 'Unknown',
                publishedAt: postDate ?? new Date().toISOString(),
                text,
                topic,
            };
        });

    if (posts.length === 0) {
        log.warning(`[${Label.TOPIC_DETAIL}] No comments parsed for ${url}.`);
    }

    await Actor.pushData(posts);

    crawlingStatistics.topicScraped();
    crawlingStatistics.postsScraped(posts.length);

    if (!hasMultiplePages || isLastPage) {
        log.info(
            `[${Label.TOPIC_DETAIL}] No pagination or last page reached for topic ${url}, pushing ${posts.length} posts data.`,
        );
        return;
    }

    const nextPageUrl = nextPageElement?.find(selectors.nextPageLink).first().attr('href');

    if (!nextPageUrl) {
        log.warning(
            `[${Label.TOPIC_DETAIL}] Could not find URL of next page for topic ${url}, pushing the data without pagination.`,
        );
        return;
    }

    await enqueueLinks({
        urls: [nextPageUrl],
        label: Label.TOPIC_DETAIL,
        userData: topic,
    });
};
