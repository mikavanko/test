<script>
import { reactive, computed, watch, ref } from "vue";
import { useStore } from "vuex";
import { isMobile } from "@/assets/js/utils";
import Modal from "@/components/VModal.vue";

import TrashIcon from "@/assets/icons/svg/trash.svg";
import DuplicateIcon from "@/assets/icons/svg/duplicate.svg";
import LinkIcon from "@/assets/icons/svg/link.svg";

export default {
  emits: ["update:isVisible", "delete", "duplicate", "copy-link"],
  props: {
    isVisible: {
      type: Boolean,
      default: false,
    },
    item: {
      type: Object,
      default: () => null,
    },
    coords: {
      type: Object,
      default: () => null,
    },
  },
  setup(props, { emit }) {
    watch(
      () => props.isVisible,
      (val) => {
        state.showModal = val;
      }
    );
    let isLinkAvailable = computed(() => props.item?.link?.isAvailable);

    let isModalVisible = computed({
      get() {
        return props.isVisible || state.showModal;
      },
      set(val) {
        state.showModal = val;
        emit("update:isVisible", val);
      },
    });

    const state = reactive({
      isLinkAvailable: isLinkAvailable,
      showModal: props.isVisible,
    });

    const menu = computed(() => [
      {
        text: "Удалить",
        icon: "TrashIcon",
        on: {
          click: () => {
            emit("delete", props.item);
            isModalVisible.value = false;
          },
        },
      },
      {
        text: "Дублировать",
        icon: "DuplicateIcon",
        on: {
          click: () => {
            emit("duplicate", props.item);
            isModalVisible.value = false;
          },
        },
      },
      ...(isLinkAvailable.value
        ? [
            {
              text: "Скопировать ссылку",
              icon: "LinkIcon",
              on: {
                click: () => {
                  emit("copy-link", props.item);
                  isModalVisible.value = false;
                },
              },
            },
          ]
        : []),
    ]);

    return {
      isMobile,
      isModalVisible,
      state,
      menu,
    };
  },
  components: {
    Modal,
    TrashIcon,
    DuplicateIcon,
    LinkIcon,
  },
};
</script>

<template>
  <Modal
    id="modal-document-context-menu"
    :title="'Действие'"
    v-model="isModalVisible"
    :showModalTop="isMobile()"
    :width="isMobile() ? '100%' : '217px'"
    :height="isMobile() ? '100%' : 'auto'"
    :customBodyClass="isMobile() ? 'mob-body-class' : 'desktop-body-class'"
    :customWrapperClass="isMobile() ? '' : 'desktop-wrapper-class'"
    :style="{
      '--top': coords?.y + 'px',
      '--left': coords?.x + 'px',
    }"
  >
    <div
      class="menu-item"
      v-for="(item, idx) of menu"
      :key="idx"
      v-on="item.on"
    >
      <component :is="item.icon" class="menu-item__icon" />
      {{ item.text }}
    </div>
  </Modal>
</template>

<style lang="scss" scoped>
.desktop-wrapper-class {
  :deep(.modal-bg) {
    background-color: transparent;
  }
  :deep(.modal) {
    transform: none;
    top: var(--top);
    left: var(--left);
  }
}
:deep(.desktop-body-class) {
  padding: 8px 10px;

  .menu-item {
    height: 27px;
    font-size: 12px;
    line-height: 17px;
    padding: 5px 10px;
    border-bottom: none;
    border-radius: 8px;

    &:not(:last-child) {
      margin-bottom: 4px;
    }

    &__icon {
      color: $color-dark-70;
      font-size: 17px;
      margin-right: 10px;
    }
  }
}
:deep(.mob-body-class) {
  padding: 24px 0;
}
.menu-item {
  cursor: pointer;
  padding: 16px 24px;
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  color: $color-dark-70;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  height: 52px;
  border-bottom: 1px solid $color-dark-10;

  &:hover {
    background-color: $color-light-f;
  }

  &__icon {
    margin-right: 8px;
    font-size: 20px;
    color: $color-dark-40;
  }
}
</style>