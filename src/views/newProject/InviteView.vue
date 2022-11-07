<script setup>
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { computed, reactive } from "vue";
import { useToast } from 'vue-toastification';
import ErrorAdapter from "@/adapters/Error";
import ModalCancel from "@/components/VModalCancel.vue";
import InviteToProjectForm from "@/components/InviteToProjectForm.vue";

import { getUsers } from "@/api/projects";
import { map } from "lodash";
import UserAdapter from "@/adapters/User.js";
import { appendUsersToProject } from "@/api/projects";
import { Roles } from "@/enums/Roles";
import ProjectAdapter from "@/adapters/Project"

const store = useStore();
const router = useRouter();
const toast = useToast();

const state = reactive({
  isModalCancelVisible: false,
});

const cancel = () => {
  state.isModalCancelVisible = false
  router.push("/")
}

const goOn = () => {
  state.isModalCancelVisible = false
}

function goToProject(project) {
  router.push({ path: `/projects/${project.id}` })
}
</script>

<template>
  <div class="new-project-page">
    <div class="go-back-wrapper">
      <span class="link go-back" @click="state.isModalCancelVisible = true">
        <svg-icon name="chevron-left" class="chevron-left-icon" />
        Вернуться назад
      </span>
    </div>

    <InviteToProjectForm @users-invited="goToProject" />
  </div>
  <ModalCancel v-model:isVisible="state.isModalCancelVisible" @cancel="cancel" @continue="goOn" />
</template>

<style lang="scss" scoped>
.add-more-users {
  margin-bottom: 10px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  font-weight: 400;
  font-size: 16px;
  line-height: 22px;

  .plus-icon {
    font-size: 20px;
    margin-right: 4px;
  }
}
.form {
  width: 350px;
  margin: 0 auto;

  &-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    &-title {
      font-weight: 400;
      font-size: 16px;
      line-height: 19px;
      color: $color-dark-40;
    }

    .link {
      font-size: 16px;
      line-height: 22px;
    }
  }

  &-input-search {
    margin-bottom: 10px;
  }
}
.new-project-page {
  padding: 15px 0 32px;
  display: flex;
  flex-direction: column;

  @media all and (min-width: $xl) {
    padding: 20px 0;
  }
}
.go-back {
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
.new-project-img {
  width: 250px;
  height: 270px;
  margin: 0 auto 40px;
  background: url("@/static/img/invite.svg") no-repeat center center;
}
.new-project-title {
  font-weight: 400;
  font-size: 20px;
  line-height: 24px;
  text-align: center;
  margin-bottom: 2px;

  @media all and (min-width: $xl) {
    font-weight: 400;
    font-size: 36px;
    line-height: 53px;

    br {
      display: none;
    }
  }
}
.new-project-subtitle {
  font-weight: 400;
  font-size: 14px;
  line-height: 17px;
  text-align: center;
  color: $color-dark-40;
  margin-bottom: 24px;

  @media all and (min-width: $xl) {
    font-weight: 400;
    font-size: 18px;
    line-height: 27px;
    margin-bottom: 33px;
  }
}
.new-project-btn-copy {
  @include secondary-button;
  margin-bottom: 8px;
}
.new-project-btn-next {
  @include submit-button;
}
.form-submit {
  @include submit-button;
}
:deep(.custom-dropdown-class) {
  background: $color-light;
  box-shadow: 0px 0px 20px rgba(34, 34, 34, 0.1);
  border-radius: 8px;
  padding: 8px 5px;
  top: calc(100% + 5px);
}
:deep(.custom-dropdown-item) {
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  padding: 3px 5px;
  border-radius: 4px;
  cursor: pointer;

  &:not(:last-child) {
    margin-bottom: 4px;
  }
  &:hover {
    background-color: $color-light-f;
  }
}
</style>