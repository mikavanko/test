<script setup>
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { computed, reactive, defineEmits } from "vue";
import { useToast } from 'vue-toastification';
import ErrorAdapter from "@/adapters/Error";
import Form from "@/components/VForm.vue";
import InputSearch from "@/components/VInputSearch.vue";

import { isMobile } from "@/assets/js/utils";

import { getUsers } from "@/api/projects";
import { map } from "lodash";
import UserAdapter from "@/adapters/User.js";
import { appendUsersToProject } from "@/api/projects";
import { Roles } from "@/enums/Roles";
import ProjectAdapter from "@/adapters/Project"
const emit = defineEmits(["users-invited"])

const store = useStore();
const router = useRouter();
const toast = useToast();

const inputSearch = {
  name: "add-user",
  placeholder: "Добавить никнейм",
  value: "",
  dropdownData: [],
};

const state = reactive({
  form: [inputSearch, inputSearch, inputSearch],
});

const currentProject = computed(
  () => store.getters["projects/getCurrentProject"]
);
const newProject = computed(
  () => store.getters["projects/getNewProject"]
);

const copy = () => {
  const link = currentProject.value?.link?.link;
  navigator.clipboard
    .writeText(link)
    .then(() => {
      console.log("Copy Success");
    })
    .catch((err) => {
      const error = ErrorAdapter(err);

      if (error) {
        toast.error(error.message)
      }
    });
};

const debounceCallback = (val, item) => {
  const params = {
    fields: ["nickname"],
    query: val,
  };

  getUsers(params).then((res) => {
    const users = map(res.data.data, UserAdapter);
    item.dropdownData = users.map((item) => ({
      img: item.avatar?.originalUrl,
      value: item.nickname,
    }));
  });
};

const selectNickname = (val) => {
  console.log("selectNickname", val);
};

const addMoreUsers = () => {
  state.form.push(inputSearch);
};

const onSubmit = ({ errors, values }) => {
  for (const error of errors) {
    toast.error(error.errorText)
  }

  if (!errors.length) {
    const userExist = values.some(i => i.value)

    if (userExist) {
      const data = {
        fields: values
          .filter((v) => v.value)
          .map((v) => ({
            nickname: v.value,
            role: Roles.USER,
          })),
      };

      appendUsersToProject(newProject.value?.id, data)
        .then(() => {
        })
        .catch((err) => {
          const error = ErrorAdapter(err);

          toast.error(error.message)
        })
        .finally(() => {
          setCurrentProject()
        })
    } else {
      setCurrentProject()
    }
  }
};

function setCurrentProject() {
  const project = ProjectAdapter(newProject.value);
  store.dispatch("projects/setCurrentProject", project);

  emit('users-invited', project);
}


</script>

<template>
  <div class="form-wrapper">
    <div class="form-title">
      Добавьте других <br />участников проекта
    </div>
    <div class="form-subtitle" v-if="isMobile()">
      Подходит для любой команды
    </div>
    <div class="form-subtitle" v-else>
      Достигнете большего добавив своих друзей
    </div>

    <div class="form-img" v-if="isMobile()" />

    <template v-if="isMobile()">
      <div class="form-btn-copy" @click="copy">
        Скопировать ссылку проекта
      </div>
      <div class="form-btn-next" @click="setCurrentProject">
        Продолжить
      </div>
    </template>
    <template v-else>
      <Form class="form" @submit="onSubmit">
        <div class="form-top">
          <div class="form-top-title">Добавить участников</div>
          <div class="link" @click="copy">Скопировать ссылку</div>
        </div>
        <InputSearch class="form-input-search" v-for="(item, idx) of state.form" :key="idx" v-bind="item"
          v-model:value="item.value" :item="item" :callback="debounceCallback"
          :customDropdownClass="'custom-dropdown-class'" @select="selectNickname">
          <template #dropdown-item="item">
            <div class="custom-dropdown-item">{{ item.value }}</div>
          </template>
        </InputSearch>

        <template #bottom>
          <div class="link add-more-users" @click="addMoreUsers">
            <svg-icon name="plus" class="plus-icon" />Добавить ещё
          </div>
          <div class="form-bottom">
            <button type="submit" class="form-submit" :disabled="state.isSubmitBtnDisabled">
              Продолжить
            </button>
          </div>
        </template>
      </Form>
    </template>
  </div>
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

.form-wrapper {
  padding: 15px 0 32px;
  display: flex;
  flex-direction: column;

  @media all and (min-width: $xl) {
    padding: 20px 0;
  }
}

.form-img {
  width: 250px;
  height: 270px;
  margin: 0 auto 40px;
  background: url("@/static/img/invite.svg") no-repeat center center;
}

.form-title {
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

.form-subtitle {
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

.form-btn-copy {
  @include secondary-button;
  margin-bottom: 8px;
}

.form-btn-next {
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