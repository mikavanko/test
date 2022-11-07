import { app } from "./main-app";

import EmptyLayout from "@/layouts/EmptyLayout.vue";
import EmptyBgLayout from "@/layouts/EmptyBgLayout.vue";
import MainLayout from "@/layouts/MainLayout.vue";
import NewProjectLayout from "@/layouts/NewProjectLayout.vue";

app.component("empty-layout", EmptyLayout);
app.component("empty-bg-layout", EmptyBgLayout);
app.component("main-layout", MainLayout);
app.component("new-project-layout", NewProjectLayout);