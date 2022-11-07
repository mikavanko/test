<script>
export default {
  props: {
    color: {
      type: String,
      default: "#CDCCD4",
    },
  },
};
</script>
<template>
  <div class="color-square" :style="{ backgroundColor: $props.color }" />
</template>

<style lang="scss">
.color-square {
  width: 18px;
  height: 18px;
  border-radius: 4px;
}
</style>