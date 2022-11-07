import { app } from "./main-app";

import SvgIcon from "@/components/global/SvgIcon.vue";
app.component("svg-icon", SvgIcon);

const globalComponentsPaths = import.meta.globEager("/src/assets/icons/svg/*.svg");

Object.entries(globalComponentsPaths).forEach(([path, module]) => {
  const componentName = path
    .split('/')
    .pop()
    .replace(/\.svg$/, '');

  app.component(componentName, module.default);
});
