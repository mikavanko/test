<script>
import { reactive, computed } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import Modal from "@/components/VModal.vue";

import { isMobile } from "@/assets/js/utils";

import Draggable from "vuedraggable";

import DragHandleIcon from "@/assets/icons/svg/drag-handle.svg";
import PlusIcon from "@/assets/icons/svg/plus.svg";

export default {
  emits: ["update:isVisible"],
  props: {
    isVisible: {
      type: Boolean,
      default: false,
    },
    desktop: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    const store = useStore();
    const router = useRouter();

    const user = computed(() => store.getters["auth/getUser"]);
    const projects = computed({
      get() {
        return store.getters["projects/getProjects"];
      },
      set(val) {
        store.commit("projects/setProjects", val);
      },
    });

    const isModalVisible = computed({
      get() {
        return props.isVisible;
      },
      set(val) {
        emit("update:isVisible", val);
      },
    });

    const state = reactive({
      projects,
    });

    const addProject = () => {
      router.push({path: "/new-project/create"})
    };
    const startDrag = () => {
      // console.log(state.projects);
    };
    const endDrag = () => {
      // console.log(state.projects);
    };

    const logout = () => {
      store.dispatch("auth/logout");
      router.push({ path: "/auth" });
    };

    const goToProject = (project) => {
      isModalVisible.value = false
      store.dispatch("projects/setCurrentProject", project);
      router.push({path: `/projects/${project.id}`})
    }

    return {
      state,
      user,
      isMobile,
      isModalVisible,
      addProject,
      startDrag,
      endDrag,
      logout,
      projects,
      goToProject,
    };
  },
  components: {
    Modal,
    Draggable,
    DragHandleIcon,
    PlusIcon,
  },
};
</script>

<template>
  <Modal
    id="modal-choose-project"
    :title="'Мои проекты'"
    v-model="isModalVisible"
    :width="isMobile() ? '100%' : '320px'"
    :height="isMobile() ? '100%' : 'auto'"
    :customBodyClass="'custom-body-class'"
    :customWrapperClass="!isMobile() ? 'desktop-wrapper-class' : ''"
    :showModalTop="isMobile()"
  >
    <div class="projects">
      <PerfectScrollbar :options="{ maxScrollbarLength: 100 }">
        <div class="projects-top">
          <div class="user-email">{{ user.email }}</div>
          <PlusIcon class="add-project" @click="addProject" />
        </div>
        <div class="projects-body">
          <Draggable
            v-model="projects"
            group="projects"
            @start="startDrag"
            @end="endDrag"
            item-key="id"
            :disabled="isMobile()"
          >
            <template #item="{ element }">
              <div :class="['draggable-item']" @click="goToProject(element)">
                <svg-icon v-if="!isMobile()"  name="drag-handle"  class="draggable-item__icon" />
                <div class="draggable-item__avatar">
                  {{ element.name[0] }}
                </div>
                <span class="draggable-item__name">
                  {{ element.name }}
                </span>
              </div>
            </template>
          </Draggable>
        </div>
      </PerfectScrollbar>
      <div class="projects-footer">
        <div class="logout" @click="logout">Выйти из аккаунта</div>
      </div>
    </div>
  </Modal>
</template>

<style lang="scss" scoped>
.draggable-item {
  height: 42px;
  padding: 5px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: flex-start;

  &__icon {
    font-size: 24px;
    margin-right: 5px;
  }
  &__avatar {
    width: 28px;
    height: 28px;
    background-color: $color-dark-20;
    font-weight: 400;
    font-size: 16px;
    border-radius: 3px;
    overflow: hidden;
    color: $color-light;
    display: flex;
    justify-content: center;
    align-items: center;
    text-transform: uppercase;
    margin-right: 10px;
  }
  &__name {
    flex-grow: 1;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
  }

  &:not(:last-child) {
    margin-bottom: 5px;
  }

  &:hover {
    background-color: $color-light-f;
  }

  &.sortable-ghost {
    opacity: 0.3;
  }

  @media all and (max-width: $xl - 1px) {
    height: 48px;
    padding: 5px 24px;
    border-top: 1px solid $color-dark-10;
    
    &:not(:last-child) {
      margin-bottom: 0;
    }
  }
}
.projects-scroll{
  flex-grow: 1;
  overflow: hidden auto;
  
  @media all and (max-width: $xl - 1px) {
    flex-grow: 0;
  }
}
.projects {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 70vh;

  @media all and (max-width: $xl - 1px) {
    max-height: none;
  }

  &-top {
    padding: 15px 10px 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    @media all and (max-width: $xl - 1px) {
      padding: 24px;
    }

    .user-email {
      font-weight: 400;
      font-size: 11px;
      line-height: 13px;
      color: $color-dark-40;
    }

    .add-project {
      font-size: 20px;
      color: $color-dark-40;
      cursor: pointer;
    }
  }
  &-body {
    padding: 5px;
    
    @media all and (max-width: $xl - 1px) {
      padding: 0;
    }
  }
  &-footer{
    padding: 15px 10px;
    border-top: 1px solid $color-dark-10;
    
    @media all and (max-width: $xl - 1px) {
      padding: 24px;
    }

    .logout{
      font-weight: 400;
      font-size: 12px;
      line-height: 14px;
      color: $color-primary;
      cursor: pointer;
    }
  }
}

.desktop-wrapper-class {
  :deep(.modal) {
    position: fixed;
    top: 60px;
    left: 20px;
    transform: none;
    box-shadow: 0px 0px 20px rgba(34, 34, 34, 0.1);
    max-height: 70vh;
  }
  :deep(.modal-bg) {
    background-color: transparent;
  }
}
:deep(.custom-body-class) {
  padding: 0;
  overflow: hidden;
}
</style>