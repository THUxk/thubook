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
  // 提取页面正文内容加入搜索索引，实现全文精细搜索
  getExtraFields: (page) => {
    const text = page.contentRendered
      ?.replace(/<[^>]+>/g, " ")
      .replace(/&[a-z]+;/gi, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 2000);
    return text ? [text] : [];
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
