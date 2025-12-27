import rss, { type RSSFeedItem } from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { RSS_AUTHOR_EMAIL, SITE_NAME, TAGLINE } from '../../constants';
import { getCollection, render } from 'astro:content';
import { getDescription } from '../../utils';

export const GET: APIRoute = async (context) => {
  const posts = await getCollection("blog");

  return rss({
    // `<title>` field in output xml
    title: SITE_NAME,

    // `<description>` field in output xml
    description: TAGLINE,

    // Pull in your project "site" from the endpoint context
    // https://docs.astro.build/en/reference/api-reference/#site
    site: context.site!,

    // Array of `<item>`s in output xml
    // See "Generating items" section for examples using content collections and glob imports
    items: await Promise.all<RSSFeedItem>(posts.map(async post => ({
      title: post.data.title,
      author: RSS_AUTHOR_EMAIL,
      pubDate: post.data.pubDate,
      description: await getDescription(post),
      link: `/blog/${post.id}`,
      customData: post.data.updatedDate ? `<lastBuildDate>${post.data.updatedDate}</lastBuildDate>` : undefined
    } satisfies RSSFeedItem))),

    // (optional) inject custom xml
    customData: `<language>en-us</language>`,
  });
}
