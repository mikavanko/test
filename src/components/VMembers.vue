<script>
import { reactive, computed, ref } from "vue";
import { useStore } from "vuex";

import { isMobile } from "@/assets/js/utils";
import Switch from "@/components/VSwitch.vue";

import { Roles, RoleNames } from "@/enums/Roles";

import ChevronDownIcon from "@/assets/icons/svg/chevron-down.svg";
import SearchIcon from "@/assets/icons/svg/search.svg";

import ModalAccessLevel from "@/components/VModalAccessLevel.vue";
import ModalDesktopAddMember from "@/components/VModalDesktopAddMember.vue";
import ModalAddMember from "@/components/VModalAddMember.vue";

import Input from "@/components/VInput.vue";

import ProjectAdapter from "@/adapters/Project";
import { toggleLink, changeUserRole } from "@/api/projects.js";

export default {
  props: {
    desktop: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const store = useStore();

    const currentProject = computed(
      () => store.getters["projects/getCurrentProject"]
    );
    const users = computed(() => store.getters["projects/getUsers"]);
    const isLinkAvailable = computed(
      () => currentProject.value?.link?.isAvailable
    );

    const state = reactive({
      isModalVisible: false,
      isSwitchOn: isLinkAvailable,
      isModalAccessLevelVisible: false,
      role: null,
      currentUser: null,
      userSearchInput: {
        placeholder: "Найти по email или по имени",
        customInputWrapperClass: "user-search-input",
        value: "",
      },
      coords: null,

      isModalAddMemberVisible: false,
    });

    const filteredUser = computed(() => {
      return users.value.filter((item) => {
        const val = state.userSearchInput.value;

        if (val) {
          return (
            item.name.indexOf(val) !== -1 || item.email.indexOf(val) !== -1
          );
        } else {
          return users.value;
        }
      });
    });

    const copyInput = ref();

    const copyToClipboard = () => {
      copyInput.value.select();
      document.execCommand("copy");
    };

    const opeChangeRoleModal = (e, user) => {
      state.currentUser = user;
      state.role = user.role;
      state.isModalAccessLevelVisible = true;

      state.coords = {
        x: e.clientX,
        y: e.clientY,
      };
    };

    const changeRole = async (role) => {
      const res = await changeUserRole(currentProject.value?.id, {
        userId: state.currentUser.id,
        role,
      })
    }

    const onToggleSwitch = async (val) => {
      const res = await toggleLink(currentProject.value?.id);
      const proj = ProjectAdapter(res.data.data);
      store.commit("projects/setCurrentProject", proj);

      if (!val) {
        store.dispatch("projects/regenerateLink", currentProject.value.id);
      }
    };

    return {
      state,
      isMobile,
      currentProject,
      copyInput,
      copyToClipboard,
      users,
      filteredUser,
      Roles,
      RoleNames,
      opeChangeRoleModal,
      changeRole,
      onToggleSwitch,
    };
  },
  components: {
    Switch,
    ChevronDownIcon,
    ModalAccessLevel,
    Input,
    SearchIcon,
    ModalDesktopAddMember,
    ModalAddMember,
  },
};
</script>

<template>
  <div :class="['members', { flex: !desktop }]">
    <h2 class="title" v-if="desktop">Участники</h2>
    <div class="members-switch-title">
      <div class="members-h3">Ссылка для приглашения</div>
      <Switch
        :modelValue="state.isSwitchOn"
        @update:modelValue="onToggleSwitch"
      />
    </div>
    <div class="members-help">
      Поделитесь этой секретной ссылкой, чтобы пригласить людей в это рабочее
      пространство. Это могут видеть только администраторы. Вы можете сбросить
      ссылку для всех участников пространства, чтобы создать новую ссылку для
      приглашения.
    </div>

    <template v-if="state.isSwitchOn">
      <div :class="['members-input-wrapper', { inline: desktop }]">
        <input
          ref="copyInput"
          type="text"
          class="members-input"
          :value="currentProject?.link?.link"
          readonly
        />
        <button class="members-input-copy-btn" @click="copyToClipboard">
          Скопировать ссылку
        </button>
      </div>
    </template>
    <hr class="members-hr" />

    <div v-if="desktop" class="add-member-block">
      <div class="members-h3">Участники</div>
      <div class="members-help">
        Управляйте участниками здесь или настройте домен, чтобы все, у кого есть
        разрешенные домены электронной почты, могли автоматически присоединиться
        к рабочей области.
      </div>
      <div class="members-help">
        Примечание: с вас будет взиматься плата за каждого добавленного
        участника. Посетите наше руководство для получения дополнительной
        информации о том, как мы выставляем счета.
      </div>
      <div class="add-member-block__bottom">
        <div class="btn-primary-small" v-modal-open="'add-member'">
          Добавить участника
        </div>
        <Input
          v-bind="state.userSearchInput"
          v-model:value="state.userSearchInput.value"
        >
          <template #prefixIcon>
            <SearchIcon class="user-search-icon" />
          </template>
        </Input>
      </div>
    </div>

    <div class="members-table">
      <div class="members-table-head" v-if="desktop">
        <div class="members-table-head__left">Пользователь</div>
        <div class="members-table-head__кшпре">Уровень доступа</div>
      </div>
      <div
        class="members-table-item"
        v-for="(user, idx) of filteredUser"
        :key="idx"
      >
        <div class="members-table-item__avatar"></div>
        <div class="members-table-item__info">
          <div class="members-table-item__name">{{ user.name }}</div>
          <div class="members-table-item__mail">{{ user.email }}</div>
        </div>
        <div
          class="members-table-item__role"
          @click="opeChangeRoleModal($event, user)"
        >
          {{ RoleNames[Roles[user.role]] }}
          <ChevronDownIcon class="members-table-item__role-icon" />
        </div>
      </div>
    </div>
    <div
      v-if="!desktop"
      class="add-member-btn"
      @click="state.isModalAddMemberVisible = true"
    >
      Добавить участника
    </div>
  </div>

  <Teleport to="body">
    <ModalAccessLevel
      v-model:isVisible="state.isModalAccessLevelVisible"
      v-model:role="state.role"
      @update:role="changeRole"
      :desktop="!isMobile()"
      :closeByRoleClick="!isMobile()"
      :coordsPercentOffset="{ top: '-100%', left: '-100%' }"
      :coords="state.coords"
    />
  </Teleport>

  <Teleport to="body">
    <ModalDesktopAddMember
      v-if="!isMobile()"
      v-model:isVisible="state.isModalAddMemberVisible"
    />
    <ModalAddMember v-model:isVisible="state.isModalAddMemberVisible" v-else />
  </Teleport>
</template>

<style lang="scss" scoped>
.user-search-icon {
  font-size: 14px;
  color: $color-dark-40;
}
:deep(.user-search-input) {
  .input__prefixIcon {
    padding: 0 10px;
  }
  .input-wrapper {
    height: 30px;
    width: 236px;
  }
  .input {
    font-weight: 400;
    font-size: 14px;
    border-radius: 4px;
    letter-spacing: 0;
    padding-left: 34px;
    padding-right: 10px;
  }
}
.add-member-block {
  margin-bottom: 20px;

  &__bottom {
    margin-top: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
.btn-primary-small {
  @include button-primary-small;
}
.title {
  font-weight: 400;
  font-size: 20px;
  line-height: 29px;
  padding-bottom: 15px;
  border-bottom: 1px solid $color-dark-10;
  margin-bottom: 20px;
}
.members {
  &.flex {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
}
.add-member-btn {
  @include submit-button;

  margin-top: auto;
}
.members {
  &-help {
    font-weight: 400;
    font-size: 12px;
    line-height: 14px;
    color: $color-dark-20;

    &:not(:last-of-type) {
      margin-bottom: 5px;
    }
  }
  &-input {
    @include clear-input;

    height: 30px;
    line-height: 30px;
    padding: 0 8px;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    color: $color-dark-70;
    border: 1px solid $color-dark-20;
    border-radius: 4px;
    margin-bottom: 8px;

    &:read-only {
      background-color: $color-light-f;
      color: $color-dark-40;
    }

    &-copy-btn {
      @include clear-button;

      padding: 5px;
      width: 100%;
      font-weight: 600;
      font-size: 14px;
      line-height: 20px;
      color: $color-primary;
      border: 1px solid $color-primary;
      border-radius: 4px;
      font-family: $Lato;
    }

    &-wrapper {
      margin-top: 10px;

      &.inline {
        display: flex;
        justify-content: flex-start;
        align-items: center;

        .members-input {
          margin-bottom: 0;
          margin-right: -10px;
          width: 100%;
        }
        .members-input-copy-btn {
          @include button-primary-small;
          white-space: nowrap;
        }
      }
    }
  }

  &-hr {
    width: 100%;
    height: 1px;
    background-color: $color-dark-10;
    border-radius: 10px;
    border: none;
    margin: 24px 0;
  }
  &-h3 {
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;
    color: $color-dark-70;
  }
}
.members-switch-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.members-table {
  &-head {
    border-bottom: 1px solid $color-dark-10;
    font-weight: 400;
    font-size: 12px;
    line-height: 14px;
    color: $color-dark-20;
    display: flex;
    justify-content: space-between;
    padding: 5px 0;
  }
  &-item {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    margin-top: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid $color-dark-10;

    &__avatar {
      width: 20px;
      height: 20px;
      border-radius: 100%;
      background-color: $color-dark-20;
      margin-right: 10px;
    }

    &__name {
      font-weight: 400;
      font-size: 14px;
      line-height: 19px;
    }

    &__mail {
      font-weight: 400;
      font-size: 11px;
      line-height: 13px;
      color: $color-dark-40;
    }

    &__role {
      font-weight: 400;
      font-size: 12px;
      line-height: 14px;
      color: $color-dark-70;
      margin-left: auto;
      display: flex;
      align-items: center;
      height: 100%;
      cursor: pointer;
    }
    &__role-icon {
      font-weight: 400;
      font-size: 12px;
      line-height: 14px;
      color: $color-dark-70;
      margin-left: 2px;
    }
  }
}

.form {
  &-submit {
    @include submit-button();
  }
}
</style>