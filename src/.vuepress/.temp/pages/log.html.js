export const data = JSON.parse("{\"key\":\"v-4bf7f20e\",\"path\":\"/log.html\",\"title\":\"更新日志\",\"lang\":\"zh-CN\",\"frontmatter\":{\"title\":\"更新日志\"},\"headers\":[],\"readingTime\":{\"minutes\":2.52,\"words\":756},\"filePathRelative\":\"log.md\"}")

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept()
  if (__VUE_HMR_RUNTIME__.updatePageData) {
    __VUE_HMR_RUNTIME__.updatePageData(data)
  }
}

if (import.meta.hot) {
  import.meta.hot.accept(({ data }) => {
    __VUE_HMR_RUNTIME__.updatePageData(data)
  })
}
