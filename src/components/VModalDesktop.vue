<script>
import { reactive, ref, onMounted, computed } from "vue";
import { useStore } from "vuex";

import Modal from "@/components/VModal.vue";

import MonitorMobbileIcon from "@/assets/icons/svg/monitor-mobbile.svg";
import GlobalIcon from "@/assets/icons/svg/global.svg";
import SettingIcon from "@/assets/icons/svg/setting.svg";
import UsersIcon from "@/assets/icons/svg/users.svg";
import Setting2Icon from "@/assets/icons/svg/setting-2.svg";
import IntegrationIcon from "@/assets/icons/svg/integration.svg";

import DesktopUserSettings from "@/components/VDesktopUserSettings.vue";
import Members from "@/components/VMembers.vue";
import ProjectSettings from "@/components/VProjectSettings.vue";
import ConnectedApps from "@/components/VConnectedApps.vue";
import Plug from "@/components/VPlug.vue";

export default {
  components: {
    MonitorMobbileIcon,
    GlobalIcon,
    SettingIcon,
    UsersIcon,
    Setting2Icon,
    IntegrationIcon,
    Modal,
    // content components
    DesktopUserSettings,
    Members,
    ProjectSettings,
    Plug,
    ConnectedApps,
  },
  props: {
    user: {
      type: Object,
      default: () => {},
    },
  },
  setup(props) {
    const user = computed(()=>props.user);

    const state = reactive({
      isModalVisible: false,

      menu: [
        {
          name: "block",
          title: "",
          items: [
            {
              text: "Учётная запись",
              avatarLetter: "М",
              name: "DesktopUserSettings",
              active: false,
              props: {
                user,
              },
              on: {
                cancel: () => state.isModalVisible = false,
                // submitSuccess: () => state.isModalVisible = false,
              },
              wrapperStyle: {
                padding: '30px 50px 70px',
              },
            },
            {
              text: "Уведомления и Настройки",
              icon: "SettingIcon",
              name: "Plug",
              active: false,
            },
            {
              text: "Язык и Регион",
              icon: "GlobalIcon",
              name: "Plug",
              active: false,
            },
            {
              text: "Подключенные приложения",
              icon: "MonitorMobbileIcon",
              name: "ConnectedApps",
              active: false,
            },
          ],
        },
        {
          name: "block",
          title: "Проект",
          items: [
            {
              text: "Участники",
              icon: "UsersIcon",
              name: "Members",
              active: false,
              props: {
                desktop: true,
              },
              wrapperStyle: {
                padding: '30px 50px',
              },
            },
            {
              text: "Настройки",
              icon: "Setting2Icon",
              name: "ProjectSettings",
              active: false,
              props: {
                desktop: true,
              },
              wrapperStyle: {
                padding: '30px 50px',
              },
            },
            {
              text: "Интеграция",
              icon: "IntegrationIcon",
              name: "Plug",
              active: false,
            },
          ],
        },
      ],
      currentComponent: null,
      scrollbarSettings: {
        maxScrollbarLength: 60
      }
    });

    onMounted(()=>{
      changeContent(state.menu[0].items[0])
    })

    const changeContent = (item) => {
      let activeFlag = false;
      for (const block of state.menu) {
        for (const item of block.items) {
          if (item.active) {
            item.active = false;
            activeFlag = true;
            break;
          }
        }
        if (activeFlag) break;
      }

      item.active = true;
      state.currentComponent = item;
    };

    const userSettings = ref();

    const submitUserSettings = () => {
      userSettings.value.submit();
    };

    const scrollHandle = (evt) => {
      console.log(evt)
    }

    return {
      state,
      user,
      submitUserSettings,
      userSettings,
      changeContent,
      scrollHandle,
    };
  },
};
</script>

<template>
  <Modal
    id="modal-desktop"
    class="desk-modal"
    :customBodyClass="'desktop-modal-body'"
    :title="'Настройки'"
    v-model="state.isModalVisible"
    width="80%"
    height="90%"
    :showModalTop="false"
  >
    <div class="menu">
      <div class="menu-email">
        {{ user.email }}
      </div>
      <div class="menu-block" v-for="(block, i) of state.menu" :key="i">
        <h3 class="menu-block-title" v-if="block.title">{{ block.title }}</h3>
        <div
          :class="['menu-item', { active: item.active }]"
          v-for="(item, j) of block.items"
          :key="j"
          @click="changeContent(item)"
        >
          <div class="menu-item-icon">
            <component :is="item.icon" v-if="item.icon" />
            <div class="menu-item-avatar-l" v-else>
              {{ item.avatarLetter }}
            </div>
          </div>
          {{ item.text }}
        </div>
      </div>
    </div>
    <div class="content-wrapper" :style="state.currentComponent.wrapperStyle">
      <PerfectScrollbar class="content">
        <component
          v-if="state.currentComponent" 
          :is="state.currentComponent.name"
          v-bind="state.currentComponent.props"
          v-on="state.currentComponent.on"
        />
      </PerfectScrollbar>
    </div>
    <!-- <div class="content-bottom">
      <button @click="submitUserSettings" class="user-settings-submit">Сохранить</button>
      <div v-modal-close="'modal-desktop'" class="user-settings-cancel">Отменить</div>
    </div> -->
  </Modal>
</template>

<style lang="scss" scoped>
.user-settings-submit {
  @include button-primary-small;
  margin-right: 7px;
}
.user-settings-cancel {
  @include button-secondary-small;
  margin-right: 7px;
}
.desk-modal {
  :deep(.desktop-modal-body) {
    padding: 0;
    display: flex;
    flex: 1 1 0%;
  }
}
.content {
  width: 100%;
  height: 100%;
  position: relative;

  &-wrapper{
    width: 100%;
    height: 100%;
    position: relative;
  }
}
.content-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 70px;
  border-top: 1px solid $color-dark-10;
  padding: 20px 50px;
  background-color: $color-light;
}
.content-title {
  font-weight: 400;
  font-size: 20px;
  line-height: 29px;
  padding-bottom: 15px;
  border-bottom: 1px solid $color-dark-10;
  margin-bottom: 20px;
}
.menu {
  width: 265px;
  min-width: 265px;
  height: 100%;
  background-color: $color-primary-5;

  &-block {
    margin-bottom: 30px;

    &-title {
      font-weight: 400;
      font-size: 12px;
      line-height: 14px;
      color: $color-dark-40;
      padding: 0 20px;
      margin-bottom: 10px;
    }
  }
}
.menu-email {
  padding: 20px 20px 10px;
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  color: $color-dark-40;
}
.menu-item {
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  color: $color-dark-70;
  height: 30px;
  line-height: 30px;
  padding: 0 21px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  cursor: pointer;

  &:hover {
    background: $color-dark-10;
    color: $color-dark;
  }
  &.active {
    background: $color-dark-10;
    color: $color-dark;
    font-weight: 600;
  }
}
.menu-item-icon {
  width: 18px;
  height: 18px;
  margin-right: 5px;
  font-size: 18px;
  color: $color-dark-40;
  display: flex;
}
.menu-item-avatar-l {
  width: 18px;
  height: 18px;
  border-radius: 100%;
  background-color: $color-avatar;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 400;
  font-size: 10px;
  line-height: 12px;
  color: $color-light;
}
</style>