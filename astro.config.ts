// @ts-check
import { defineConfig } from "astro/config";

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

import sectionize from "remark-sectionize";
import externalLinks, { type Options as externalLinksOptions } from "rehype-external-links";
import rehypePrettyCode, { type Options as rehypePrettyCodeOptions } from "rehype-pretty-code"
import { transformerCopyButton } from "@rehype-pretty/transformers";


// https://astro.build/config
export default defineConfig({
  site: "https://s1lv3r.codes",
  integrations: [mdx(), sitemap()],
  server: {
    host: "0.0.0.0",
    allowedHosts: true,
  },
  devToolbar: { enabled: false },

  markdown: {
    syntaxHighlight: false,
    remarkPlugins: [sectionize],
    rehypePlugins: [
      [
        externalLinks,
        {
          rel: ["noopener", "noreferrer"],
          target: "_blank"
        } as externalLinksOptions
      ],
      [
        rehypePrettyCode,
        {
          theme: "dark-plus",
          defaultLang: "plaintext",
          bypassInlineCode: true,
          transformers: [
            transformerCopyButton({
              visibility: "hover",
              feedbackDuration: 2_500,
            })
          ]
        } as rehypePrettyCodeOptions
      ],
    ]
  },
});
