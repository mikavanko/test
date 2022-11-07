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
    width: 280px;
    height: 246px;
    background: url("@/static/img/auth-bg.svg") no-repeat center center;
    position: absolute;
    bottom: 50px;
    left: 50px;
  }
}
</style>
