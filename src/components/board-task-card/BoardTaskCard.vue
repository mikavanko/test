<script>
import { reactive, computed, onMounted, ref, onUnmounted, nextTick, watch } from "vue";
import Contenteditable from "@/components/VContenteditable.vue";
import { useAsyncSetFocus } from "@/assets/js/asyncSetFocus.js";
import { isMobile } from "@/assets/js/utils";
import BoardContextMenu from "@/components/VBoardContextMenu.vue";

import boardTaskMenu from "./boardTaskMenuActions";

export default {
  components: {
    Contenteditable,
    BoardContextMenu,
  },
  emits: ["title-blur", "update:modelValue", "update:edit", "remove-task", "duplicate-task", "copy-task-link", "open-task-in-new-tab", "rename-task"],
  props: {
    tag: {
      type: String,
      default: "li",
    },
    modelValue: {
      type: String,
      default: "",
    },
    edit: {
      type: Boolean,
      default: false,
    },
    setTitleFocus: {
      type: Boolean,
      default: true,
    },
    executors: {
      type: Array,
      default: ()=>[],
    },
    id: {
      type: Number,
      default: null,
    },
    name: {
      type: String,
      default: "",
    },
    order: {
      type: Number,
      default: null,
    },
  },
  setup(props, { emit }) {
    const titleRef = ref();
    const contextMenuRef = ref();
    const boardTaskRef = ref();

    const state = reactive({
      isContextMenuVisible: false,
      contextMenuInput: "",
      contextMenuCoords: null,
      menuActions: boardTaskMenu,
    });

    const title = computed({
      get() {
        return props.modelValue;
      },
      set(val) {
        emit("update:modelValue", val);
      },
    });

    onMounted(() => {
    });

    watch(()=>props.edit, (val)=>{
      if(val && props.setTitleFocus){
        useAsyncSetFocus(titleRef.value.$el);
      }
    })

    async function showContextMenuModal(e) {
      state.contextMenuCoords = {
        x: e.clientX,
        y: e.clientY,
      };
      state.isContextMenuVisible = true;
    }

    function onTitleClick(e) {
      if(props.edit){
        e.stopPropagation();
      }
    }

    async function onTitleBlur(){
      emit("update:edit", false);
      await nextTick();
      emit("title-blur");
    }

    return {
      state,
      title,
      titleRef,
      isMobile,
      showContextMenuModal,
      contextMenuRef,
      boardTaskRef,
      onTitleClick,
      onTitleBlur,
    };
  },
};
</script>

<template>
  <component :is="$props.tag" class="board-task" ref="boardTaskRef">
    <contenteditable
      ref="titleRef"
      class="board-task-title"
      tag="div"
      placeholder="Untitled"
      :contenteditable="$props.edit"
      :noNL="false"
      :noHTML="true"
      :spellcheck="true"
      v-model="title"
      @click="onTitleClick"
      @blur="onTitleBlur"
    />
    <div class="board-task-user" v-if="$props.user">
      <div class="board-task-user-avatar"></div>
      <div class="board-task-user-name">
        {{ $props.user.name }}
      </div>
    </div>
    <div
      v-if="!isMobile()"
      class="board-task-more"
      @click.stop="showContextMenuModal"
    >
      <svg-icon name="more" />
    </div>

    <BoardContextMenu
      v-model="state.isContextMenuVisible"
      :menuItems="state.menuActions"
      :coords="state.contextMenuCoords"
      useFilter
      @action:remove-task="$emit('remove-task')"
      @action:duplicate-task="$emit('duplicate-task')"
      @action:copy-task-link="$emit('copy-task-link')"
      @action:open-task-in-new-tab="$emit('open-task-in-new-tab')"
      @action:rename-task="$emit('rename-task', $event)"
      @action:edit-properies="$emit('edit-properies', $event)"
      :hideOnAction="!isMobile()"
    />
  </component>
</template>

<style lang="scss" scoped>
.context-menu-action-group {
  gap: 4px;
  display: flex;
  flex-direction: column;
  border-top: 1px solid $color-dark-10;
  padding: 5px 0;
}
.context-menu-action {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  cursor: pointer;
  gap: 10px;
  padding: 5px 10px;
  border-radius: 4px;
  transition: 0.3s ease;

  &:hover {
    background-color: $color-light-f;
  }
}
.context-menu-action-name {
  font-weight: 400;
  font-size: 12px;
  line-height: 17px;
  color: $color-dark-70;
}
.context-menu-action-left-icon {
  font-size: 17px;
  color: $color-dark-70;
}
.context-menu-action-right-icon {
  font-size: 17px;
  color: $color-dark-70;
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

.board-task-more {
  opacity: 0;
  background: $color-light;
  border: 1px solid $color-dark-10;
  color: $color-dark-40;
  border-radius: 6px;
  font-size: 18px;
  height: 18px;
  width: 18px;
  display: flex;
  transition: 0.3s ease;
  position: absolute;
  top: 10px;
  right: 12px;
  justify-content: center;
  align-items: center;

  &:hover {
    background: $color-light-f;
  }
}

.board-task {
  padding: 12px 10px;
  border: 1px solid $color-dark-10;
  border-radius: 4px;
  margin-bottom: 5px;
  cursor: pointer;
  position: relative;

  &:hover {
    background-color: $color-primary-10;
  }

  &:hover &-more {
    opacity: 1;
  }

  &_ghost {
    // opacity: 0;
    // position: absolute;
    position: relative;
    border: none;
    padding: 0;
    height: 0;
    width: 100%;
    margin: 0;
    border-radius: 4px;
    background-color: $color-primary-30;

    *{
      display: none;
    }

    &::before{
      content: '';
      position: absolute;
      top: -4px;
      height: 3px;
      width: 100%;
      border-radius: 4px;
      background-color: $color-primary-30;
    }
  }
}

.board-task-title {
  font-weight: 400;
  font-size: 14px;
  line-height: 18px;
  color: $color-dark-70;

  &[contenteditable="false"] {
    cursor: pointer;
  }
}

.board-task-user {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-top: 10px;
}

.board-task-user-name {
  color: $color-dark-70;
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
}

.board-task-user-avatar {
  width: 22px;
  height: 22px;
  border-radius: 100%;
  background-color: $color-dark-40;
  margin-right: 5px;
}
</style>
