<script setup>
import { isMobile } from "@/assets/js/utils";
</script>

<template>
  <div class="navbar-bottom" v-if="isMobile()">
    <div class="navbar-bottom-item" v-modal-open="'modal-search-documents'">
      <svg-icon name="search"/>
    </div>
    <div class="navbar-bottom-item">
      <svg-icon name="notification"/>
    </div>
    <div class="navbar-bottom-item" @click="createDoc">
      <svg-icon name="plus-square"/>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.navbar-bottom{
  background-color: $color-light;
  border-top: 1px solid $color-dark-10;
  height: $bottomNavbarHeight;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 888;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  
  &-item{
    padding-top: 6px;
    width: 75px;
    font-size: 24px;
    color: $color-dark-70;
    margin: 0 12px;
    text-align: center;
    height: 100%;
  }
}
</style>