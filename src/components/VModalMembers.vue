<script>
import { reactive } from "vue";
import { useStore } from "vuex";
import { isMobile } from "@/assets/js/utils";
import Modal from "@/components/VModal.vue";
import Members from "@/components/VMembers.vue";


export default {
  setup() {
    const state = reactive({
      isModalVisible: false,
    });

    return {
      state,
      isMobile,
    };
  },
  components: {
    Modal,
    Members,
  },
};
</script>

<template>
  <Modal
    id="modal-members"
    :title="'Участники'"
    v-model="state.isModalVisible"
    :showModalTop="isMobile()"
    :width="isMobile() ? '100%' : '290px'"
    :height="isMobile() ? '100%' : 'auto'"
  >
    <Members />
  </Modal>
</template>

<style lang="scss" scoped>
</style>