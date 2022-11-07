<script setup>
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { reactive } from "vue";
import { useToast } from 'vue-toastification';
import ModalCancel from "@/components/VModalCancel.vue";
import CreateProjectForm from "@/components/CreateProjectForm.vue";

const store = useStore();
const router = useRouter();
const toast = useToast();

const state = reactive({
  isModalCancelVisible: false,
});

function projectCreated(project) {
  router.push({ path: "/new-project/invite" });
}

const cancel = () => {
  state.isModalCancelVisible = false
  router.push("/")
}

const goOn = () => {
  state.isModalCancelVisible = false
}

</script>

<template>
  <div class="new-project-page">
    <div class="link-wrapper">
      <span class="link" @click="state.isModalCancelVisible = true">
        <svg-icon name="chevron-left" class="chevron-left-icon" />
        Вернуться назад
      </span>
    </div>

    <CreateProjectForm
      :title="'Создание нового проекта'"
      :subtitle="'Заполните детали проекта'"
      @project-created="projectCreated"
    />
  </div>
  <ModalCancel v-model:isVisible="state.isModalCancelVisible" @cancel="cancel" @continue="goOn" />
</template>

<style lang="scss" scoped>
.new-project-page {
  padding: 15px 0 32px;
  height: 100vh;
  display: flex;
  flex-direction: column;

  @media all and (min-width: $xl) {
    padding: 20px 0;
  }
}

.link {
  display: flex;
  align-items: center;
  font-weight: 400;
  font-size: 16px;
  line-height: 22px;
  cursor: pointer;

  .chevron-left-icon {
    margin-right: 4px;
    font-size: 24px;
  }

  &-wrapper {
    margin-bottom: 24px;
  }

  @media all and (min-width: $xl) {
    font-weight: 600;
    height: 52px;

    &-wrapper {
      display: flex;
      justify-content: flex-end;
    }

    .chevron-left-icon {
      display: none;
    }
  }
}
</style>