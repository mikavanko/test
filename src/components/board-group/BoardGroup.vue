<script>
import { reactive, ref, nextTick } from "vue";
import BoardContextMenu from "@/components/VBoardContextMenu.vue";
import contextMenuActions from "./boardGroupMenuActions";
import BoardGroupModal from "./VBoardGroupModal.vue";
import { cloneDeep } from "lodash";
import { Component } from "./actionsFactory.js";
import { isMobile } from "@/assets/js/utils";

import { deskColumnDelete } from "@/api/desk";
import { store } from "../../store";

export default {
  emits: ["update:group-color", "add-task"],
  props: {
    id: {
      type: Number,
      required: true,
    },
    color: {
      type: Object,
      default: () => {},
    },
    colors: {
      type: Array,
      default: () => [],
    },
    name: {
      type: String,
      default: "",
    },
    count: {
      type: Number,
      default: 0,
    },
    handleClass: {
      type: String,
      default: "",
    },
  },
  components: {
    BoardContextMenu,
    BoardGroupModal,
  },
  setup(props, { emit }) {
    const state = reactive({
      isContextMenuVisible: false,
      activeColorActionIdx: -1,
    });

    const contextMenu = ref(cloneDeep(contextMenuActions));

    function changeGroupColor(color) {
      emit("update:group-color", color);
    }

    function findActionIndex(actions, color) {
      return actions.findIndex((el) => el.componentLeft.props.color === color);
    }

    function removeGroup() {
      store.dispatch('documents/deskColumnDelete', props.id)
    }

    return {
      state,
      changeGroupColor,
      removeGroup,
      contextMenu,
      isMobile,
    };
  },
};
</script>

<template>
  <div :class="['board-group']">
    <div
      :class="['board-group__header', $props.handleClass]"
      :style="{
        '--line-color': $props.color.color,
      }"
    >
      <div class="board-group__header-title">
        {{ $props.name }}
      </div>
      <div class="board-group__header-count">
        {{ $props.count }}
      </div>

      <div class="board-group__header-actions">
        <div
          class="board-group__header-action"
          @click="state.isContextMenuVisible = true"
        >
          <svg-icon name="more" />
        </div>
        <div
          class="board-group__header-action"
          @click="$emit('add-task', $event)"
        >
          <svg-icon name="add" />
        </div>
      </div>
    </div>
    <slot />

    <BoardGroupModal
      :title="'Свойства'"
      :translateX="'-50%'"
      :translateY="'20px'"
      v-model="state.isContextMenuVisible"
      :captureClick="!isMobile()"
      :hideOnAction="!isMobile()"
      :color="$props.color"
      :colors="$props.colors"
      @removeGroup="removeGroup"
      @changeGroupColor="changeGroupColor"
    />
  </div>
</template>

<style lang="scss" scoped>
.board-group {
  width: 210px;
  min-width: 210px;
  height: 100%;

  &_ghost {
    opacity: 0;
  }

  &__header {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding-bottom: 5px;
    position: relative;
    margin-bottom: 12px;
    cursor: pointer;

    &::before {
      content: "";
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      width: 100%;
      height: 2px;
      background-color: var(--line-color);
      border-radius: 8px;
    }

    &-actions {
      margin-left: auto;
      display: flex;
      justify-content: flex-start;
      align-items: center;
    }

    &-action {
      display: flex;
      justify-content: center;
      align-items: center;
      color: $color-dark-40;
      font-size: 18px;
      width: 18px;
      height: 18px;
      border-radius: 4px;
      background-color: transparent;
      transition: 0.3s ease;

      &:hover {
        background-color: $color-light-f;
      }
    }
  }
  &__header-title {
    font-weight: 400;
    font-size: 14px;
    line-height: 18px;
    color: $color-dark-70;
    margin-right: 10px;
  }
  &__header-count {
    font-weight: 400;
    font-size: 14px;
    line-height: 18px;
    color: $color-dark-40;
    padding: 0px 5px;
    border: 1px solid $color-dark-10;
    border-radius: 4px;
  }
}
</style>
