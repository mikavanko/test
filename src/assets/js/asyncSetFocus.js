import { nextTick } from "vue";
import { useSetFocus } from "./focus";

export async function useAsyncSetFocus(element) {
  await nextTick();
  setTimeout(function () {
    let el = null;
    if (typeof element === "string") {
      el = document.getElementById(element);
    } else if (element instanceof HTMLElement) {
      el = element;
    }
    el && useSetFocus(el);
  }, 0);
}
