<script>
import { reactive, computed, onUpdated, ref, watch } from "vue";
import { useStore } from "vuex";
import Modal from "@/components/VModal.vue";
import { Roles, RoleNames, RoleDescriptions } from "@/enums/Roles";

import { isMobile } from "@/assets/js/utils";

import TickIcon from "@/assets/icons/svg/tick.svg";

export default {
  emits: ["update:isVisible", "update:role", "update"],
  props: {
    isVisible: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      default: null,
    },
    useCloseBtn: {
      type: Boolean,
      default: true,
    },
    useNextBtn: {
      type: Boolean,
      default: false,
    },
    desktop: {
      type: Boolean,
      default: false,
    },
    closeByRoleClick: {
      type: Boolean,
      default: false,
    },
    coords: {
      type: Object,
      default: () => null,
    },
    coordsPercentOffset: {
      type: Object,
      default: () => ({
        top: "0%",
        left: "0%",
      })
    }
  },
  setup(props, { emit }) {
    const isModalVisible = computed({
      get() {
        return props.isVisible;
      },
      set(val) {
        emit("update:isVisible", val);
      },
    });

    const modalRef = ref()

    const state = reactive({
      modalWidth: 0,
      modalHeight: 0,
    })

    onUpdated(()=>{
      if(isModalVisible.value){
        const el = modalRef.value.$el.querySelector('.modal')
        state.modalWidth = el.clientWidth
        state.modalHeight = el.clientHeight
      }
    })

    const modalOpen = () => {
      isModalVisible.value = true;
    };
    const modalClose = () => {
      isModalVisible.value = false;
    };
    const chooseRole = (role) => {
      emit("update:role", role);

      if(props.closeByRoleClick){
        modalClose()
      }
    };

    return {
      isMobile,
      modalOpen,
      modalClose,
      isModalVisible,
      Roles,
      RoleNames,
      RoleDescriptions,
      chooseRole,
      modalRef,
      state,
    };
  },
  components: {
    Modal,
    TickIcon,
  },
};
</script>

<template>
  <Modal
    id="modal-access-level"
    ref="modalRef"
    :title="'Уровень доступа'"
    :useCloseBtn="useCloseBtn"
    v-model="isModalVisible"
    @modalOpen="modalOpen"
    @modalClose="modalClose"
    :showModalTop="isMobile()"
    :width="isMobile() ? '100%' : '290px'"
    :height="isMobile() ? '100%' : 'auto'"
    :customBodyClass="desktop ? 'custom-body-class': ''"
    :customWrapperClass="desktop ? 'custom-wrapper-class': ''"
    :style="{
      //'--left': (coords?.x - state.width) + 'px',
      //'--top': (coords?.y - state.height) + 'px',
      '--left': (coords?.x ) + 'px',
      '--top': (coords?.y ) + 'px',
      '--translateX': coordsPercentOffset.left,
      '--translateY': coordsPercentOffset.top,
    }"
  >
    <div
      :class="['role',{desktop}]"
      v-for="(rl, idx) of Roles"
      :key="idx"
      @click="chooseRole(rl)"
    >
      <div class="role-name">
        {{ RoleNames[rl] }}
      </div>
      <div class="role-description">
        {{ RoleDescriptions[rl] }}
      </div>
      <div class="role-icon" v-if="role === rl">
        <TickIcon />
      </div>
    </div>

    <template #top-right-content v-if="useNextBtn">
      <div class="next-btn" @click="$emit('update:isVisible', false)">Далее</div>
    </template>
  </Modal>
</template>

<style lang="scss" scoped>
.custom-wrapper-class{
  :deep(.modal-bg){
    background-color: transparent;
  }
  :deep(.modal){
    top: var(--top);
    left: var(--left);
    transform: translateX(var(--translateX)) translateY(var(--translateY));
  }
}
:deep(.custom-body-class){
  padding: 10px;
}
.next-btn {
  font-weight: 600;
  font-size: 16px;
  line-height: 22px;
  color: $color-primary;
  cursor: pointer;
}
.role {
  margin: 0 -24px;
  padding: 16px 24px;
  box-shadow: 0px 1px 0px $color-dark-10;
  position: relative;
  cursor: pointer;

  $p: &;

  &.desktop{
    margin: 0;
    padding: 10px;
    box-shadow: none;

    &:not(:last-child){
      margin-bottom: 5px;
    }

    &:hover{
      background-color: $color-light-f;
      border-radius: 8px;
    }

    #{$p}-name{
      font-weight: 400;
      font-size: 12px;
      line-height: 14px;
      margin-bottom: 5px;
    }
    #{$p}-description{
      padding-right: 40px;
    }
    #{$p}-icon{
      right: 10px;
    }
  }

  &-name {
    font-weight: 400;
    font-size: 14px;
    line-height: 19px;
    margin-bottom: 8px;
    padding-right: 56px;
  }
  &-description {
    font-weight: 400;
    font-size: 12px;
    line-height: 14px;
    color: $color-dark-40;
    padding-right: 56px;
  }
  &-icon {
    position: absolute;
    top: 50%;
    right: 24px;
    transform: translateY(-50%);
    font-size: 24px;
  }
}
</style>