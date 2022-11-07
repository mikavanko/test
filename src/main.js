import { app } from "./plugins/main-app";

import "./plugins/register-icons";
import "./plugins/register-layouts";
import "./plugins/modal-directives";
import "./plugins/token";
import "./plugins/toast";
import "./plugins/perfectScrollbar";
import "./plugins/simplebar";

import router from "./router";
import { store } from "@/store";
import navbarPlugin from "@/plugins/navbar.js";

app.use(router);
app.use(store);
app.use(navbarPlugin);

import "@/assets/scss/main.scss";

app.mount("#app");
