import { type CheerioCrawlingContext, Request } from 'crawlee';

import { CrawlingStatistics } from '../state/crawlingStatistics.js';
import type { Topic, UserData } from '../types/index.js';
import { Label } from '../types/index.js';
import { checkPagination, parseNumber } from '../utils/index.js';

const selectors = {
    topics: '#page-body div.forumbg ul.topiclist.topics>li',
    pagination: '#page-body .pagination',
    topic: {
        details: 'dt:first-child',
        titleLink: 'a.topictitle',
        views: 'dd.views',
        lastPost: 'dd.lastpost',
        lastPostTime: 'time',
        author: '.topic-poster a',
        createdAt: '.topic-poster time',
        posts: 'dd.posts',
    },
} as const;

/**
 * Handler for one forum category, which goes through all the topics and adds them to the queue untill it hits the defined limit.
 */
export const forumCategoryHandler = async (ctx: CheerioCrawlingContext<UserData[typeof Label.FORUM_CATEGORY]>) => {
    const crawlingStatistics = await CrawlingStatistics.getInstance();
    const { $, request, log, addRequests } = ctx;
    const { limit } = request.userData;

    const NOW = new Date().toISOString();

    const $topics = $(selectors.topics);

    if (limit != null && crawlingStatistics.topicsEnqueued >= limit) {
        log.info(`[${Label.FORUM_CATEGORY}] Limit of ${limit} topics reached, stopping pagination.`);
        return;
    }

    const topicRequests = $topics
        .toArray()
        .map((topicElement) => {
            const $topic = $(topicElement);

            const $details = $topic.find(selectors.topic.details).first();

            const $titleLink = $details.find(selectors.topic.titleLink).first();
            const relativeUrl = $titleLink.attr('href');
            const title = $titleLink.text().trim();

            if (!relativeUrl) {
                log.warning(`[${Label.FORUM_CATEGORY}] Could not find URL of topic "${title}", skipping it.`);
                return null;
            }

            const url = new URL(relativeUrl, request.loadedUrl ?? request.url).href;

            const $views = $topic.find(selectors.topic.views).first();
            const $lastPost = $topic.find(selectors.topic.lastPost).first();
            const $author = $details.find(selectors.topic.author).first();
            const $createdAt = $details.find(selectors.topic.createdAt).first();
            const $posts = $topic.find(selectors.topic.posts).first();

            const topic: Topic = {
                category: request.userData.category,
                title,
                url,
                views: parseNumber($views.text().trim().split(' ')[0]) ?? 0,
                author: $author.text().trim() || 'Unknown',
                createdAt: $createdAt.attr('datetime') ?? NOW,
                lastPostAt: $lastPost.find(selectors.topic.lastPostTime).attr('datetime') ?? NOW,
                isAnnouncement: $topic.closest('li').hasClass('announce'),
                totalPosts: parseNumber($posts.text()) ?? 0,
            };

            const userData: UserData[typeof Label.TOPIC_DETAIL] = {
                topic,
            };

            log.info(
                `[${Label.FORUM_CATEGORY}] Enqueuing topic ${title} (${crawlingStatistics.topicsEnqueued + 1}/${limit ?? 'unlimited'}).`,
            );

            crawlingStatistics.topicEnqueued();

            // check if we reached the limit and stop if so
            if (limit != null && crawlingStatistics.topicsEnqueued > limit) {
                log.info(`[${Label.FORUM_CATEGORY}] Limit of ${limit} topics reached, not enqueuing topic "${title}"`);
                return null;
            }

            return new Request({
                url,
                label: Label.TOPIC_DETAIL,
                userData,
            });
        })
        .filter((data) => data !== null);

    await addRequests(topicRequests);

    // check pagination for the forum site
    const { hasMultiplePages, isLastPage, nextPageElement } = checkPagination($(selectors.pagination).first());

    if (!hasMultiplePages || isLastPage) {
        log.info(`[${Label.FORUM_CATEGORY}] Reached last site of the forum category`);
        return;
    }

    const nextPageUrl = nextPageElement.find('a').first().attr('href');

    if (nextPageUrl == null) {
        return;
    }

    await addRequests([
        {
            url: nextPageUrl,
            label: Label.FORUM_CATEGORY,
            userData: {
                category: request.userData.category,
            },
        },
    ]);
};
