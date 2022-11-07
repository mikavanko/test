<script>
import { computed, onMounted, reactive, watch } from "vue";
import { useStore } from "vuex";
import { useRouter, useRoute } from "vue-router";
import { isMobile } from "@/assets/js/utils";

import ModalUserSettings from "@/components/VModalUserSettings.vue";
import ModalChangeEmail from "@/components/VModalChangeEmail.vue";
import ModalChangePhone from "@/components/VModalChangePhone.vue";
import ModalChangePassword from "@/components/VModalChangePassword.vue";
import ModalMembers from "@/components/VModalMembers.vue";
import ModalSearchDocuments from "@/components/VModalSearchDocuments.vue";
import ModalChooseProject from "@/components/VModalChooseProject.vue";

import NavbarBottom from "@/components/VNavbarBottom.vue";

import ModalDesktop from "@/components/VModalDesktop.vue";
import Sidebar from "@/components/VSidebar.vue";

import NavbarTop from "@/components/VNavbarTop.vue";

export default {
  components: {
    ModalUserSettings,
    ModalChangeEmail,
    ModalChangePhone,
    ModalChangePassword,
    ModalMembers,
    ModalDesktop,
    Sidebar,
    ModalSearchDocuments,
    ModalChooseProject,
    NavbarBottom,
    NavbarTop,
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const route = useRoute();

    const state = reactive({
      width: window.innerWidth,
    });

    const isMenuVisible = computed(() => store.getters["menu/isVisible"]);
    const projects = computed(() => store.getters["projects/getProjects"])
    const contentClass = computed(()=>route.meta.contentClass)

    const fetchCurrentUser = () => store.dispatch("auth/getUser");
    const getProjects = async () => {
      const params = {
        page: 1,
        perPage: 200,
      };

      return await store.dispatch("projects/getProjects", params);
    };

    const getProjectUsers = async () => {
      const params = {
        page: 1,
        perPage: 20,
      };

      return await store.dispatch("projects/getProjectUsers", {
        id: currentProject?.value?.id,
        params,
      });
    };

    const getDocuments = async (projectId) => {
      const params = {
        limit: 30,
      };

      store.dispatch("documents/getDocuments", { params, projectId })
    }

    const user = computed(() => store.getters["auth/getUser"]);
    const currentProject = computed(
      () => store.getters["projects/getCurrentProject"]
    );

    const setCurrentProject = () => {
      return new Promise((resolve, reject) => {
        const projectId = route.params.id
        if (projectId) {
          // 1) если зашли на страницу проекта
          const projectExist = projects.value.find(p => parseInt(p.id) === parseInt(projectId))
          if (projectExist) {
            // 1.1) и если проект существует
            store.dispatch("projects/setCurrentProject", projectExist);

            resolve(projectExist)
          } else {
            // 1.2) если проекта не существует
          }
        } else {
          // 2) если зашли на любую другую страницу
          if (!currentProject.value) {
            if(projects.value[0]){
              store.dispatch("projects/setCurrentProject", projects.value[0]);
              
              resolve(projects.value[0])
            }
          }else{
            store.dispatch("projects/setCurrentProject", currentProject.value);
            
            resolve(currentProject.value)
          }
        }
        resolve(null)
      })
    }

    onMounted(async () => {
      fetchCurrentUser();

      await getProjects();

      setCurrentProject().then(res=>{
        if(res?.id){
          router.push({ path: `/projects/${res.id}` })
        }else{
          router.push({ path: `/create-project` })
        }
      })

      getProjectUsers();

      if(currentProject.value?.id){
        getDocuments(currentProject.value.id)
      }
    });

    watch(
      () => route.params.id,
      (projectId) => {
        if (projectId) {
          getDocuments(projectId)
        }
      }
    )

    return {
      user,
      isMobile,
      state,
      isMenuVisible,
      contentClass,
    };
  },
};
</script>

<template>
  <div class="page">
    <Sidebar />
    <div :class="['frame']" :style="{
      '--width': state.width + 'px',
      '--minWidth': state.width + 'px',
    }">
      <NavbarTop />
      <div data-simplebar class="scroll">
        <div :class="['content', contentClass]">
          <RouterView />
        </div>
      </div>
    </div>
    <NavbarBottom />
  </div>

  <ModalDesktop :user="user" />
  <ModalUserSettings :user="user" />
  <ModalChangeEmail :user="user" />
  <ModalChangePhone :user="user" />
  <ModalChangePassword />
  <ModalMembers />
  <Teleport to="body">
    <ModalSearchDocuments />
  </Teleport>
  <Teleport to="body">
    <ModalChooseProject />
  </Teleport>
</template>

<style lang="scss" scoped>
.content {
  @media all and (min-width: $xl) {
    max-width: 900px;
    margin: 0 auto;
  }

  &.full-width{
    max-width: 100%;
  }
}

.scroll {
  min-height: 0;
  flex-grow: 1;
}

.nav {
  background-color: $color-light;
  border-top: 1px solid $color-dark-10;
  height: $bottomNavbarHeight;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 888;
  display: flex;
  justify-content: center;
  align-items: flex-start;

  &-item {
    padding-top: 6px;
    width: 75px;
    font-size: 24px;
    color: $color-dark-70;
    margin: 0 12px;
    text-align: center;
    height: 100%;
  }
}

.frame {
  overflow-y: hidden;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  min-width: var(--minWidth);
  width: var(--width);
  z-index: 1;

  @media all and (min-width: $xl) {
    min-width: 1px;
    width: auto;
  }
}

.page {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: relative;
  display: flex;
  flex: 1 1 0%;
  background: $color-light;
  cursor: text;
  user-select: none;
  padding-bottom: $bottomNavbarHeight;

  @media all and (min-width: $xl) {
    padding-bottom: 0;
  }
}
</style>