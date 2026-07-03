import { reveal, revealMarkdown } from "/root/thubook/node_modules/vuepress-plugin-md-enhance/lib/client/reveal/index.js";

export const useReveal = () => [reveal(), revealMarkdown()];
