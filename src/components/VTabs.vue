<script setup>
defineProps({
  tabsItems: {
    type: Array,
    reqired: true,
  },
});

const emit = defineEmits(["change"]);

function changeTab(item) {
  emit("change", item);
}
</script>

<template>
  <div class="tabs">
    <div
      v-for="(item, idx) in tabsItems"
      :key="idx"
      :class="['tabs__item', { active: item.isActive }]"
      @click="changeTab(item, $event)"
    >
      {{ item.value }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tabs {
  background-color: $color-light-f;
  padding: 6px 4px;
  border-radius: 8px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media all and (min-width: $xl) {
    padding: 6px 10px;
  }

  &__item {
    width: 50%;
    height: 36px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    color: $color-dark-40;
    border-radius: 8px;
    font-weight: 400;
    font-size: 14px;
    line-height: 24px;

    &.active {
      color: $color-dark;
      background-color: $color-light;
      box-shadow: 0px 3px 8px rgba(34, 34, 34, 0.05);
    }
  }
}
</style>
