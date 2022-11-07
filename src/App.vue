<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const defaultLayout = "empty-bg-layout";

const layout = computed(() => route?.meta.layout || defaultLayout);
</script>

<template>
  <component :is="layout" />
</template>

<style lang="scss">
#app {
  min-height: 100vh;
}
</style>
