<script>
import { reactive, computed, ref, watch } from "vue";
import { useStore } from "vuex";
import { getUsers } from "@/api/projects";
import { Roles, RoleNames } from "@/enums/Roles";
import { isMobile } from "@/assets/js/utils";
import Modal from "@/components/VModal.vue";
import ModalAccessLevel from "@/components/VModalAccessLevel.vue";
import TempUser from "@/components/VTempUser.vue";
import ChevronRightIcon from "@/assets/icons/svg/chevron-right.svg";
import InputSearch from "@/components/VInputSearch.vue";
import { map } from "lodash";
import UserAdapter from "@/adapters/User.js";
import { appendUsersToProject } from "@/api/projects";
import ErrorAdapter from "@/adapters/Error";
import { useToast } from 'vue-toastification';

export default {
  emits: ["update:isVisible"],
  props: {
    isVisible: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    const toast = useToast();
    const store = useStore();

    const inputSearchRef = ref();

    const currentProject = computed(
      () => store.getters["projects/getCurrentProject"]
    );

    const state = reactive({
      isModalAccessLevelVisible: false,
      isModalAccessLevelVisibleUser: false,
      role: Roles.USER,
      tempUser: null,
      canAddMember: false,
      searchInput: {
        label: "Никнейм пользователя",
        placeholder: "Начните вводите никнейм пользователя",
        value: "",
        dropdownData: [],
      },
      tempUsers: [],
    });

    const isModalVisible = computed({
      get() {
        return props.isVisible;
      },
      set(val) {
        emit("update:isVisible", val);
      },
    });

    watch(
      isModalVisible,
      (val) => {
        if (!val) {
          state.role = Roles.USER;
          state.canAddMember = false;
          state.searchInput.value = "";
          state.searchInput.dropdownData = [];
          state.tempUsers = [];
        }
      },
      {
        deep: true,
      }
    );

    const showChooseMainRoleModal = (role) => {
      state.isModalAccessLevelVisible = true;
      state.role = role ?? Roles.ADMIN;
    };

    const showChooseUserRoleModal = (e, item) => {
      state.tempUser = item;
      state.isModalAccessLevelVisibleUser = true;
    };

    const removeUser = (idx, user) => {
      state.tempUsers.splice(idx, 1)
    }

    const addMember = () => {
      if (state.canAddMember) {
        const data = {
          fields: state.tempUsers.map((el) => ({
            nickname: el.nickname,
            role: el.role,
          })),
        };

        appendUsersToProject(currentProject.value?.id, data)
          .then((res) => {
            isModalVisible.value = false;
          })
          .catch((err) => {
            const error = ErrorAdapter(err);

            toast.error(error.message)
          });
      }
    };

    const debounceCallback = (val) => {
      const params = {
        fields: ["nickname"],
        query: val,
      };

      getUsers(params).then((res) => {
        const users = map(res.data.data, UserAdapter);
        state.searchInput.dropdownData = users.map((item) => ({
          ...item,
          img: item.avatar?.originalUrl,
          value: item.nickname,
        }));
      });
    };

    const selectNickname = async (val) => {
      state.tempUsers.push({
        ...val,
        role: state.role,
      });

      inputSearchRef.value.clear();
    };

    return {
      state,
      isMobile,
      isModalVisible,
      Roles,
      RoleNames,
      showChooseMainRoleModal,
      showChooseUserRoleModal,
      addMember,
      debounceCallback,
      selectNickname,
      inputSearchRef,
      removeUser,
    };
  },
  watch: {
    "state.tempUsers": {
      handler(val) {
        this.state.canAddMember = !!val.length;
      },
      deep: true,
    },
  },
  components: {
    Modal,
    ModalAccessLevel,
    ChevronRightIcon,
    InputSearch,
    TempUser,
  },
};
</script>

<template>
  <Modal
    id="add-member"
    :title="'Добавление'"
    v-model="isModalVisible"
    :showModalTop="isMobile()"
    :width="isMobile() ? '100%' : '290px'"
    :height="isMobile() ? '100%' : 'auto'"
  >
    <div class="choose-role" @click="showChooseMainRoleModal(state.role)">
      <div class="choose-role-label">Уровень доступа</div>
      <div class="choose-role-input">
        {{ RoleNames[state.role] }}
        <ChevronRightIcon class="choose-role-icon" />
      </div>
    </div>
    <InputSearch
      ref="inputSearchRef"
      class="search-input"
      v-bind="state.searchInput"
      v-model:value="state.searchInput.value"
      :callback="debounceCallback"
      @select="selectNickname"
    />

    <template v-if="state.tempUsers?.length">
      <h2 class="temp-users-title">Добавление пользователей</h2>

      <TempUser
        v-for="(item, idx) of state.tempUsers"
        :key="idx"
        :user="item"
        @change-role="showChooseUserRoleModal"
        @remove="removeUser(idx, $event)"
      />
    </template>

    <template #top-right-content>
      <div
        :class="['next-btn', { disabled: !state.canAddMember }]"
        @click="addMember"
      >
        Добавить
      </div>
    </template>
  </Modal>
  <Teleport to="body">
    <ModalAccessLevel
      :useCloseBtn="false"
      :useNextBtn="true"
      v-model:isVisible="state.isModalAccessLevelVisible"
      v-model:role="state.role"
    />
  </Teleport>
  <Teleport to="body">
    <ModalAccessLevel
      v-if="state.tempUser"
      :useCloseBtn="false"
      :useNextBtn="true"
      v-model:isVisible="state.isModalAccessLevelVisibleUser"
      v-model:role="state.tempUser.role"
    />
  </Teleport>
</template>

<style lang="scss" scoped>
.temp-users-title{
  font-weight: 400;
  font-size: 14px;
  line-height: 17px;
  margin-bottom: 8px;
}
.search-input {
  margin-bottom: 24px;
}
.choose-role {
  margin-bottom: 16px;
  position: relative;

  &-label {
    font-weight: 400;
    font-size: 14px;
    line-height: 17px;
    margin-bottom: 6px;
  }

  &-input {
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    color: $color-dark-70;
    border: 1px solid $color-dark-20;
    box-sizing: border-box;
    border-radius: 8px;
    height: 52px;
    line-height: 50px;
    padding: 0 45px 0 16px;
    position: relative;
  }

  &-icon {
    font-size: 19px;
    color: $color-dark-40;
    position: absolute;
    top: 50%;
    right: 16px;
    transform: translateY(-50%);
  }
}

.next-btn {
  font-weight: 600;
  font-size: 16px;
  line-height: 22px;
  color: $color-primary;
  cursor: pointer;

  &.disabled {
    color: $color-dark-20;
  }
}
</style>