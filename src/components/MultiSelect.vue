<script>
import { reactive, computed, nextTick, ref, onMounted } from "vue";
import { isMobile } from "@/assets/js/utils";

export default {
  components: {},
  emits: ["update:modelValue", "update:filterInput", "enter-pressed"],
  props: {
    modelValue: {
      type: [],
      default: () => [],
    },
    placeholder: {
      type: String,
      default: "Введите текст",
    },
    title: {
      type: String,
      default: "Выберите",
    },
    items: {
      type: Array,
      default: () => [],
    },
    filterKey: {
      type: String,
      default: "text",
    },
    noDataText: {
      type: String,
      default: "Нет данных",
    },
    showNoData: {
      type: Boolean,
      default: true,
    },
    filterInput: {
      type: String,
      default: "",
    },
    uniqueKey: {
      type: String,
      default: "id",
    },
    multiselect: {
      type: Boolean,
      default: true,
    },
  },
  setup(props, { emit }) {
    const inputRef = ref();

    const value = computed({
      get() {
        return props.modelValue;
      },
      set(val) {
        emit("update:modelValue", val);
      },
    });
    const filterInputComp = computed({
      get() {
        return props.filterInput;
      },
      set(val) {
        emit("update:filterInput", val);
      },
    });

    const items = computed(() => {
      return props.items.map((el, idx) => ({
        ...el,
        // key: idx,
      }));
    });

    const filteredItems = computed(() => {
      const filteredItems = items.value.filter(
        (el) => el[props.filterKey].indexOf(filterInputComp.value) !== -1
      );

      return filteredItems;
    });

    function addItem(item) {
      filterInputComp.value = "";

      if (props.multiselect) {
        if (
          value.value.findIndex(
            (el) => el[props.uniqueKey] === item[[props.uniqueKey]]
          ) !== -1
        )
          return;

        const arr = [...value.value];
        arr.push(item);
        value.value = arr;
      } else {
        value.value = item;
      }
      inputRef.value.focus();
    }

    function removeItem(idx) {
      filterInputComp.value = "";

      if (props.multiselect) {
        const arr = [...value.value];
        arr.splice(idx, 1);
        value.value = arr;
      } else {
        value.value = null;
      }

      inputRef.value.focus();
    }

    let removeFlag = false;
    function removeItemOnInput(input, idx) {
      if (!input.length && removeFlag) {
        removeItem(idx);
      }
      removeFlag = !input.length;
    }

    onMounted(() => {
      inputRef.value.focus();
    });

    return {
      isMobile,
      value,
      filteredItems,
      addItem,
      removeItem,
      removeItemOnInput,
      filterInputComp,
      inputRef,
    };
  },
};
</script>

<template>
  <div class="select">
    <div class="select-top">
      <div class="select-top-list">
        <template v-if="multiselect">
          <div
            class="select-top-list__item"
            v-for="(item, idx) of value"
            :key="idx"
            @click="removeItem(idx)"
          >
            <slot name="selected-item" :item="item"></slot>
          </div>
        </template>
        <template v-else-if="value">
          <div class="select-top-list__item" @click="removeItem(idx)">
            <slot name="selected-item" :item="value"></slot>
          </div>
        </template>
        <div class="select-top-list__item">
          <div class="select-input-wrapper">
            <input
              ref="inputRef"
              class="select-input"
              type="text"
              v-model="filterInputComp"
              :placeholder="placeholder"
              @keyup.delete="
                removeItemOnInput(filterInputComp, value.length - 1)
              "
              @keypress.enter.prevent="$emit('enter-pressed', filterInputComp)"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="select-bottom" data-simplebar>
      <div class="select-bottom-title">{{ $props.title }}</div>
      <div class="select-bottom-list" v-if="filteredItems.length">
        <div
          class="select-bottom-list__item"
          v-for="(item, idx) of filteredItems"
          :key="idx"
          @click="addItem(item)"
        >
          <slot name="item" :item="item"></slot>
        </div>
      </div>
      <div class="no-data" v-else-if="showNoData">
        {{ noDataText }}
      </div>
      <slot name="bottom" :text="filterInputComp"></slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.no-data {
  font-weight: 400;
  font-size: 12px;
  line-height: 20px;
  color: $color-dark-40;
}
.select-input {
  @include clear-input;

  font-weight: 400;
  font-size: 14px;
  line-height: 24px;
  height: 20px;
  color: $color-dark-70;

  &-wrapper {
    min-width: 60px;
  }
}
.select {
  box-shadow: 0px 0px 20px rgba(34, 34, 34, 0.1);
  border-radius: 8px;
  border: 1px solid $color-dark-10;
  overflow: hidden;
  max-height: 30vh;
  display: flex;
  flex-direction: column;

  &-top {
    // min-height: 42px;
    padding: 10px;
    background: $color-light-f;
    border-bottom: 1px solid $color-dark-10;

    &-list {
      display: flex;
      justify-content: flex-start;
      align-content: center;
      flex-wrap: wrap;
      gap: 5px;

      &__item {
        cursor: pointer;

        &:last-child {
          flex: 1;
        }
      }
    }
  }

  &-bottom {
    padding: 5px 10px 10px;
    background: $color-light;
    min-height: 0;

    &-title {
      font-weight: 400;
      font-size: 12px;
      line-height: 20px;
      color: $color-dark-20;
      margin-bottom: 5px;
    }

    &-list {
      display: flex;
      flex-direction: column;
      gap: 4px;

      &__item {
        border-radius: 4px;
        min-height: 24px;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        cursor: pointer;
        padding: 2px 4px;

        &:hover {
          background: $color-light-f;
        }
      }
    }
  }
}
</style>
