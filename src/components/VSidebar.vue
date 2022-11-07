<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useStore } from "vuex";
import { isMobile } from "@/assets/js/utils";
import { debounce } from "lodash";

import Menu from "@/components/VMenu.vue";

const store = useStore();
const isMenuVisible = computed(() => store.getters["menu/isVisible"]);

const isHiddenSidebarShow = ref(false);

const sidebarHiddenTimeout = ref(false);
const sidebarHidden = ref(false);

watch(isMenuVisible, (val) => {
  if (!val) {
    sidebarHidden.value = true
    setTimeout(() => {
      sidebarHiddenTimeout.value = true;
    }, 400);
  } else {
    sidebarHiddenTimeout.value = false;
    sidebarHidden.value = false
  }
});

const toggleMenu = () => {
  store.dispatch("menu/setMenuVisibility", !isMenuVisible.value);
};

const SHOW_SIDEBAR_OFFSET = 50;

onMounted(() => {
  if (!isMobile()) {
    document.addEventListener("mousemove", handleMouseMove);
  }
});

onUnmounted(() => {
  if (!isMobile()) {
    document.removeEventListener("mousemove", debounce(handleMouseMove, 500));
  }
});

function handleMouseMove(e) {
  const flag = e.clientX < SHOW_SIDEBAR_OFFSET
  isHiddenSidebarShow.value = flag;
  store.dispatch("menu/setVisibilityInHiddenMod", flag);
}
</script>

<template>
  <div
    :class="[
      'sidebar',
      {
        open: isMenuVisible,
        ...(!isMobile() && { 'hidden-sidebar': sidebarHiddenTimeout }),
      },
    ]"
  >
    <Menu
      @mousemove.stop
      :hidden-mod="sidebarHiddenTimeout"
      :class="[
        'menu',
        !isMobile() && {
          'hidden-menu': sidebarHidden,
          'hidden-menu-animation': sidebarHiddenTimeout,
          'show-menu-sidebar': sidebarHiddenTimeout && isHiddenSidebarShow,
        },
      ]"
    />
    <div class="sidebar-bg" @click="toggleMenu" />
  </div>
</template>

<style lang="scss" scoped>
.sidebar {
  height: calc(100vh - $bottomNavbarHeight);
  overflow: hidden;
  position: relative;
  z-index: 1;
  background-color: $color-primary-5;
  width: 0;
  min-width: 0;
  transition: width 0.3s ease, min-width 0.3s ease;
  // padding-right: 50px;

  &.open {
    width: 320px;
    min-width: 320px;
    // padding-right: 0;
    z-index: 2;

    @media all and (min-width: $xl) {
      width: 265px;
      min-width: 265px;
    }
  }
  @media all and (min-width: $xl) {
    height: 100vh;
    z-index: 2;
  }

  &.hidden-sidebar {
    overflow: visible;
  }
}
.menu {
  position: relative;
  z-index: 1;

  &.hidden-menu {
    transform: translateX(-100%);
    opacity: 0;
    height: 80vh;
    top: 10vh;
    width: 235px;
    min-width: 235px;
    box-shadow: 0px 0px 20px rgba(34, 34, 34, 0.1);
    border-radius: 0px 5px 5px 0px;
    background-color: $color-light;
    
    &.hidden-menu-animation {
      transition: transform 0.3s ease, opacity 0.3s ease;
    }

    &.show-menu-sidebar{
      transform: translateX(0);
      opacity: 1;
    }
  }
}
.sidebar-bg {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 0;

  @media all and (min-width: $xl) {
    display: none;
  }
}
</style>