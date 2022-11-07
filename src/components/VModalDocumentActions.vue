<script>
import { reactive, computed, watch } from "vue";
import { useStore } from "vuex";
import { isMobile } from "@/assets/js/utils";
import Modal from "@/components/VModal.vue";

import TrashIcon from "@/assets/icons/svg/trash.svg";
import LockIcon from "@/assets/icons/svg/lock.svg";

export default {
  emits: ["update:isVisible", "delete", "lock"],
  props: {
    isVisible: {
      type: Boolean,
      default: false,
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

    const store = useStore();

    const currentDocument = computed(
      () => store.getters["documents/getCurrentDocument"]
    );

    const lockText = computed(() =>
      currentDocument.value?.projectItem.isActive
        ? "Заблокировать документ"
        : "Разблокировать документ"
    );

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
      showModal: props.isVisible,
      actions: [
        {
          text: lockText,
          icon: "LockIcon",
          on: {
            click: () => {
              emit("lock");
              isModalVisible.value = false;
            },
          },
        },
        {
          text: "Удалить",
          icon: "TrashIcon",
          on: {
            click: () => {
              emit("delete");
              isModalVisible.value = false;
            },
          },
        },
      ],
    });

    return {
      isMobile,
      isModalVisible,
      state,
    };
  },
  components: {
    Modal,
    TrashIcon,
    LockIcon,
  },
};
</script>

<template>
  <Modal
    id="modal-document-actions"
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
      v-for="(action, idx) of state.actions"
      :key="idx"
      v-on="action.on"
    >
      <component :is="action.icon" class="menu-item__icon" />
      {{ action.text }}
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
    top: 60px;
    left: auto;
    right: 20px;
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