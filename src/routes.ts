import { createCheerioRouter } from 'crawlee';
import { forumSearchStartHandler } from './routes/searchStart.js';
import { Label } from './types/label.js';
export const router = createCheerioRouter();
router.addHandler(Label.FORUM_SEARCH_START, forumSearchStartHandler);
