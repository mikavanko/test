<script>
import { reactive, getCurrentInstance, computed, ref } from "vue";
import { useStore } from "vuex";
import { useRouter, useRoute } from "vue-router";
import { createDocument, deleteDocument } from "@/api/documents.js";
import DocumentAdapter from "@/adapters/Document.js";
import { useToast } from 'vue-toastification';
import ErrorAdapter from "@/adapters/Error";
import Tree from "@/components/VTree.vue";

import SettingsIcon from "@/assets/icons/svg/setting.svg";
import UsersIcon from "@/assets/icons/svg/users.svg";
import TrashIcon from "@/assets/icons/svg/trash.svg";
import QuestionIcon from "@/assets/icons/svg/question.svg";
import ChevronIcon from "@/assets/icons/svg/chevron.svg";
import SearchIcon from "@/assets/icons/svg/search.svg";
import NotificationIcon from "@/assets/icons/svg/notification.svg";
import UserOutlineIcon from "@/assets/icons/svg/user-outline.svg";
import DoubleArrowLeftIcon from "@/assets/icons/svg/double-arrow-left.svg";
import { isMobile } from "@/assets/js/utils";

import MenuModal from "@/components/VMenuModal.vue";
import ModalDocumentContextMenu from "@/components/VModalDocumentContextMenu.vue";

import { moveDocument } from "@/api/documents.js";

import { Types as DocumentTypes } from "@/enums/Document.ts";
import DeskAdapter from "@/adapters/Desk.js"
import { deskCreate } from "@/api/desk";

import { Types } from "@/enums/Document";

export default {
  components: {
    Tree,
    SettingsIcon,
    UsersIcon,
    TrashIcon,
    QuestionIcon,
    ChevronIcon,
    SearchIcon,
    NotificationIcon,
    UserOutlineIcon,
    DoubleArrowLeftIcon,
    MenuModal,
    ModalDocumentContextMenu,
  },
  props: {
    hiddenMod: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const toast = useToast();
    const store = useStore();
    const route = useRoute();
    const router = useRouter();
    const currentProject = computed(
      () => store.getters["projects/getCurrentProject"]
    );
    const currentDocument = computed(
      () => store.getters["documents/getCurrentDocument"]
    );
    const user = computed(() => store.getters["auth/getUser"]);
    const documents = computed(() => store.getters["documents/getDocuments"]);
    const treeDocuments = computed(() =>
      documents.value.map((el) => {
        return {
          ...el,
          title: el.name,
          selected: parseInt(currentDocument.value?.id) === el.itemId,
        };
      })
    );
    const isMenuVisible = computed(() => store.getters["menu/isVisible"]);

    const instance = getCurrentInstance();
    const bus = instance.appContext.config.globalProperties.$bus;
    const state = reactive({
      activeMenuItem: null,
      menu: [
        {
          name: "block",
          class: "menu-middle",
          isVisible: !isMobile(),
          items: [
            {
              text: "Быстрый поиск",
              icon: "search",
              event: {
                type: "click",
                callback: () => {
                  bus.$emit(`modal-open:modal-search-documents`)
                },
              },
            },
            {
              text: "Уведомления",
              icon: "notification",
              menuModal: {
                isVisible: false,
                props: {
                  height: "350px",
                  width: "500px",
                },
              },
              event: {
                type: "click",
                callback: showModalCallback,
              },
            },
            {
              text: "Настройки",
              icon: "user-outline",
              event: {
                type: "click",
                callback: () => bus.$emit(`modal-open:modal-desktop`),
              },
            },
          ],
        },
        {
          name: "tree",
          class: "menu-tree",
          title: "Общие документы",
          titleButton: {
            icon: "add-square",
            event: {
              type: "click",
              callback: createDoc,
            },
          },
          items: treeDocuments,
        },
        {
          name: "block",
          class: "menu-bottom",
          items: [
            {
              text: "Учётная запись",
              icon: "setting",
              isVisible: isMobile(),
              event: {
                type: "click",
                callback: () => bus.$emit(`modal-open:modal-user-settings`),
              },
            },
            {
              text: "Участники",
              icon: "users",
              isVisible: isMobile(),
              event: {
                type: "click",
                callback: () => bus.$emit(`modal-open:modal-members`),
              },
            },
            {
              text: "Корзина",
              icon: "trash",
              menuModal: {
                isVisible: false,
                props: {
                  height: "350px",
                  width: "414px",
                },
              },
              event: {
                type: "click",
                callback: showModalCallback,
              },
            },
            {
              text: "Помощь",
              icon: "question",
              menuModal: {
                isVisible: false,
                props: {
                  height: "350px",
                  width: "414px",
                },
              },
              event: {
                type: "click",
                callback: showModalCallback,
              },
            },
          ],
        },
      ],
      isProjectModalVisible: false,
      suppressScrollY: false,
      activeDocument: null,
      modalDCMCoords: {
        x: 0,
        y: 0,
      },
    });

    function showModalCallback(item) {
      if (state.activeMenuItem) {
        state.activeMenuItem.active = false;
      }
      item.active = true;
      state.activeMenuItem = item;

      item.menuModal.isVisible = true;
    }

    const menuModalClose = () => {
      if (state.activeMenuItem) {
        state.activeMenuItem.active = false;
      }
      state.activeMenuItem = null;
    };

    const ondragend = (tree, event, node) => {
      const flatTree = tree.getFlatTree();
      store.dispatch("documents/setDocuments", flatTree);

      const nodeIdx = flatTree.findIndex((el) => el.id === node.id);
      console.log('nodeIdx',nodeIdx)
      const targetProjectItemId = nodeIdx === 0 ? null : flatTree[nodeIdx - 1].id;

      moveDocument(node.id, { targetProjectItemId });
    };

    const onNodeClick = (node) => {
      if(node.itemType === Types.document){
        router.push(`/projects/${currentProject.value?.id}/documents/${node.itemId}`);
      }else{
        router.push(`/projects/${currentProject.value?.id}/desks/${node.itemId}`);
      }
    };

    let i = 1;
    function createDoc() {
      const params = {
        name: "Untitled",
      };

      createDocument(currentProject?.value.id, params).then((res) => {
        const doc = DocumentAdapter(res.data.data);
        store.dispatch("documents/pushDocument", doc.projectItem);
      });
    }

    const openContextMenu = (e, item) => {
      state.activeDocument = item;
      state.modalDCMCoords = {
        x: e.clientX,
        y: e.clientY,
      };
      bus.$emit(`modal-open:modal-document-context-menu`);
    };

    const deleteDoc = (item) => {
      store.dispatch("documents/deleteDocument", item.id);
      router.push(`/projects/${currentProject.value.id}`)
    };
    
    const duplicateDoc = async (item) => {
      console.log('duplicateDoc',item)
      if(item.itemType === DocumentTypes.document){

      }else if(item.itemType === DocumentTypes.desk){
        const res = await deskCreate(currentProject.value.id, { name: item.name })

        const desk = DeskAdapter(res.data.data);
        store.dispatch("documents/pushDocument", desk.projectItem);
      }

    };
    const copyLinkDoc = (item) => {
      const link = item?.link?.link;
      navigator.clipboard
        .writeText(link)
        .then(() => {
        })
        .catch((err) => {
          const error = ErrorAdapter(err);

          if (error) {
            toast.error(error.message)
          }
        });
    };

    const showModalChooseProject = () => {
      bus.$emit(`modal-open:modal-choose-project`);
    };

    const hideMenu = () => {
      store.dispatch("menu/setMenuVisibility", false);
    };

    const toggleBlock = (e, block) => {
      block.hidden = !block.hidden;
    }

    return {
      isMobile,
      state,
      ondragend,
      onNodeClick,
      menuModalClose,
      currentProject,
      user,
      createDoc,
      openContextMenu,
      deleteDoc,
      duplicateDoc,
      copyLinkDoc,
      showModalChooseProject,
      isMenuVisible,
      hideMenu,
      toggleBlock,
    };
  },
};
</script>

<template>
  <div class="menu">
    <div :class="['menu-top user']" @click="showModalChooseProject">
      <div class="user-avatar">
        {{ currentProject?.name && currentProject?.name[0] }}
      </div>
      <div class="user-middle">
        <div class="user-title">{{ currentProject?.name }}</div>
        <div class="user-mail">{{ user?.email }}</div>
      </div>
      <div class="user-icon">
        <ChevronIcon />
      </div>
      <div v-if="!hiddenMod" class="hide-menu" @click.stop="hideMenu">
        <DoubleArrowLeftIcon class="double-arrow-left-icon" />
      </div>
    </div>

    <div data-simplebar style="min-height: 0">
      <template v-for="(block, i) of state.menu" :key="i">
        <h2
          class="menu-title"
          v-if="block.title"
          @click="!isMobile() && toggleBlock($event, block)"
        >
          {{ block.title }}
          <div
            class="menu-title-btn"
            v-if="block.titleButton"
            @[block.titleButton.event?.type].stop="
              block.titleButton.event?.callback(item)
            "
          >
            <svg-icon :name="block.titleButton.icon" class="title-icon" />
          </div>
        </h2>
        <div
          :class="['menu-block', block.class ?? '', { hidden: block.hidden }]"
          v-if="!('isVisible' in block) || block.isVisible"
        >
          <template v-if="block.name === 'block'">
            <template v-for="(item, j) of block.items" :key="j">
              <component
                :is="item.tag || 'div'"
                v-bind="item.tagProps"
                :class="['menu-link', { active: item.active }]"
                v-if="!('isVisible' in item) || item.isVisible"
                @[item.event?.type]="item.event?.callback(item)"
                :ref="'menuItem' + i + j"
              >
                <svg-icon :name="item.icon" class="menu-link__icon" />
                {{ item.text }}
              </component>
              <MenuModal
                v-if="item.menuModal"
                v-model:isVisible="item.menuModal.isVisible"
                @modalClose="menuModalClose"
                :bind-to="$refs['menuItem' + i + j]"
                :positions="{ top: true, right: true }"
                v-bind="item.menuModal.props"
              />
            </template>
          </template>
          <template v-else-if="block.name === 'tree'">
            <Tree
              class="tree"
              :tree="block.items"
              @ondragend="ondragend"
              @click="onNodeClick"
              @open-context-menu="openContextMenu"
            />
          </template>
        </div>
      </template>
    </div>

    <div class="menu-footer" v-if="!isMobile()" @click="createDoc">
      <svg-icon name="add-square" class="add-square" />
      Добавить документ
    </div>

    <ModalDocumentContextMenu
      :coords="state.modalDCMCoords"
      :item="state.activeDocument"
      @delete="deleteDoc"
      @duplicate="duplicateDoc"
      @copy-link="copyLinkDoc"
    />
  </div>
</template>

<style lang="scss" scoped>
.menu {
  background-color: $color-primary-5;
  height: 100%;
  width: $menuWidthMob;
  min-width: $menuWidthMob;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &:hover {
    .hide-menu {
      opacity: 1;
      visibility: visible;
      width: 26px;
      margin-left: 15px;
      padding: 3px;
    }
  }

  &-block{
    &.hidden{
      display: none;
    }
  }

  &-footer {
    display: none;
  }

  @media all and (min-width: $xl) {
    width: $menuWidthDesktop;
    min-width: $menuWidthDesktop;

    .menu-title-btn {
      opacity: 0;
    }
    &:hover {
      .menu-title-btn {
        opacity: 1;
      }
    }
    &-footer {
      margin-top: auto;
      padding: 15px 20px;
      border-top: 1px solid $color-dark-10;
      font-weight: 400;
      font-size: 14px;
      line-height: 20px;
      color: $color-dark-70;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      cursor: pointer;
      z-index: 1;

      .add-square {
        color: transparent;
        font-size: 20px;
        margin-right: 10px;
        opacity: 0.6;
      }
      &:hover {
        background-color: $color-dark-10;
      }
    }
  }

  &-title {
    box-shadow: 0px 1px 0px $color-dark-10;
    line-height: 36px;
    font-weight: 400;
    font-size: 14px;
    color: $color-primary;
    padding: 0 16px 0 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;

    &-btn {
      color: transparent;
      font-size: 20px;
      cursor: pointer;
      display: none;

      .title-icon {
        opacity: 0.6;
      }

      &:hover {
        .title-icon {
          opacity: 1;
          color: $color-dark-20;
        }
      }
    }

    @media all and (min-width: $xl) {
      font-weight: 400;
      font-size: 12px;
      line-height: 14px;
      box-shadow: none;
      color: $color-dark-40;
      margin-bottom: 5px;

      .menu-title-btn {
        display: block;
      }
    }
  }

  &-middle {
    padding: 0 0 24px 0;
  }
  &-bottom {
    padding: 24px 0 24px 0;
  }

  &-link {
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    color: $color-dark-70;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    line-height: 36px;
    cursor: pointer;
    padding: 0 16px 0 24px;

    @media all and (min-width: $xl) {
      padding: 0 20px;
    }

    &__icon {
      font-size: 18px;
      color: $color-dark-40;
      margin-right: 4px;
    }

    &:hover {
      background-color: $color-dark-10;
      color: $color-dark;
    }
    &.active,
    &.router-link-exact-active {
      background-color: $color-dark-10;
      font-weight: 600;
      color: $color-dark;
    }
  }

  &-top {
    box-shadow: 0px 1px 0px $color-dark-10;
    padding: 8px 22px 8px 24px;
    margin-bottom: 16px;
    position: relative;

    &.active,
    &:hover {
      background-color: $color-dark-10;
    }

    .hide-menu {
      font-size: 20px;
      color: $color-dark-40;
      opacity: 0;
      visibility: hidden;
      display: flex;
      cursor: pointer;
      width: 0;
      transition: all 0.3s ease;

      &:hover {
        background: $color-dark-20;
        border-radius: 4px;
      }
    }

    @media all and (min-width: $xl) {
      box-shadow: none;
      margin-bottom: 5px;
    }
  }

  &-tree {
    @media all and (min-width: $xl) {
      margin-bottom: 30px;
    }
  }
}

.user {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  cursor: pointer;

  &-middle {
    flex: 1;
    min-width: 0;
    width: 100%;
  }

  &-avatar {
    background: $color-avatar;
    font-weight: 400;
    font-size: 13px;
    line-height: 13px;
    border-radius: 3px;
    margin-right: 11px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: $color-light;
    width: 18px;
    height: 18px;
    text-transform: uppercase;
  }

  &-icon {
    margin-left: auto;
    font-size: 12px;
    color: $color-dark-40;
  }

  &-title {
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    color: $color-dark;
    overflow: hidden;
    white-space: nowrap;
    width: 100%;
    text-overflow: ellipsis;
  }

  &-mail {
    font-weight: 400;
    font-size: 11px;
    line-height: 13px;
    color: $color-dark-40;
    overflow: hidden;
    white-space: nowrap;
    width: 100%;
    text-overflow: ellipsis;
  }
}
</style>