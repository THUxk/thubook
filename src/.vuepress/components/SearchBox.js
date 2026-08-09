import { useRouteLocale } from "@vuepress/client";
import { computed, defineComponent, h, ref, toRefs, watch } from "vue";
import { useRouter } from "vue-router";
import { useHotKeys, useSearchIndex } from "@vuepress/plugin-search/client";

// 检查文本中是否包含所有查询词
const isMatched = (text, words) => {
  if (!text) return false;
  const lower = text.toLowerCase();
  return words.every((w) => lower.includes(w));
};

// 检查文本中是否包含任意一个查询词
const hasAnyMatch = (text, words) => {
  if (!text) return false;
  const lower = text.toLowerCase();
  return words.some((w) => lower.includes(w));
};

// 从正文中找到包含关键词的上下文片段
const extractSnippet = (content, words, maxLen = 80) => {
  if (!content) return "";
  const lower = content.toLowerCase();
  const pos = words.map((w) => lower.indexOf(w)).find((p) => p > -1);
  if (pos === undefined || pos < 0) return "";

  const half = Math.max(10, Math.floor((maxLen - 20) / 2));
  let start = Math.max(0, pos - half);
  let end = Math.min(content.length, start + maxLen);
  start = Math.max(0, content.lastIndexOf(" ", start));
  if (end < content.length) {
    const nextSpace = content.indexOf(" ", end);
    if (nextSpace > -1) end = nextSpace;
  }
  let snippet = content.slice(start, end).trim();
  if (start > 0) snippet = "…" + snippet;
  if (end < content.length) snippet = snippet + "…";
  return snippet;
};

export const SearchBox = defineComponent({
  name: "SearchBox",
  props: {
    locales: { type: Object, required: false, default: () => ({}) },
    hotKeys: { type: Array, required: false, default: () => [] },
    maxSuggestions: { type: Number, required: false, default: 10 },
  },
  setup(props) {
    const { locales, hotKeys, maxSuggestions } = toRefs(props);
    const router = useRouter();
    const routeLocale = useRouteLocale();
    const searchIndex = useSearchIndex();

    const input = ref(null);
    const isActive = ref(false);
    const query = ref("");
    const debouncedQuery = ref("");
    const focusIndex = ref(0);
    const locale = computed(() => locales.value[routeLocale.value] ?? {});

    useHotKeys({ input, hotKeys });

    // 防抖：输入后 200ms 才触发搜索
    let timer = null;
    watch(query, (val) => {
      clearTimeout(timer);
      const trimmed = val.trim();
      // 短查询立即响应
      if (trimmed.length <= 2) {
        debouncedQuery.value = trimmed;
        focusIndex.value = 0;
        return;
      }
      timer = setTimeout(() => {
        debouncedQuery.value = trimmed;
        focusIndex.value = 0;
      }, 200);
    });

    // 预计算当前 locale 的搜索索引
    const localIndex = computed(() => {
      const locale = routeLocale.value;
      const SEP = "\u001f";
      return searchIndex.value
        .filter((item) => item.pathLocale === locale)
        .map((item) => {
          // 每个 extraField 格式为 "slug\x1ftext"，解析为段落列表
          const sections = (item.extraFields || []).map((field) => {
            const sepIdx = field.indexOf(SEP);
            const slug = sepIdx >= 0 ? field.slice(0, sepIdx) : "";
            const text = sepIdx >= 0 ? field.slice(sepIdx + 1) : field;
            return { slug, text, textLower: text.toLowerCase() };
          });
          return {
            title: item.title,
            headers: item.headers || [],
            path: item.path,
            sections,
            titleLower: item.title.toLowerCase(),
          };
        });
    });

    const suggestions = computed(() => {
      const q = debouncedQuery.value.toLowerCase();
      if (!q) return [];
      const words = q.split(/\s+/g).map((s) => s.trim()).filter(Boolean);
      if (!words.length) return [];
      const max = maxSuggestions.value;
      const results = [];

      for (const item of localIndex.value) {
        if (results.length >= max) break;

        // 1. 匹配页面标题
        if (isMatched(item.titleLower, words)) {
          results.push({
            link: item.path,
            title: item.title,
            header: "",
            snippet: "",
          });
          continue;
        }

        // 2. 匹配标题 headers
        let headerFound = false;
        const checkHeader = (header) => {
          if (results.length >= max || headerFound) return;
          const hLower = header.title.toLowerCase();
          if (isMatched(hLower, words)) {
            results.push({
              link: `${item.path}#${header.slug}`,
              title: item.title,
              header: header.title,
              snippet: "",
            });
            headerFound = true;
            return;
          }
          for (const child of header.children || []) {
            if (headerFound) return;
            checkHeader(child);
          }
        };

        for (const header of item.headers) {
          if (results.length >= max || headerFound) break;
          checkHeader(header);
        }

        if (headerFound) continue;

        // 3. 匹配正文段落，命中后携带所属标题 slug 精确跳转
        for (const section of item.sections) {
          if (results.length >= max) break;
          if (section.textLower && hasAnyMatch(section.textLower, words)) {
            const snippet = extractSnippet(section.text, words);
            results.push({
              link: section.slug
                ? `${item.path}#${section.slug}`
                : item.path,
              title: item.title,
              header: "",
              snippet,
            });
            break; // 每页只取第一个匹配段落
          }
        }
      }
      return results;
    });

    const showSuggestions = computed(
      () => isActive.value && !!suggestions.value.length
    );

    const focusNext = () => {
      if (focusIndex.value < suggestions.value.length - 1) focusIndex.value++;
      else focusIndex.value = 0;
    };
    const focusPrev = () => {
      if (focusIndex.value > 0) focusIndex.value--;
      else focusIndex.value = suggestions.value.length - 1;
    };

    const goTo = (index) => {
      const suggestion = suggestions.value[index];
      if (!suggestion) return;
      const hashIdx = suggestion.link.indexOf("#");
      const path = hashIdx >= 0 ? suggestion.link.slice(0, hashIdx) : suggestion.link;
      const hash = hashIdx >= 0 ? suggestion.link.slice(hashIdx + 1) : "";

      router.push(suggestion.link).then(() => {
        query.value = "";
        debouncedQuery.value = "";
        focusIndex.value = 0;
        // 跳转后滚动到锚点元素
        if (hash) {
          // 多次尝试，等待页面渲染完成
          const scrollToAnchor = (retries = 10) => {
            const el = document.getElementById(hash);
            if (el) {
              el.scrollIntoView({ behavior: "smooth", block: "start" });
            } else if (retries > 0) {
              setTimeout(() => scrollToAnchor(retries - 1), 100);
            }
          };
          setTimeout(() => scrollToAnchor(), 150);
        }
      });
    };

    const renderHighlighted = (text) => {
      if (!text) return null;
      const q = debouncedQuery.value.trim();
      if (!q) return text;
      const words = q
        .split(/\s+/g)
        .map((s) => s.trim())
        .filter(Boolean)
        .sort((a, b) => b.length - a.length);
      if (!words.length) return text;

      const escaped = words.map((w) =>
        w.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")
      );
      const splitRegex = new RegExp(`(${escaped.join("|")})`, "gi");
      const testRegex = new RegExp(`^(?:${escaped.join("|")})$`, "i");
      const parts = text.split(splitRegex);

      return parts.map((part) => {
        if (part && testRegex.test(part)) {
          return h("span", { class: "search-highlight" }, part);
        }
        return part;
      });
    };

    return () =>
      h("form", { class: "search-box", role: "search" }, [
        h("input", {
          ref: input,
          type: "search",
          placeholder: locale.value.placeholder || "搜索",
          autocomplete: "off",
          spellcheck: false,
          value: query.value,
          onFocus: () => (isActive.value = true),
          onBlur: () => {
            setTimeout(() => (isActive.value = false), 150);
          },
          onInput: (event) => {
            query.value = event.target.value;
          },
          onKeydown: (event) => {
            switch (event.key) {
              case "ArrowUp":
                event.preventDefault();
                if (showSuggestions.value) focusPrev();
                break;
              case "ArrowDown":
                event.preventDefault();
                if (showSuggestions.value) focusNext();
                break;
              case "Enter":
                event.preventDefault();
                goTo(focusIndex.value);
                break;
            }
          },
        }),
        showSuggestions.value &&
          h(
            "ul",
            {
              class: "suggestions",
              onMouseleave: () => (focusIndex.value = -1),
            },
            suggestions.value.map((suggestion, index) =>
              h(
                "li",
                {
                  class: ["suggestion", { focus: focusIndex.value === index }],
                  onMouseenter: () => (focusIndex.value = index),
                  onMousedown: () => goTo(index),
                },
                h(
                  "a",
                  {
                    href: suggestion.link,
                    onClick: (event) => event.preventDefault(),
                  },
                  [
                    h(
                      "span",
                      { class: "page-title" },
                      renderHighlighted(suggestion.title)
                    ),
                    suggestion.header
                      ? h(
                          "span",
                          { class: "page-header" },
                          "› " + suggestion.header
                        )
                      : null,
                    suggestion.snippet
                      ? h(
                          "span",
                          { class: "page-snippet" },
                          renderHighlighted(suggestion.snippet)
                        )
                      : null,
                  ]
                )
              )
            )
          ),
      ]);
  },
});
