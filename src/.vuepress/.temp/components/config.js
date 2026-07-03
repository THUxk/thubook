import { defineClientConfig } from "@vuepress/client";
import { hasGlobalComponent } from "/root/thubook/node_modules/vuepress-plugin-components/lib/client/shared.js";
import { h } from "vue";

import Badge from "/root/thubook/node_modules/vuepress-plugin-components/lib/client/components/Badge.js";
import FontIcon from "/root/thubook/node_modules/vuepress-plugin-components/lib/client/components/FontIcon.js";
import BackToTop from "/root/thubook/node_modules/vuepress-plugin-components/lib/client/components/BackToTop.js";


import "/root/thubook/node_modules/vuepress-plugin-components/lib/client/styles/sr-only.scss";

export default defineClientConfig({
  enhance: ({ app }) => {
    if(!hasGlobalComponent("Badge")) app.component("Badge", Badge);
    if(!hasGlobalComponent("FontIcon")) app.component("FontIcon", FontIcon);
    
  },
  setup: () => {
    
  },
  rootComponents: [
    () => h(BackToTop, { threshold: 300 }),
    
  ],
});
