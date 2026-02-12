import { Actor, log } from 'apify';

await Actor.init();

log.info('Hello from the Actor!');

await Actor.exit();
