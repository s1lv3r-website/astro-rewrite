// @ts-check
import { defineConfig } from "astro/config";

import mdx from "@astrojs/mdx";
import tailwindcss from "@tailwindcss/vite";
import sectionize from "remark-sectionize";

// https://astro.build/config
export default defineConfig({
  integrations: [mdx()],
  server: {
    host: "0.0.0.0",
    allowedHosts: true,
  },
  devToolbar: { enabled: false },

  vite: {
    plugins: [tailwindcss()],
  },

  markdown: {
    remarkPlugins: [sectionize],
  },
});
