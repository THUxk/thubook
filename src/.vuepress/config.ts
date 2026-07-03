import { defineUserConfig } from "vuepress";
import theme from "./theme.js";
import { hopeTheme } from "vuepress-theme-hope";
export default defineUserConfig({
  base: "/thubook/",
  lang: "zh-CN",
  theme
});
