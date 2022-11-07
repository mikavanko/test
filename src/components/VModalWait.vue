<script>
import { reactive, computed } from "vue";
import { useStore } from "vuex";
import Modal from "@/components/VModal.vue";

import { isMobile } from "@/assets/js/utils";

export default {
  emits: ["update:isVisible"],
  props: {
    isVisible: {
      type: Boolean,
      default: false,
    },
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

    const modalOpen = () => {
      isModalVisible.value = true;
    };
    const modalClose = () => {
      isModalVisible.value = false;
    };

    return {
      isMobile,
      modalOpen,
      modalClose,
      isModalVisible,
    };
  },
  components: {
    Modal,
  },
};
</script>

<template>
  <Teleport to="body">
    <Modal
      v-model="isModalVisible"
      @modalOpen="modalOpen"
      @modalClose="modalClose"
      :showModalTop="false"
      :width="'330px'"
      :height="'auto'"
      :customBodyClass="'custom-body-class'"
    >
      <div class="loader" />
      <span class="loader-text">Проект создаётся...</span>
    </Modal>
  </Teleport>
</template>

<style lang="scss" scoped>
:deep(.modal){
  border-radius: 8px;
}
:deep(.custom-body-class){
  padding: 40px;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.loader{
  width: 35px;
  height: 35px;
  background: url(@/static/img/loader.png) no-repeat center center;
  background-size: contain;
  animation: rotating 1s linear infinite;
}
@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.loader-text{
  margin-top: 10px;
  font-weight: 400;
  font-size: 18px;
  line-height: 25px;
}
</style>