import { app } from "./main-app";
import PerfectScrollbar from "vue3-perfect-scrollbar";
import "vue3-perfect-scrollbar/dist/vue3-perfect-scrollbar.css";

app.use(PerfectScrollbar, {
  options: {
    maxScrollbarLength: 50,
  },
});