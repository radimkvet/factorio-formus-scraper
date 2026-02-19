This scraper collects data from forum of the game [Factorio](https://forums.factorio.com/).
It does not go around the login, so it does not scrape user detail page.

It scrapes only one category from the forum which is provided as input.
There is also option to scrape only specific number of topics.
A topic is a page with posts provide by users.

## Inputs

For up to date information about inputs see the [input page](https://console.apify.com/actors/A448q9dopTHFBMkUf/input)

| Name     | Required | Use                                  |
| -------- | -------- | ------------------------------------ |
| Category | yes      | Category to scrape from the page     |
| Limit    | yes      | How many topics to scrape at maximum |

## Output

The output is a single comment (post) on the topic with all associated information about the topic this comment belongs to.

### Example output

```
{
 "author": "Carl",
 "publishedAt": "2020-09-07T12:30:00+00:00",
 "text": "This game is the best!",
 "topic": {
  "category": "news",
  "title": "Is this the best game?",
  "views": 12345,
  "url": "https://forums.factorio.com/viewtopic.php?t=0000001",
  "author": "FactorioBot",
  "createdAt": "2020-01-01T12:00:01+00:00",
  "lastPostAt": "2020-02-01T23:13:37+00:00",
  "isAnnouncement": true,
  "totalPosts": 123
 }
}
```
