import { Actor } from 'apify';

type CrawlingStats = {
    topicsEnqueued: number;
    topicsScraped: number;
    postsScraped: number;
};

/**
 * Crawling statistics tracker class.
 *
 * It is implemented as a singleton to ensure that all parts of the application are using the same instance and statistics.
 * State managment is handled by Apify's KV store and Actor.useState function so that even after ressurection it keeps the same statistics.
 */
export class CrawlingStatistics {
    private static instancePromise: Promise<CrawlingStatistics> | undefined;
    private static readonly CRAWLING_STATISTICS_KEY = 'stats';

    #crawlingStatistics: CrawlingStats = { topicsEnqueued: 0, topicsScraped: 0, postsScraped: 0 };

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    private constructor() {}

    /**
     * Get the singleton instance of CrawlingStatistics.
     * Handles concurrent initialization requests by caching the initialization promise.
     *
     * @returns Promise that resolves to the singleton instance
     */
    // eslint-disable-next-line @typescript-eslint/promise-function-async
    static getInstance(): Promise<CrawlingStatistics> {
        if (!this.instancePromise) {
            this.instancePromise = (async () => {
                const instance = new CrawlingStatistics();
                await instance.initialize();
                return instance;
            })();
        }
        return this.instancePromise;
    }

    /**
     * Initialize the state with either state from before ressurection or with default values.
     */
    private async initialize(): Promise<void> {
        this.#crawlingStatistics = await Actor.useState<CrawlingStats>(CrawlingStatistics.CRAWLING_STATISTICS_KEY, {
            topicsEnqueued: 0,
            topicsScraped: 0,
            postsScraped: 0,
        });
    }

    /**
     * Call this method every time you want to indicate that a topic was added to the crawler's queue.
     * This is usefull for checking how many topics have been enqueued so far and if the defined limit has been reached.
     *
     * @param count how many topics have been enqueued, 1 by default
     */
    topicEnqueued(count = 1) {
        this.#crawlingStatistics.topicsEnqueued += count;
    }

    /**
     * Call this method every time you want to indicate that a topic was scraped by the crawler.
     * This is useful for tracking how many topics have been scraped so far.
     *
     * @param count how many topics have been scraped by the crawler, 1 by default
     */
    topicScraped(count = 1) {
        this.#crawlingStatistics.topicsScraped += count;
    }

    /**
     * Call this method every time you want to indicate that a post was scraped by the crawler.
     * This is usefull for tracking how many posts have been scraped so far, since one topic can have multiple posts.
     *
     * @param count how many pasts have been scraped by the crawler, 1 by default
     */
    postsScraped(count = 1) {
        this.#crawlingStatistics.postsScraped += count;
    }

    /**
     * Return how many topics have been enqueued so far.
     * This indicates how many topics have been enqueued throughout the whole crawling process, even before ressurection.
     * This is NOT how many topics are currently in the queue, for that use `topicsInQueue`.
     */
    get topicsEnqueued() {
        return this.#crawlingStatistics.topicsEnqueued;
    }

    /**
     * Return how many topics are currently in queue.
     *
     * Depending on were the topicScraped method is called, this might be off by 1 if the method is called after the topic is scraped fully.
     */
    get topicsInQueue() {
        return this.#crawlingStatistics.topicsEnqueued - this.#crawlingStatistics.topicsScraped;
    }
}
