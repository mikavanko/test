<script>
import { reactive, computed, ref, onUpdated, watch } from "vue";
import { useStore } from "vuex";
import { isMobile } from "@/assets/js/utils";
import Modal from "@/components/VModal.vue";
import ColorSquare from "@/components/ColorSquare.vue";
import { cloneDeep } from "lodash";

export default {
  components: {
    Modal,
    ColorSquare,
  },
  emits: ["update:modelValue",  "change-color", "remove", "name-changed"],
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
    optionName: {
      type: String,
      default: '',
    },
    color: {
      type: Object,
      default: () => {},
    },
    colors: {
      type: Array,
      default: () => [],
    },
    zIndex: {
      type: String,
      default: "",
    },
  },
  setup(props, { emit }) {
    const store = useStore();
    const nameInputRef = ref()

    onUpdated((val) => {
      if (isModalVisible.value) {
        state.nameInput = props.optionName;
        nameInputRef.value.focus();
      }
    });

    const isModalVisible = computed({
      get() {
        return props.modelValue;
      },
      set(val) {
        emit("update:modelValue", val);
      },
    });

    watch(isModalVisible, (val) => {
      if(!val){
        formSubmitHandler()
      }
    })

    const currentDocument = computed(() => store.getters["documents/getCurrentDocument"]);
    const user = computed(() => store.getters["auth/getUser"]);
    const editModeEnabled = computed(
      () => currentDocument.value?.projectItem?.editor?.id === user.value?.id
    );

    const state = reactive({
      isContextMenuVisible: false,
      nameInput: props.optionName,
    });

    function hideOnClick() {
      props.hideOnAction && (isModalVisible.value = !props.hideOnAction)
    }

    function remove() {
      if(editModeEnabled.value){
        hideOnClick();
        emit("remove");
      }
    }

    function changeColor(e, color) {
      if(editModeEnabled.value){
        hideOnClick();
        emit("change-color", color);
      }
    }

    function formSubmitHandler() {
      if(props.optionName !== state.nameInput && state.nameInput !== ''){
        emit('name-changed', state.nameInput)
      }
    }
    

    return {
      state,
      emit,
      isModalVisible,
      isMobile,
      remove,
      changeColor,
      nameInputRef,
      formSubmitHandler,
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
      :padding="!isMobile() ? '8px 10px 10px 10px' : '24px 0'"
      :translateX="$props.translateX"
      :translateY="$props.translateY"
      :coords="!isMobile() && $props.coords"
      :captureClick="$props.captureClick"
      :zIndexModalWrapper="zIndex"
    >
      <template #top-right-content>
        <span class="modal-save-btn" @click="isModalVisible = false">
          Сохранить
        </span>
      </template>
      <form class="context-menu-form" @submit.prevent="formSubmitHandler">
        <input
          class="context-menu-input"
          ref="nameInputRef"
          type="text"
          placeholder="Название"
          v-model="state.nameInput"
        />
      </form>
      <div data-simplebar class="context-menu-actions">
        <div
          class="context-menu-action-group"
        >
          <div
            class="context-menu-action"
            @click="remove"
          >
            <svg-icon
              name="trash"
              class="context-menu-action-left"
            />
            <div class="context-menu-action-name">
              Удалить
            </div>
          </div>
        </div>
        <div
          class="context-menu-action-group"
        >
          <div
            class="context-menu-action"
            v-for="(color, i) of $props.colors"
            :key="i"
            @click="changeColor($event, color)"
          >
            <ColorSquare
              :color="color.color"
              class="context-menu-action-left"
            />
            <div class="context-menu-action-name">
              {{ color.name }}
            </div>
            <svg-icon
              name="tick"
              v-if="$props.color?.id === color?.id"
              class="context-menu-action-right"
            />
          </div>
        </div>
      </div>
    </Modal>
  </Teleport>
</template>

<style lang="scss" scoped>
.modal-save-btn{
  font-weight: 600;
  font-size: 16px;
  line-height: 22px;
  color: $color-primary;
  cursor: pointer;
}
// .context-menu-actions{
//   padding: 24px 0;
// }
.context-menu-action-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 32px;
}
.context-menu-action-group-title {
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  color: $color-dark-70;
  padding: 0 24px;
  margin-bottom: 4px;
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
  transition: 0.3s ease;

  &:first-child {
    border-top: 1px solid $color-dark-10;
  }

  &:hover {
    background-color: $color-light-f;
  }
}
.context-menu-action-name {
  font-weight: 400;
  font-size: 12px;
  line-height: 17px;
  color: $color-dark-70;
  flex: 1;
  min-width: 0;
}
.context-menu-action-left {
  font-size: 20px;
  color: $color-dark-40;
}
.context-menu-action-right {
  font-size: 20px;
  color: $color-dark-40;
}
.context-menu {
  &-form {
    padding-bottom: 10px;
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
  // .context-menu-actions{
  //   padding: 8px 10px 10px 10px;
  // }
  .context-menu-action-group-title {
    font-weight: 400;
    font-size: 12px;
    line-height: 15px;
    color: $color-dark-40;
    padding: 5px 10px;
    margin-bottom: 0;
  }
  .context-menu-action-group {
    padding: 5px 0;
    gap: 4px;
    margin-bottom: 0;

    &:not(:last-child) {
      border-bottom: 1px solid $color-dark-10;
    }
  }
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
  .context-menu-action-name {
    
  }
  .context-menu-action-left {
    font-size: 17px;
    color: $color-dark-70;
  }
  .context-menu-action-right {
    font-size: 17px;
    color: $color-dark-70;
  }
}
</style>
