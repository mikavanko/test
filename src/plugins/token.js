import { app } from "./main-app";

import axios from "axios";
import VueAxios from "vue-axios";

const token = localStorage.getItem("token");
if (token) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}
app.use(VueAxios, axios);
app.provide("axios", app.config.globalProperties.axios);