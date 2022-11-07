<script setup>
import { reactive, computed } from "vue";
import { debounce } from "lodash";

import Input from "@/components/VInput.vue";

const emit = defineEmits(["update:value", "select", "click-outside", "focus"]);

const props = defineProps({
  required: {
    type: Boolean,
    default: true,
  },
  value: {
    type: String,
    default: null,
  },
  name: {
    type: String,
  },
  type: {
    type: String,
    default: "text",
  },
  placeholder: {
    type: String,
    default: "",
  },
  label: {
    type: String,
  },
  info: {
    type: String,
  },
  errorText: {
    type: String,
  },
  rules: {
    type: Array,
    default: null,
  },
  hasError: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  width: {
    type: String,
    default: "100%",
  },
  dropdownData: {
    type: Array,
    default: () => [],
  },
  callback: {
    type: Function,
    default: null,
  },
  customInputWrapperClass: {
    type: String,
    default: "",
  },
  customDropdownClass: {
    type: String,
    default: "",
  },
  item: {
    type: Object,
    default: () => {},
  },
});

const state = reactive({
  value: "",
  showDropdown: false,
  currentItem: null,
});

const clear = () => {
  state.value = "";
  emit("update:value", "");
}

const clickOutside = () => {
  state.showDropdown = false;
  clear()
  emit("click-outside")

  document.removeEventListener("click", clickOutside);
};

const onInput = debounce((val) => {
  emit("update:value", val);
  state.showDropdown = !!val;

  document.addEventListener("click", clickOutside);

  if (val) {
    props.callback && props.callback(val, props.item);
  }
}, 500);

const select = (item) => {
  state.currentItem = item;
  state.value = state.currentItem.value;
  state.showDropdown = false;

  emit("update:value", state.value);
  emit("select", item);

  document.removeEventListener("click", clickOutside);
};

defineExpose({
  clear,
  clickOutside,
  state,
})
</script>

<template>
  <div class="search-input">
    <Input
      :required="required"
      :name="name"
      :type="type"
      :placeholder="placeholder"
      :label="label"
      :info="info"
      :errorText="errorText"
      :rules="rules"
      :hasError="hasError"
      :disabled="disabled"
      :readonly="readonly"
      :width="width"
      :customInputWrapperClass="customInputWrapperClass"
      v-model:value="state.value"
      @update:value="onInput"
      @focus="$emit('focus', $event)"
      @blur="$emit('blur', $event)"
    >
      <template #prefixIcon v-if="$slots.prefixIcon">
        <slot name="prefixIcon" />
      </template>
      <template #suffixIcon v-if="$slots.suffixIcon">
        <slot name="suffixIcon" />
      </template>
    </Input>
    <div
      :class="['dropdown', customDropdownClass]"
      v-if="state.showDropdown && dropdownData && dropdownData.length"
      @click.stop
    >
      <PerfectScrollbar :options="{ maxScrollbarLength: 100 }">
        <template v-for="(item, idx) of dropdownData" :key="idx">
          <div class="dropdown-item-wrapper" @click="select(item)">
            <slot name="dropdown-item" v-bind="item">
              <div class="dropdown-item">
                <div class="dropdown-item__img">
                  <img
                    v-if="img"
                    :src="item.img"
                    :alt="`dropdown-img-${idx}`"
                  />
                </div>
                <div class="dropdown-item__text">
                  {{ item.value }}
                </div>
              </div>
            </slot>
          </div>
        </template>
      </PerfectScrollbar>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.search-input {
  position: relative;
}
.dropdown {
  position: absolute;
  top: calc(100% + 16px);
  width: 100%;
  left: 0;
  right: 0;
  z-index: 7;
  background-color: $color-light;
  max-height: 200px;
  display: flex;
  flex-direction: column;

  &-item {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: 10px 2px;
    border-bottom: 1px solid $color-dark-10;
    cursor: pointer;

    &__img {
      width: 22px;
      height: 22px;
      border-radius: 100%;
      overflow: hidden;
      background-color: $color-dark-10;
      margin-right: 7px;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    &__text {
      color: $color-dark-70;
      font-weight: 400;
      font-size: 14px;
      line-height: 20px;
    }
  }
}
</style>