<script>
import { reactive, ref, onMounted, onUnmounted } from "vue";
import { Roles, RoleNames } from "@/enums/Roles";
import { isMobile } from "@/assets/js/utils";
import ChevronRightIcon from "@/assets/icons/svg/chevron-right.svg";
import CloseIcon from "@/assets/icons/svg/close.svg";

export default {
  emits: ["change-role", "remove"],
  props: {
    user: {
      type: Object,
      default: () => {},
    },
  },
  setup(props, { emit }) {
    const state = reactive({
      isModalAccessLevelVisible: false,
      isModalAccessLevelVisibleUser: false,
      role: Roles.USER,
      tempUser: null,
      tempUsers: [],
    });

    const tempUserRef = ref();
    let className = ref("");
    let touchstartX = 0;
    let touchendX = 0;

    onMounted(() => {
      tempUserRef.value.addEventListener("touchstart", handleTouchStart);
      tempUserRef.value.addEventListener("touchend", handleTouchEnd);
    });

    onUnmounted(() => {
      tempUserRef.value?.removeEventListener("touchstart", handleTouchStart);
      tempUserRef.value?.removeEventListener("touchend", handleTouchEnd);
    });

    function handleTouchStart(e) {
      touchstartX = e.changedTouches[0].screenX;
    }

    function handleTouchEnd(e) {
      touchendX = e.changedTouches[0].screenX;
      handleGesture();
    }

    function handleGesture() {
      if (touchendX < touchstartX) {
        // swipe left
        className.value = "swipe-left";
      }
      if (touchendX > touchstartX) {
        // swipe right
        className.value = "";
      }
    }

    return {
      state,
      isMobile,
      Roles,
      RoleNames,
      tempUserRef,
      className,
    };
  },
  components: {
    ChevronRightIcon,
    CloseIcon,
  },
};
</script>

<template>
  <div class="temp-user-wrapper">
    <div :class="['temp-user', className]" ref="tempUserRef">
      <div class="temp-user-left">
        <div class="temp-user-avatar">
          <img
            v-if="user.avatar"
            :src="user.avatar?.originalUrl"
            :alt="user.nickname"
          />
          <span v-else class="temp-user-avatar-l">{{ user.nickname[0] }}</span>
        </div>
        <div class="temp-user-nickname">
          {{ user.nickname }}
        </div>
      </div>
      <div class="temp-user-role" @click.stop.prevent="$emit('change-role', $event, user)">
        {{ RoleNames[user.role] }}
        <ChevronRightIcon class="chevron-right-icon" />
      </div>
      <div class="temp-user-remove" @click="$emit('remove', user)">
        <CloseIcon class="close-icon" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.temp-user-remove {
  font-size: 24px;
  background-color: $color-error;
  color: $color-light;
  width: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  position: absolute;
  right: -40px;
  top: 0;
  bottom: 0;
  cursor: pointer;
}
.temp-user-nickname {
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.temp-user-role {
  font-weight: 400;
  font-size: 12px;
  line-height: 14px;
  color: $color-dark-70;
  display: flex;
  align-items: center;
  cursor: pointer;

  .chevron-right-icon {
    font-size: 12px;
    margin-left: 2px;
  }
}
.temp-user-left {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  min-width: 0;
}
.temp-user-avatar {
  width: 24px;
  min-width: 24px;
  height: 24px;
  border-radius: 100%;
  overflow: hidden;
  margin-right: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: $color-dark-10;
  color: $color-light;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}
.temp-user-wrapper{
  position: relative;
  overflow: hidden;
  background-color: $color-light;
  color: $color-dark-70;
}
.temp-user {
  height: 57px;
  border-bottom: 1px solid $color-dark-10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  transition: transform 0.1s ease;

  &.swipe-left {
    transform: translateX(-40px);
  }
}
.temp-users-title {
  font-weight: 400;
  font-size: 14px;
  line-height: 17px;
  margin-bottom: 8px;
}
</style>