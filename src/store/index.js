import { createStore } from "vuex";
import axios from "axios";

import auth from "@/store/modules/auth";
import registration from "@/store/modules/registration";
import menu from "@/store/modules/menu";
import projects from "@/store/modules/projects";
import documents from "@/store/modules/documents";

export const store = new createStore({
  modules: {
    auth,
    registration,
    menu,
    projects,
    documents,
  },
});
