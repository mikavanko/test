<script>
import { reactive, computed, ref, watch } from "vue";
import { useStore } from "vuex";
import { getUsers } from "@/api/projects";
import { Roles, RoleNames } from "@/enums/Roles";
import { isMobile } from "@/assets/js/utils";
import Modal from "@/components/VModal.vue";
import ModalAccessLevel from "@/components/VModalAccessLevel.vue";
import TempUser from "@/components/VTempUser.vue";
import ChevronDownIcon from "@/assets/icons/svg/chevron-down.svg";
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
        placeholder: "Найти по никнейму",
        value: "",
        dropdownData: [],
      },
      tempUsers: [],
      mainModalCoords: null,
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

    const showChooseMainRoleModal = (e, role) => {
      state.isModalAccessLevelVisible = true;
      state.role = role ?? Roles.ADMIN;

      state.mainModalCoords = {
        x: e.clientX,
        y: e.clientY,
      };
    };

    const showChooseUserRoleModal = (e, item) => {
      state.tempUser = item;
      state.isModalAccessLevelVisibleUser = true;


      state.userModalCoords = {
        x: e.clientX,
        y: e.clientY,
      };
      
    };

    const removeUser = (idx, user) => {
      state.tempUsers.splice(idx, 1);
    };

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
            // closeModal();
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
    ChevronDownIcon,
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
    :width="isMobile() ? '100%' : '500px'"
    :height="isMobile() ? '100%' : '488px'"
    :customBodyClass="'desktop-body-class'"
  >
    <div class="search-input-wrapper">
      <InputSearch
        ref="inputSearchRef"
        class="search-input"
        v-bind="state.searchInput"
        v-model:value="state.searchInput.value"
        :callback="debounceCallback"
        :customDropdownClass="'desktop-dropdown'"
        @select="selectNickname"
      />

      <div class="search-input-btn-group">
        <div
          class="choose-role"
          @click="showChooseMainRoleModal($event, state.role)"
        >
          <div class="choose-role-input">
            {{ RoleNames[state.role] }}
            <ChevronDownIcon class="choose-role-icon" />
          </div>
        </div>
        <button class="add-user-btn" :disabled="!state.canAddMember" @click.prevent="addMember">
          Пригласить
        </button>
      </div>
    </div>

    <template v-if="state.tempUsers?.length">
      <h2 class="temp-users-title">Добавление людей</h2>

      <TempUser
        class="temp-user-row"
        v-for="(item, idx) of state.tempUsers"
        :key="idx"
        :user="item"
        @change-role="showChooseUserRoleModal"
        @remove="removeUser(idx, $event)"
      />
    </template>
  </Modal>
  <Teleport to="body">
    <ModalAccessLevel
      :desktop="!isMobile()"
      :closeByRoleClick="!isMobile()"
      :coords="state.mainModalCoords"
      :coordsPercentOffset="{ top: '20px', left: '-50%' }"
      v-model:isVisible="state.isModalAccessLevelVisible"
      v-model:role="state.role"
    />
  </Teleport>
  <Teleport to="body">
    <ModalAccessLevel
      v-if="state.tempUser"
      :desktop="!isMobile()"
      :closeByRoleClick="!isMobile()"
      :coords="state.userModalCoords"
      :coordsPercentOffset="{ top: '20px', left: '-100%' }"
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
  line-height: 20px;
  color: $color-dark-40;
  margin-bottom: 5px;
}
.temp-user-row{
  margin: 0 -20px;
  padding: 0 10px 0 20px;

  &:hover{
    background-color: $color-light-f;
  }
  :deep(.temp-user){
    justify-content: flex-end;
  }

  :deep(.temp-user-left){
    margin-right: auto;
  }

  :deep(.temp-user-remove){
    background-color: transparent;
    position: relative;
    right: 0;
    color: $color-dark-20;
    font-size: 20px;
    transition: all .3s ease;

    &:hover{
      color: $color-light;

      &:before{
        background-color: $color-dark-20;
      }

    }

    &:before{
      content: '';
      width: 17px;
      height: 17px;
      position: absolute;
      z-index: 0;
      border-radius: 100%;
      background-color: transparent;
      transition: all .3s ease;
    }

    .close-icon{
      position: relative;
      z-index: 1;
    }
  }
}
:deep(.desktop-dropdown) {
  top: 100%;
  box-shadow: 0px 0px 20px rgba(34, 34, 34, 0.1);

  .dropdown-item-wrapper {
    padding: 0 10px 0 20px;

    &:hover {
      background-color: $color-light-f;
    }
  }

  .dropdown-item {
    padding: 8px 0 8px;
  }
}
.search-input-wrapper {
  margin: -20px -20px 20px;
  position: relative;
  background-color: $color-light-f;

  .search-input-btn-group {
    position: absolute;
    top: 50%;
    right: 10px;
    transform: translateY(-50%);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .add-user-btn {
    @include button-primary-small;
  }

  .choose-role {
    position: relative;
    cursor: pointer;
    margin-right: 10px;

    &-input {
      font-weight: 400;
      font-size: 12px;
      line-height: 14px;
      color: $color-dark-70;
      display: flex;
      justify-content: flex-start;
      align-items: center;
    }

    &-icon {
      font-size: 12px;
      color: $color-dark-70;
      margin-left: 2px;
    }
  }
}
.search-input {
  width: 100%;

  :deep(.input) {
    border: none;
    border-radius: 0;
    background-color: $color-light-f;
    padding-right: 200px;
  }
}
:deep(.desktop-body-class) {
  padding: 20px;
}
</style>