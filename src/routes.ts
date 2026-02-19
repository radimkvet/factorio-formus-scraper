import { createCheerioRouter } from 'crawlee';

import { forumCategoryHandler } from './routes/forumCategory.js';
import { forumSearchStartHandler } from './routes/searchStart.js';
import { topicDetailHandler } from './routes/topicDetail.js';
import { Label } from './types/label.js';

export const router = createCheerioRouter();

router.addHandler(Label.FORUM_SEARCH_START, forumSearchStartHandler);
router.addHandler(Label.FORUM_CATEGORY, forumCategoryHandler);
router.addHandler(Label.TOPIC_DETAIL, topicDetailHandler);
