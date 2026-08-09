import { defineUserConfig } from "vuepress";
import { path } from "@vuepress/utils";
import theme from "./theme.js";
import { hopeTheme } from "vuepress-theme-hope";
import { searchPlugin } from "@vuepress/plugin-search";

const search = searchPlugin({
  locales: {
    "/": {
      placeholder: "搜索内容",
    },
  },
  maxSuggestions: 10,
  hotKeys: ["s", "/", "k"],
  // 按 HTML 标题标签将正文拆分为多段，每段携带所属标题的 slug（用于精确锚点跳转）
  getExtraFields: (page) => {
    const html = page.contentRendered || "";
    const SEP = "\u001f"; // ASCII Unit Separator
    const sections = [];
    const headerRegex = /<h[1-6][^>]*\sid="([^"]*)"[^>]*>/gi;
    let lastSlug = "";
    let lastIdx = 0;
    let match;

    // 将 HTML 片段转为可搜索的纯文本，保留图片 alt 和链接/代码文本
    const htmlToText = (fragment) =>
      fragment
        .replace(/<img[^>]*\salt="([^"]*)"[^>]*>/gi, " $1 ") // 保留图片 alt
        .replace(/<[^>]+>/g, " ") // 去除其余 HTML 标签
        .replace(/&[a-z]+;/gi, " ")
        .replace(/\s+/g, " ")
        .trim();

    while ((match = headerRegex.exec(html)) !== null) {
      const chunk = htmlToText(html.slice(lastIdx, match.index));
      if (chunk) sections.push(lastSlug + SEP + chunk.slice(0, 1000));
      lastSlug = match[1];
      lastIdx = match.index;
    }
    const remaining = htmlToText(html.slice(lastIdx));
    if (remaining) sections.push(lastSlug + SEP + remaining.slice(0, 1000));

    return sections;
  },
});

// 用自定义 clientConfigFile 覆盖插件的，避免 SearchBox 双重注册
search.clientConfigFile = path.resolve(__dirname, "client.js");

export default defineUserConfig({
  base: "/thubook/",
  lang: "zh-CN",
  theme,
  plugins: [search],
});
