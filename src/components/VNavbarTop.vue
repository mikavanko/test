<script>
import { computed, inject } from "vue";
import { useStore } from "vuex";
import { isMobile } from "@/assets/js/utils";
import NavbarTopDocuments from "@/components/VNavbarTopDocuments.vue";
import DoubleArrowRightIcon from "@/assets/icons/svg/double-arrow-right.svg";
import MenuIcon from "@/assets/icons/svg/menu.svg";

export default {
  components: {
    NavbarTopDocuments,
    MenuIcon,
    DoubleArrowRightIcon,
  },
  props: {
    hideOnMenuClose: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const options = inject("options");

    const store = useStore();

    const isMenuVisible = computed(() => store.getters["menu/isVisible"]);
    const isVisibleInHiddenMod = computed(
      () => store.getters["menu/isVisibleInHiddenMod"]
    );

    const toggleMenu = () => {
      store.dispatch("menu/setMenuVisibility", !isMenuVisible.value);
    };

    return {
      toggleMenu,
      isMenuVisible,
      isMobile,
      options,
      isVisibleInHiddenMod,
    };
  },
};
</script>

<template>
  <div
    v-if="options.visible"
    :class="['navbar-top', options.hideOnMenuClose && { hide: isMenuVisible }]"
  >
    <div
      :class="['burger', { 'hover-hidden-menu': isVisibleInHiddenMod }]"
      @click="toggleMenu"
      v-if="isMobile() || !isMenuVisible"
    >
      <MenuIcon class="menu-icon" />
      <DoubleArrowRightIcon class="arrow-icon" />
    </div>
    <NavbarTopDocuments v-if="options.useDocument" />
  </div>
</template>

<style lang="scss" scoped>
// .open-menu {
//   font-size: 18px;
//   color: $color-dark-40;
//   cursor: pointer;
//   padding: 3px;
//   width: 26px;
//   height: 26px;
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   margin-right: 10px;
//   transition: all 0.3s ease;

// }
.navbar-top {
  height: $navbarTopHeightMob;
  min-height: $navbarTopHeightMob;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 0 24px;
  border-bottom: 1px solid $color-dark-10;

  &.hide {
    display: none;
  }
}
.burger {
  cursor: pointer;
  font-size: 24px;
  width: 27px;
  height: 27px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3px;
  line-height: 24px;
  color: $color-dark-40;
  margin-right: 16px;

  &:hover {
    background-color: $color-dark-10;
    border-radius: 4px;
  }

  @media all and (min-width: $xl) {
    font-size: 18px;
    width: 21px;
    height: 21px;
  }

  .arrow-icon{
    opacity: 0;
    visibility: hidden;
    position: absolute;
    transition: all 0.3s ease;
  }

  .menu-icon{
    opacity: 1;
    visibility: visible;
    position: absolute;
    transition: all 0.3s ease;
  }

  &.hover-hidden-menu{
    .arrow-icon{
      opacity: 1;
      visibility: visible;
    }

    .menu-icon{
      opacity: 0;
      visibility: hidden;
    }
  }
}
@media all and (min-width: $xl) {
  .navbar-top {
    border-bottom: none;
    height: $navbarTopHeightDesktop;
    min-height: $navbarTopHeightDesktop;
    padding: 20px;
  }
}
</style>