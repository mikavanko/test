<script>
import { reactive, computed, ref, onUpdated, watch } from "vue";
import { isMobile } from "@/assets/js/utils";
import Modal from "@/components/VModal.vue";
import { NUMBER_FORMAT, NUMBER_FORMAT_NAMES } from "../taskProperties";

export default {
  components: {
    Modal,
  },
  emits: ["update:modelValue", "click"],
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    translateX: {
      type: String,
      default: "0%",
    },
    translateY: {
      type: String,
      default: "0%",
    },
    title: {
      type: String,
      default: "",
    },
    coords: {
      type: Object,
      default: () => null,
    },
    captureClick: {
      type: Boolean,
      default: false,
    },
    hideOnAction: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      default: "",
    },
  },
  setup(props, { emit }) {
    const filterInputRef = ref();

    const isModalVisible = computed({
      get() {
        return props.modelValue;
      },
      set(val) {
        emit("update:modelValue", val);
      },
    });

    const actions = ref([
      {
        title: NUMBER_FORMAT_NAMES.NUMBER,
        type: NUMBER_FORMAT.NUMBER,
      },
      {
        title: NUMBER_FORMAT_NAMES.PERCENT,
        type: NUMBER_FORMAT.PERCENT,
      },
      {
        title: NUMBER_FORMAT_NAMES.DOLLAR,
        type: NUMBER_FORMAT.DOLLAR,
      },
      {
        title: NUMBER_FORMAT_NAMES.EURO,
        type: NUMBER_FORMAT.EURO,
      },
      {
        title: NUMBER_FORMAT_NAMES.RUBBLE,
        type: NUMBER_FORMAT.RUBBLE,
      },
    ]);

    const state = reactive({
      isContextMenuVisible: false,
      filterInput: "",
    });

    const filteredActions = computed(() => {
      const filteredActions = actions.value.filter((el) =>
        el.title.toLowerCase().indexOf(state.filterInput.toLowerCase()) !== -1
      );

      return filteredActions;
    });

    onUpdated((val) => {
      if (isModalVisible.value) {
        filterInputRef.value.focus();
      }
    });

    function hideOnClick() {
      props.hideOnAction && (isModalVisible.value = !props.hideOnAction);
    }

    function actionClick(action) {
      emit("click", action);
      hideOnClick();
    }

    return {
      state,
      emit,
      isModalVisible,
      isMobile,
      filteredActions,
      filterInputRef,
      hideOnClick,
      actionClick,
    };
  },
};
</script>

<template>
  <Teleport to="body">
    <Modal
      v-model="isModalVisible"
      :title="$props.title"
      :showModalTop="isMobile()"
      :useCloseBtn="false"
      :width="isMobile() ? '100%' : '227px'"
      :height="isMobile() ? '100%' : 'auto'"
      :bgColor="'transparent'"
      :padding="!isMobile() ? '10px' : '24px 0'"
      :translateX="$props.translateX"
      :translateY="$props.translateY"
      :coords="!isMobile() && $props.coords"
      :captureClick="$props.captureClick"
      autoPositionMode
    >
      <template #top-right-content>
        <span class="modal-save-btn" @click="isModalVisible = false">
          Сохранить
        </span>
      </template>
      <form class="context-menu-form">
        <input
          class="context-menu-input"
          ref="filterInputRef"
          type="text"
          placeholder="Найти нужный формат"
          v-model="state.filterInput"
        />
      </form>
      <div data-simplebar class="context-menu-actions" v-if="filteredActions.length">
        <div
          class="context-menu-action"
          v-for="(action, i) of filteredActions"
          :key="`${i}-${action.type}`"
          @click="actionClick(action)"
        >
          <div class="context-menu-action__title">
            {{ action.title }}
          </div>
          <div class="context-menu-action__active" v-if="type === action.type">
            <svg-icon name="tick" />
          </div>
        </div>
      </div>
    </Modal>
  </Teleport>
</template>

<style lang="scss" scoped>
.modal-save-btn {
  font-weight: 600;
  font-size: 16px;
  line-height: 22px;
  color: $color-primary;
  cursor: pointer;
}
.context-menu-action {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  cursor: pointer;
  gap: 8px;
  padding: 0 24px;
  height: 52px;
  border-bottom: 1px solid $color-dark-10;
  font-weight: 400;
  font-size: 12px;
  line-height: 17px;
  color: $color-dark-70;
  transition: 0.3s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:first-child {
    border-top: 1px solid $color-dark-10;
  }

  &:hover {
    background-color: $color-light-f;
  }

  &__title {
    flex: 1;
  }

  &__active {
    font-size: 17px;
  }
}
.context-menu {
  &-form {
    padding-bottom: 4px;
  }
  &-input {
    @include clear-input;
    padding: 5px 5px 5px 10px;
    font-weight: 400;
    font-size: 12px;
    line-height: 17px;
    border: 1px solid transparent;
    border-radius: 4px;
    transition: 0.3s ease;

    &:focus {
      border: 1px solid $color-primary;
    }

    &::placeholder {
      color: $color-dark-20;
    }
  }
}

@media all and (min-width: $xl) {
  .context-menu-action {
    gap: 10px;
    height: auto;
    border-bottom: none;
    padding: 5px 10px;
    border-radius: 4px;

    &:first-child {
      border-top: none;
    }
  }
}
</style>
