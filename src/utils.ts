import { render, type CollectionEntry } from "astro:content";
import { DESCRIPTION_TRIM_LENGTH } from "./constants";
import jsdom from "jsdom";

/**
 * Gives plain text output of a rendered HTML document. Based on https://stackoverflow.com/questions/74116249
 *
 * @export
 * @param {CollectionEntry<"blog">} [post] Post to get content from
 * @return {string} The content itself
 */
export async function getPostText(post: CollectionEntry<"blog">): Promise<string> {
  await render(post);

  const htmlString = post.rendered!.html;

  const dom = new jsdom.JSDOM(htmlString);
  const { document, NodeFilter } = dom.window
  const walker = document.createTreeWalker(document, NodeFilter.SHOW_TEXT);


  const textList: Node[] = [];
  let currentNode: Node | null = walker.currentNode;

  while (currentNode) {
    textList.push((currentNode as any).textContent);
    currentNode = walker.nextNode();
  }

  return textList.join("");
}

export async function getDescription(post: CollectionEntry<"blog">): Promise<string> {
  let desc = post.data.description;

  if (!desc) {
    desc = await getPostText(post);
  }

  return desc.length > DESCRIPTION_TRIM_LENGTH
    ? desc.substring(0, DESCRIPTION_TRIM_LENGTH) + "..."
    : desc;
}
