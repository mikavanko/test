<script>
export default {
  components: {},
  emits: [],
  props: {
    icon: {
      type: String,
      default: "",
    },
    iconOpacity: {
      type: String,
      default: "1",
    },
    name: {
      type: String,
      default: "",
    },
  },
  setup(props, { emit }) {
    return {};
  },
};
</script>

<template>
  <div
    class="field-type"
    :style="{
      '--iconOpacity': $props.iconOpacity,
    }"
  >
    <svg-icon class="field-type-icon" :name="$props.icon" />
    <div class="field-type-name">{{ $props.name }}</div>
  </div>
</template>

<style lang="scss" scoped>
.field {
  &-type {
    width: 160px;
    min-width: 160px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 5px;
    border-radius: 4px;
    padding: 5px;
    height: 34px;
    cursor: pointer;
    transition: 0.3s ease;

    &:hover {
      background-color: $color-primary-10;
    }

    &-name {
      font-weight: 400;
      font-size: 14px;
      line-height: 24px;
      color: $color-dark-40;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    &-icon {
      color: $color-dark-40;
      font-size: 18px;
      flex-shrink: 0;
      opacity: var(--iconOpacity);
    }
  }
}
</style>
