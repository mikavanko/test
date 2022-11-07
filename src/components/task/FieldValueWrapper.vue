<script>
import { reactive, computed, nextTick, ref, watch, onUnmounted } from "vue";
import { isMobile } from "@/assets/js/utils";

export default {
  emits: ["update:isActive", "open", "close"],
  components: {},
  props: {
    isActive: {
      type: Boolean,
      default: false,
    },
    clickOutside: {
      type: Boolean,
      default: true,
    },
    value: {
      type: String,
      default: "",
    },
    actions: {
      type: Array,
      default: () => [],
    },
    editMode: {
      type: Boolean,
      default: true,
    },
    closeOnEnter: {
      type: Boolean,
      default: false,
    }
  },
  setup(props, { emit, slots }) {
    const componentRef = ref();
    const focusRef = ref();

    const setFocusRef = (el) => {
      focusRef.value = el;
    };

    const state = reactive({
      isActive: props.isActive,
    });

    watch(
      () => props.isActive,
      (val) => {
        state.isActive = val;
      }
    );

    const isActive = computed({
      get() {
        return props.isActive || state.isActive;
      },
      set(val) {
        state.isActive = val;
        emit("update:isActive", val);
      },
    });

    function hideComponent(e) {
      if (componentRef.value.contains(e.target)) return;

      isActive.value = false;
      emit("close");
      document.removeEventListener("click", hideComponent, true);
    }

    function hideComponentOnEnter (e) {
      if(e.key === 'Enter'){
        isActive.value = false;
        emit("close");
        
        document.removeEventListener("click", hideComponent, true);
        document.removeEventListener("keypress", hideComponentOnEnter);
      }
    }

    async function showComponent(e) {
      if(props.editMode){
        emit("open", e);

        isActive.value = true;
        await nextTick();

        focusRef.value?.$el
          ? focusRef.value?.$el.focus()
          : focusRef.value?.focus();

        if (props.clickOutside) {
          document.addEventListener("click", hideComponent, true);
        }

        if(props.closeOnEnter){
          document.addEventListener("keypress", hideComponentOnEnter);
        }
      }
    }

    onUnmounted(() => {
      document.removeEventListener("click", hideComponent, true);
      document.removeEventListener("keypress", hideComponentOnEnter);
    });

    return {
      isMobile,
      showComponent,
      componentRef,
      setFocusRef,
      focusRef,
      isActive,
    };
  },
};
</script>

<template>
  <div class="field-component-wrapper">
    <div class="field-component-placeholder" @click="showComponent">
      <span class="field-component-placeholder-text" placeholder="Заполнить">
        <template v-if="Array.isArray($props.value)">
          <template v-for="(item, idx) of $props.value" :key="idx">
            <slot name="text" :item="item" />
          </template>
        </template>
        <slot v-else-if="$props.value" name="text" :item="$props.value">
          {{ $props.value }}
        </slot>
      </span>

      <div
        class="field-component-placeholder-actions"
        v-if="$props.value && $props.actions.length"
      >
        <div
          class="field-component-placeholder-action"
          v-for="(item, idx) of $props.actions"
          :key="idx"
          @click.stop="item.on.click"
        >
          <svg-icon :name="item.icon" />
        </div>
      </div>
    </div>
    <div v-if="isActive" class="field-component" ref="componentRef">
      <slot name="component" :set-focus-ref="setFocusRef" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.field {
  &-component {
    outline: none;
    color: $color-dark;
    min-height: 34px;
    font-weight: 400;
    font-size: 14px;
    line-height: 21px;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    width: 100%;
    background-color: $color-light;

    &-wrapper {
      position: relative;
    }

    &-placeholder {
      border-radius: 4px;
      padding: 6px 5px;
      min-height: 34px;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      position: relative;
      cursor: pointer;
      transition: 0.3s ease;

      &-text {
        white-space: pre-wrap;
        word-break: break-word;
        font-weight: 400;
        font-size: 14px;
        line-height: 21px;
        display: flex;
        justify-content: flex-start;
        flex-wrap: wrap;
        gap: 5px;

        &:empty::before {
          content: attr(placeholder);
          color: $color-dark-40;
        }
      }

      $p: &;

      &-actions {
        opacity: 0;
        transition: 0.3s ease;
        margin-left: auto;
        position: absolute;
        top: 8px;
        right: 5px;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 5px;
      }

      &-action {
        font-size: 18px;
        border-radius: 5px;
        background-color: $color-primary-10;
        color: $color-dark-40;
        display: flex;
        transition: 0.3s ease;

        &:hover {
          background-color: $color-dark-10;
        }
      }

      &:hover {
        background-color: $color-primary-10;

        #{$p}-actions {
          opacity: 1;
        }
      }
    }
  }
}
</style>
