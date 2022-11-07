import { createRouter, createWebHistory } from "vue-router";
import { store } from "@/store";
import { Types, DocumentRoutes } from "../enums/Document";

import HomeView from "../views/home/IndexView.vue";
import HomeCreateProjectView from "../views/home/CreateProjectView.vue";
import HomeHelpView from "../views/home/HelpView.vue";
import HomeProjectView from "../views/home/ProjectView.vue";
import HomeDocumentView from "../views/home/DocumentView.vue";
import HomeTableView from "../views/home/TableView.vue";
import HomeDeskView from "../views/home/DeskView.vue";
import HomeTaskView from "../views/home/TaskView.vue";
import ProjectByCodeView from "../views/ProjectByCodeView.vue";
import DocumentByCodeView from "../views/DocumentByCodeView.vue";
import DeskByCodeView from "../views/DeskByCodeView.vue";
import AuthView from "../views/auth/IndexView.vue";
import AuthCheckView from "../views/auth/CheckView.vue";
import RecoveryView from "../views/recovery/IndexView.vue";
import RecoverySetPasswordView from "../views/recovery/SetPasswordView.vue";
import RecoverySuccessView from "../views/recovery/SuccessView.vue";
import RegistrationView from "../views/registration/IndexView.vue";
import RegistrationSetPasswordView from "../views/registration/SetPasswordView.vue";
import RegistrationTelegramView from "../views/registration/TelegramView.vue";
import RegistrationConfirmView from "../views/registration/ConfirmView.vue";
import RegistrationSuccessView from "../views/registration/SuccessView.vue";
import RegistrationSuccessTelegramView from "../views/registration/SuccessTelegramView.vue";
import RegistrationBindTelegramView from "../views/registration/BindTelegramView.vue";
import NewProjectCreateView from "../views/newProject/CreateView.vue";
import NewProjectInviteView from "../views/newProject/InviteView.vue";

import TestView from "../views/TestView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/test",
      name: "test",
      meta: {
        layout: "main-layout",
      },
      component: TestView,
    },
    {
      path: "/",
      name: "home",
      meta: {
        auth: true,
        layout: "main-layout",
      },
      component: HomeView,
    },
    {
      path: "/create-project",
      name: "home-create-project",
      meta: {
        auth: true,
        layout: "empty-layout",
      },
      component: HomeCreateProjectView,
    },
    {
      path: "/help",
      name: "home-help",
      meta: {
        auth: true,
        layout: "main-layout",
        contentClass: "full-width",
      },
      component: HomeHelpView,
    },
    {
      path: "/projects/:id",
      name: "home-project",
      meta: {
        auth: true,
        layout: "main-layout",
      },
      component: HomeProjectView,
    },
    {
      path: "/projects/:id/documents/:documentId",
      name: "home-document",
      meta: {
        auth: true,
        layout: "main-layout",
        type: DocumentRoutes[Types.document],
      },
      component: HomeDocumentView,
    },
    {
      path: "/projects/:id/desks/:deskId",
      name: "home-desk",
      meta: {
        auth: true,
        layout: "main-layout",
        type: DocumentRoutes[Types.desk],
      },
      component: HomeDeskView,
    },
    {
      path: "/projects/:id/tables/:tableId",
      name: "home-table",
      meta: {
        auth: true,
        layout: "main-layout",
        type: DocumentRoutes[Types.table],
      },
      component: HomeTableView,
    },
    {
      path: "/projects/:id/desks/:deskId/tasks/:taskId",
      name: "home-task",
      meta: {
        auth: true,
        layout: "main-layout",
      },
      component: HomeTaskView,
    },
    {
      path: "/project",
      name: "project-by-code",
      meta: {
        auth: true,
        layout: "main-layout",
      },
      component: ProjectByCodeView,
    },
    {
      path: "/document",
      name: "document-by-code",
      meta: {
        auth: true,
        layout: "main-layout",
      },
      component: DocumentByCodeView,
    },
    {
      path: "/desk",
      name: "desk-by-code",
      meta: {
        auth: true,
        layout: "main-layout",
      },
      component: DeskByCodeView,
    },
    {
      path: "/auth",
      name: "auth",
      meta: {},
      component: AuthView,
    },
    {
      path: "/auth/check",
      name: "check",
      meta: {},
      component: AuthCheckView,
    },
    {
      path: "/recovery",
      name: "recovery",
      meta: {},
      component: RecoveryView,
    },
    {
      path: "/recovery/setpassword",
      name: "recovery-setpassword",
      meta: {},
      component: RecoverySetPasswordView,
    },
    {
      path: "/recovery/success",
      name: "recovery-success",
      meta: {},
      component: RecoverySuccessView,
    },
    {
      path: "/registration",
      name: "registration",
      meta: {},
      component: RegistrationView,
    },
    {
      path: "/registration/setpassword",
      name: "registration-setpassword",
      meta: {},
      component: RegistrationSetPasswordView,
    },
    {
      path: "/registration/telegram",
      name: "registration-telegram",
      meta: {},
      component: RegistrationTelegramView,
    },
    {
      path: "/registration/confirm",
      name: "registration-confirm",
      meta: {},
      component: RegistrationConfirmView,
    },
    {
      path: "/registration/bind-telegram",
      name: "registration-bind-telegram",
      meta: {},
      component: RegistrationBindTelegramView,
    },
    {
      path: "/registration/success",
      name: "registration-success",
      meta: {},
      component: RegistrationSuccessView,
    },
    {
      path: "/registration/telegram-success",
      name: "registration-telegram-success",
      meta: {},
      component: RegistrationSuccessTelegramView,
    },
    {
      path: "/new-project/create",
      name: "new-project-create",
      meta: {
        auth: true,
        layout: "new-project-layout",
      },
      component: NewProjectCreateView,
    },
    {
      path: "/new-project/invite",
      name: "new-project-invite",
      meta: {
        auth: true,
        layout: "new-project-layout",
      },
      component: NewProjectInviteView,
    },
  ],
});

router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.auth)) {
    if (store.getters["auth/isLoggedIn"]) {
      next();
      return;
    }
    next("/auth");
  } else {
    next();
  }
});

export default router;
