
import { app } from "./main-app";
import $bus from "@/assets/js/eventBus.js"

app.config.globalProperties.$bus = $bus;

app.directive("modal-open", {
  mounted(el, binding) {
    el.addEventListener("click", () => {
      // binding.instance unexpectedly not working ...
      // binding.instance.$bus.$emit(`modal-open:${binding.value}`)
      $bus.$emit(`modal-open:${binding.value}`);
    });
  },
});

app.directive("modal-close", {
  mounted(el, binding) {
    el.addEventListener("click", () => {
      // binding.instance unexpectedly not working ...
      // binding.instance.$bus.$emit(`modal-close:${binding.value}`)
      $bus.$emit(`modal-close:${binding.value}`);
    });
  },
});