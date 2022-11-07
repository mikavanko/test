<script>
import { reactive, computed } from "vue";
import { useStore } from "vuex";
import Modal from "@/components/VModal.vue";

import { isMobile } from "@/assets/js/utils";

export default {
  emits: ["update:isVisible", "continue", "cancel"],
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
      :width="isMobile() ? '100%' : '330px'"
      :height="isMobile() ? '100%' : 'auto'"
      :customBodyClass="'custom-body-class'"
    >
      <h2 class="cancel-h2">
        Отменить создание проекта? 
      </h2>
      <p class="cancel-text">Вы вернетесь к своему предыдущему проекту.</p>
      <div class="btn-cancel" @click="$emit('cancel')">К предыдущему проекту</div>
      <div class="btn-continue" @click="$emit('continue')">Продолжить создание </div>
    </Modal>
  </Teleport>
</template>

<style lang="scss" scoped>
:deep(.custom-body-class){
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.cancel-h2{
  font-size: 16px;
  line-height: 22px;
  font-weight: 600;
  text-align: center;
}
.cancel-text{
  font-size: 16px;
  line-height: 22px;
  color: $color-dark-70;
  text-align: center;
  margin-bottom: 16px;
}
.btn-continue,
.btn-cancel{
  width: 100%;
  padding: 5px;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  border: 1px solid;
  border-radius: 4px;
  text-align: center;
  cursor: pointer;
}
.btn-continue{
  color: $color-dark-70;
  border-color: $color-dark-20;
}
.btn-cancel{
  color: $color-error;
  border-color: $color-error;
  margin-bottom: 8px;
}
</style>