<script>
import { reactive } from "vue";
import { useStore } from "vuex";
import { useRouter } from 'vue-router';

import CreateProjectForm from "@/components/CreateProjectForm.vue";
import InviteToProjectForm from "@/components/InviteToProjectForm.vue";

export default{
  components: {
    CreateProjectForm,
    InviteToProjectForm,
  },
  setup(){
    const router = useRouter()
    const store = useStore()

    const state = reactive({
      step: 1,
    })

    function projectCreated(project) {
      state.step = 2;
    }

    function goToProject(project) {
      router.push({ path: `/projects/${project.id}` })
    }

    return {
      state,
      projectCreated,
      goToProject,
    }
  }
}
</script>

<template>
  <div class="home">
    <div class="home-step" v-if="state.step === 1" >
      <div class="home-step__left">
        <CreateProjectForm
          :title="'Привет! Давай настроим <br>твой первый проект'"
          :subtitle="'Заполни детали проекта'"
          @project-created="projectCreated"
        />

        <div class="nav">
          <div class="nav-item active" />
          <div class="nav-item" />
        </div>
      </div>
      <div class="home-step__right" />
    </div>
    <div class="home-step" v-else>
      <div class="home-step__left">
        <InviteToProjectForm @users-invited="goToProject" />

        <div class="nav">
          <div class="nav-item" />
          <div class="nav-item active" />
        </div>
      </div>
      <div class="home-step__right" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.nav{
  margin-top: 60px;
  gap: 8px;
  display: flex;
  justify-content: center;
  align-items: center;

  &-item{
    width: 8px;
    height: 8px;
    border-radius: 100%;
    background-color: $color-dark-20;
    
    &.active{
      background-color: $color-primary;
    }
  }
}
.home{
  height: 100vh;

  @media all and (max-width: $xl - 1px) {
    padding: 16px 24px;
  }
}
.home-step{
  height: 100%;
  display: flex;
  align-items: stretch;
  justify-content: flex-start;

  @media all and (min-width: $xl) {
    &__left{
      height: 100%;
      width: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
    }
    &__right{
      height: 100%;
      width: 50%;
      background: $color-primary-5 url("@/static/img/home-new-project-step-1.svg") no-repeat center right;
    }
  }

  @media all and (max-width: $xl - 1px) {
    &__left{
      width: 100%;
    }
  }
}
</style>