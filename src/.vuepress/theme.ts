import { hopeTheme } from "vuepress-theme-hope";
import navbar from "./navbar.js";
import sidebar from "./sidebar.js";

export default hopeTheme({
  navbar,
  displayFooter: true,
  toc:true,
  breadcrumb:true,
  navTitle:"THU手册",
  darkmode:"disable",
  sidebar,
  headerDepth:1,
  contributors: false
})

