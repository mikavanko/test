<script>
import { reactive, computed } from "vue";
import { useStore } from "vuex";
import { useRouter, useRoute } from "vue-router";
import { isMobile } from "@/assets/js/utils";
import { Types as DocumentTypes } from "@/enums/Document.ts";
import Modal from "@/components/VModal.vue";

import DocumentDefault from "@/components/VDocumentDefault.vue";

export default {
  components: {
    Modal,
    DocumentDefault,
  },
  emits: ["update:modelValue"],
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    const router = useRouter();
    const route = useRoute();
    const store = useStore();

    const isModalVisible = computed({
      get() {
        return props.modelValue;
      },
      set(val) {
        emit("update:modelValue", val);
      },
    });

    const state = reactive({
    });


    function handleDocumentType(type) {
      store.dispatch("documents/setDocumentType", DocumentTypes[type]);
      isModalVisible.value = false;
    }

    return {
      state,
      isModalVisible,
      isMobile,
      handleDocumentType,
    };
  },
};
</script>

<template>
  <Teleport to="body">
    <Modal
      :title="'Шаблоны'"
      v-model="isModalVisible"
      :showModalTop="isMobile()"
      :width="isMobile() ? '100%' : '972px'"
      :height="isMobile() ? '100%' : '80vh'"
      :padding="'0'"
    >
      <DocumentDefault @click="handleDocumentType" />
    </Modal>
  </Teleport>
</template>

<style lang="scss" scoped>
</style>
