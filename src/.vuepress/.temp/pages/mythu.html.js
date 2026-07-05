export const data = JSON.parse("{\"key\":\"v-41a49a5d\",\"path\":\"/mythu.html\",\"title\":\"我的THU\",\"lang\":\"zh-CN\",\"frontmatter\":{\"title\":\"我的THU\"},\"headers\":[],\"readingTime\":{\"minutes\":0.09,\"words\":28},\"filePathRelative\":\"mythu.md\"}")

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
