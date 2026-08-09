import { defineClientConfig } from "@vuepress/client";
import { h } from "vue";
import { SearchBox } from "./components/SearchBox.js";

const locales = __SEARCH_LOCALES__;
const hotKeys = __SEARCH_HOT_KEYS__;
const maxSuggestions = __SEARCH_MAX_SUGGESTIONS__;

export default defineClientConfig({
  enhance({ app }) {
    // 覆盖插件默认注册的 SearchBox 组件
    app.component("SearchBox", (props) =>
      h(SearchBox, {
        locales,
        hotKeys,
        maxSuggestions,
        ...props,
      })
    );
  },
});
