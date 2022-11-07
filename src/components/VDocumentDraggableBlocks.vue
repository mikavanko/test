<script>
import { reactive, computed } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import Contenteditable from "@/components/VContenteditable.vue";
import Draggable from "vuedraggable";
import { isMobile } from "@/assets/js/utils";
import { debounce } from "lodash";

import HandleIcon from "@/assets/icons/svg/handle.svg";

import { useAsyncSetFocus } from "@/assets/js/asyncSetFocus.js";

export default {
  emits: ["update:modelValue", "delete-no-content-pressed"],
  components: {
    Contenteditable,
    Draggable,
    HandleIcon,
  },
  props: {
    modelValue: {
      type: Array,
      default: () => [],
    },
    blockId: {
      type: String,
      required: true,
    },
    block: {
      type: Object,
      required: true,
    },
  },
  setup(props, { emit }) {
    const store = useStore();
    const route = useRoute();

    const curentDocumentReactive = computed(
      () => store.getters["documents/getCurrentDocument"]
    );
    const user = computed(() => store.getters["auth/getUser"]);
    const editModeEnabled = computed(
      () => curentDocumentReactive.value?.projectItem?.editor?.id === user.value?.id
    );

    const state = reactive({
      blockMenuStyle: null,
      isBlockMenuVisible: false,
      activeBlockIdx: null,
    });

    const blocks = computed({
      get() {
        return props.modelValue;
      },
      set(val) {
        emit("update:modelValue", val);
      },
    });

    function upPressed(idx) {
      let nextId = idx - 1;

      if (idx === 0) {
        nextId = "title";
      }

      useAsyncSetFocus(`${props.blockId}-${nextId}`);
    }

    function downPressed(idx) {
      useAsyncSetFocus(`${props.blockId}-${idx + 1}`);
    }

    function enterPressed(idx) {
      blocks.value.splice(idx + 1, 0, { ...props.block });

      downPressed(idx);
    }

    function deleteNoContentPressed(idx, element) {
      blocks.value.splice(idx, 1);

      useAsyncSetFocus(`${props.blockId}-${idx - 1}`);

      emit("delete-no-content-pressed", idx, element);
    }

    const clickOutside = () => {
      state.isBlockMenuVisible = false;
      state.blockMenuStyle = null;
      document.removeEventListener("click", clickOutside);
    };

    const showBlockMenu = (e, isMob, idx) => {
      state.activeBlockIdx = idx;

      document.addEventListener("click", clickOutside);

      const bounds = e.currentTarget.getBoundingClientRect();
      const height = e.currentTarget.clientHeight;
      const menu = document.querySelector(".block-menu");
      const menuHeight = menu.clientHeight;
      const menuWidth = menu.clientWidth;

      state.isBlockMenuVisible = true;

      if (isMob) {
        state.blockMenuStyle = {
          top: bounds.top + height + "px",
          left: bounds.left + "px",
        };
      } else {
        let left = bounds.left - menuWidth - 5;
        if (left < 0) {
          left = bounds.left + 5 + 24;
        }
        state.blockMenuStyle = {
          top: bounds.top - menuHeight / 2 + "px",
          left: left + "px",
        };
      }
    };

    const onInput = debounce(() => {
      updateBlocks();
    }, 500);

    const endDrag = () => {
      updateBlocks();
    };

    function updateBlocks() {
      const text = blocks.value.map((el) => el.text).join("\n<block_enter>");
      store.dispatch("documents/updateDocumentBlocks", {
        documentId: route.params.documentId,
        text,
      });
    }

    function addBlock() {
      blocks.value.splice(state.activeBlockIdx + 1, 0, { ...props.block });

      useAsyncSetFocus(`${props.blockId}-${state.activeBlockIdx + 1}`);
    }
    function removeBlock() {
      blocks.value.splice(state.activeBlockIdx, 1);
      useAsyncSetFocus(`${props.blockId}-${state.activeBlockIdx - 1}`);

      updateBlocks();
    }
    function duplicateBlock() {
      const curBlock = blocks.value[state.activeBlockIdx];
      blocks.value.splice(state.activeBlockIdx + 1, 0, { ...curBlock });

      useAsyncSetFocus(`${props.blockId}-${state.activeBlockIdx + 1}`);

      updateBlocks();
    }
    function copyLinkBlock() {}
    function moveUpBlock() {
      const nextExist = state.activeBlockIdx > 0;
      if (nextExist) {
        const curBlock = blocks.value[state.activeBlockIdx];
        blocks.value.splice(state.activeBlockIdx, 1);
        blocks.value.splice(state.activeBlockIdx - 1, 0, { ...curBlock });

        useAsyncSetFocus(`${props.blockId}-${state.activeBlockIdx - 1}`);
      }

      updateBlocks();
    }
    function moveDownBlock() {
      const nextExist = state.activeBlockIdx < blocks.value.length - 1;
      if (nextExist) {
        const curBlock = blocks.value[state.activeBlockIdx];
        blocks.value.splice(state.activeBlockIdx, 1);
        blocks.value.splice(state.activeBlockIdx + 1, 0, { ...curBlock });

        useAsyncSetFocus(`${props.blockId}-${state.activeBlockIdx + 1}`);
      }
      updateBlocks();
    }

    return {
      state,
      enterPressed,
      deleteNoContentPressed,
      upPressed,
      downPressed,
      onInput,
      blocks,
      isMobile,
      showBlockMenu,
      editModeEnabled,
      endDrag,
      addBlock,
      removeBlock,
      duplicateBlock,
      copyLinkBlock,
      moveUpBlock,
      moveDownBlock,
    };
  },
};
</script>

<template>
  <Draggable
    class="blocks"
    v-model="blocks"
    group="blocks"
    item-key="id"
    handle=".block-handle"
    @end="endDrag"
    :disabled="isMobile()"
  >
    <!-- @start="startDrag" -->
    <template #item="{ element, index }">
      <div class="block-wrapper">
        <div
          v-if="editModeEnabled"
          class="block-handle"
          @[!isMobile()&&`click`].stop="showBlockMenu($event, false, index)"
        >
          <HandleIcon class="handle-icon" />
        </div>
        <contenteditable
          class="block"
          tag="div"
          placeholder="Начните писать текст"
          :id="`${blockId}-${index}`"
          :contenteditable="editModeEnabled"
          :noNL="false"
          :noHTML="true"
          :spellcheck="true"
          v-model="element.text"
          @enter-pressed="enterPressed(index, element)"
          @upPressed="upPressed(index)"
          @downPressed="downPressed(index)"
          @delete-no-content-pressed="deleteNoContentPressed(index, element)"
          @[isMobile()&&editModeEnabled&&`click`].stop="
            showBlockMenu($event, true, index)
          "
          @update:modelValue="onInput"
        />
      </div>
    </template>
  </Draggable>

  <Teleport to="body">
    <div
      :class="['block-menu', { show: state.isBlockMenuVisible }]"
      :style="state.blockMenuStyle"
      @click.stop
    >
      <div class="block-menu__item" text="Добавить блок" @click="addBlock">
        <svg-icon name="plus" class="block-menu__icon plus-icon" />
      </div>
      <div class="block-menu__item" text="Удалить" @click="removeBlock">
        <svg-icon name="trash" class="block-menu__icon trash-icon" />
      </div>
      <div class="block-menu__item" text="Дублировать" @click="duplicateBlock">
        <svg-icon name="duplicate" class="block-menu__icon duplicate-icon" />
      </div>
      <div
        class="block-menu__item"
        text="Ссылка на блок"
        @click="copyLinkBlock"
      >
        <svg-icon name="link" class="block-menu__icon link-icon" />
      </div>
      <div class="block-menu__item" text="Сместить вверх" @click="moveUpBlock">
        <svg-icon name="move-up" class="block-menu__icon move-up-icon" />
      </div>
      <div class="block-menu__item" text="Сместить вниз" @click="moveDownBlock">
        <svg-icon name="move-up" class="block-menu__icon move-down-icon" />
      </div>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
.block {
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
  margin-bottom: 16px;

  &-wrapper {
    position: relative;

    &:focus {
      z-index: 7;
    }
  }

  &-menu {
    position: fixed;
    top: 0;
    left: 0;
    max-width: 100%;
    height: 42px;
    box-shadow: 0px 0px 20px rgba(34, 34, 34, 0.1);
    background-color: $color-light;
    border-radius: 8px;
    white-space: nowrap;
    justify-content: flex-start;
    align-items: center;
    display: flex;
    visibility: hidden;
    opacity: 0;
    z-index: 9999;

    &.show {
      visibility: visible;
      opacity: 1;
    }

    &__item {
      font-size: 24px;
      font-weight: 400;
      line-height: 17px;
      color: $color-dark-70;
      width: 42px;
      justify-content: center;
      display: flex;
      cursor: pointer;

      &:not(:last-child) {
        border-right: 1px solid $color-dark-10;
      }

      .move-down-icon {
        transform: rotate(180deg);
      }
    }
  }

  &-handle {
    display: none;
  }
}

@media all and (min-width: $xl) {
  .document {
    padding: 36px 24px;
  }

  .block {
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;

    &-wrapper {
      margin-left: -120px;
      padding-left: 120px;

      &:hover {
        .block-handle {
          display: flex;
        }
      }
    }

    &-menu {
      width: 227px;
      padding: 8px 10px;
      display: block;
      height: auto;

      &__item {
        padding: 5px 10px;
        width: 100%;
        display: flex;
        justify-content: flex-start;

        &::after {
          content: attr(text);
          font-weight: 400;
          font-size: 12px;
          line-height: 17px;
        }

        &:not(:last-child) {
          margin-bottom: 4px;
          border: none;
        }
      }

      &__icon {
        font-size: 17px;
        margin-right: 10px;
      }
    }
  }

  .block-handle {
    position: absolute;
    top: 0;
    left: 96px;
    cursor: grab;
    font-size: 24px;
    color: $color-dark-20;
    width: 24px;
    height: 24px;
    font-size: 24px;
    display: none;

    &::before {
      content: "";
      display: block;
      position: absolute;
      z-index: -1;
      top: 0;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      background-color: $color-light-f;
      border-radius: 4px;
      width: 18px;
    }

    &:active {
      &::before {
        background-color: $color-dark-10;
      }
    }
  }
}
</style>