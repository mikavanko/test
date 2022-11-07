<script>
import { reactive, computed, onMounted, onUnmounted, ref, onUpdated } from "vue";
import Modal from "@/components/VModal.vue";
import Plug from "@/components/VPlug.vue";

import { isMobile } from "@/assets/js/utils";

export default {
  emits: ["update:isVisible", "modal-close"],
  props: {
    isVisible: {
      type: Boolean,
      default: false,
    },
    desktop: {
      type: Boolean,
      default: false,
    },
    width: {
      type: String,
      default: "500px",
    },
    height: {
      type: String,
      default: "auto",
    },
    bindTo: {
      type: Object,
      default: null,
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

    const position = computed(() => props.bindTo && props.bindTo[0].getBoundingClientRect())

    const modalRef = ref()
    
    const setModalPosition = (e) => {
      if(props.isVisible){
        const modal = modalRef.value.$el.querySelector('.modal')
        const modalHeight = modal.clientHeight
        const bindElementOffsetTop = position.value?.top
        const modalVisibleSpace = modalHeight + bindElementOffsetTop + 10
        const windowHeight = window.innerHeight
        const offset = modalVisibleSpace - windowHeight
        const newPos = position.value.top - offset

        if(modalVisibleSpace > windowHeight){
          state.position.top = newPos
          state.position.left = position.value.right
        }else{
          state.position.top = position.value.top
          state.position.left = position.value.right
        }
      }
    }

    onMounted(()=>{
      window.addEventListener("resize", setModalPosition);
    })
    onUnmounted(()=>{
      window.removeEventListener("resize", setModalPosition);
    })
    onUpdated(()=>{
      setModalPosition()
    })

    const state = reactive({
      position: {
        top: 0,
        left: 0,
      }
    });

    const modalClose = () => {
      emit('modal-close')
    }

    return {
      state,
      isMobile,
      isModalVisible,
      position,
      modalRef,
      modalClose,
    };
  },
  components: {
    Modal,
    Plug,
  },
};
</script>

<template>
  <Modal
    ref="modalRef"
    v-model="isModalVisible"
    :width="isMobile() ? '100%' : width"
    :height="isMobile() ? '100%' : height"
    @modalClose="modalClose"
    :customBodyClass="'custom-body-class'"
    :customWrapperClass="!isMobile() ? 'desktop-wrapper-class' : ''"
    :showModalTop="isMobile()"
    :style="{
      '--top': (state.position?.top || position?.top) + 'px',
      '--left': (state.position?.left || position?.right) + 'px',
    }"
  >
    <Plug />
  </Modal>
</template>

<style lang="scss" scoped>
.desktop-wrapper-class {
  position: static;

  :deep(.modal) {
    position: fixed;
    top: var(--top);
    left: var(--left);
    transform: none;
    max-height: 70vh;
    min-height: 220px;
    z-index: 777;
    box-shadow: 0px 0px 20px rgba(34, 34, 34, 0.1);
    border-radius: 8px;
  }
  :deep(.modal-bg) {
    background-color: transparent;
    cursor: auto;
  }
}
:deep(.custom-body-class) {
  padding: 0;
  overflow: hidden;
  position: relative;
}
</style>