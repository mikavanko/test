<script setup>
import { reactive } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { useToast } from 'vue-toastification';

import Tabs from "@/components/VTabs.vue";
import AuthForm from "@/components/VAuthForm.vue";

import ErrorAdapter from "@/adapters/Error";

const TABS = {
  mail: "mail",
  phone: "phone",
};

const toast = useToast();

const store = useStore();

const state = reactive({
  TABS,
  tabsItems: [
    {
      id: TABS.mail,
      isActive: true,
      value: "Электронная почта",
    },
    {
      id: TABS.phone,
      isActive: false,
      value: "Номер телефона",
    },
  ],
  currentTabId: TABS.mail,
});

const onTabsChange = (item) => {
  const activeTab = state.tabsItems.find((el) => el.isActive);
  const currentTab = state.tabsItems.find((el) => el.id === item.id);

  activeTab.isActive = false;
  currentTab.isActive = true;

  state.currentTabId = currentTab.id;
};

const router = useRouter();

const onSubmit = (values) => {
  const data = {
    ...values.reduce((obj, item) => ((obj[item.name] = item.value), obj), {}),
    // with_send_code: true,
  };

  store.dispatch("auth/loginByPassword", data).then((res) => {
    const error = ErrorAdapter(res.error);

    if (error) {
      toast.error(error.message)
    } else {
      if(res.user.tg_chat_id !== null && res.user.tg_username !== null){
        router.push({ path: "/auth/check" });
      }else{
        router.push({ path: "/registration/bind-telegram" });
      }
    }
  });
};
</script>

<template>
  <div class="auth-page">
    <h2 class="h2">Вход в систему</h2>

    <Tabs class="tabs" :tabs-items="state.tabsItems" @change="onTabsChange" />

    <AuthForm
      :tabs-constants="state.TABS"
      :tabs-items="state.tabsItems"
      @submit="onSubmit"
    />
  </div>
</template>

<style lang="scss" scoped>
.auth-page {
  padding: 60px 0;
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  @media all and (min-width: $xl) {
    width: 350px;
    margin: 0 auto;
    padding: 100px 0;
  }
}

.h2 {
  font-weight: 400;
  font-size: 26px;
  line-height: 35px;
  margin-bottom: 16px;

  @media all and (min-width: $xl) {
    font-weight: 400;
    font-size: 36px;
    line-height: 43px;
    margin-bottom: 46px;
    text-align: center;
  }
}

.tabs {
  margin-bottom: 16px;

  @media all and (min-width: $xl) {
    margin-bottom: 25px;
  }
}
</style>
