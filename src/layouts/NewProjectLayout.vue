<script setup>
import { RouterView } from "vue-router";
</script>

<template>
  <div class="bg" />
  <div class="v-wrapper">
    <RouterView />
  </div>
</template>

<style lang="scss" scoped>
@media all and (min-width: $xl) {
  .bg {
    z-index: -1;
    width: 250px;
    height: 186px;
    background: url("@/static/img/new-project-bg.svg") no-repeat center center;
    position: absolute;
    bottom: 30px;
    left: 30px;
  }
}
</style>
