<script setup>
import { reactive, computed, watch } from "vue";
import { RouterLink } from "vue-router";

import Form from "@/components/VForm.vue";
import Input from "@/components/VInput.vue";
import Checkbox from "@/components/VCheckbox.vue";

import { reEmail, rePhone } from "@/assets/js/regex.js";

import { useToast } from 'vue-toastification';
const toast = useToast();

const props = defineProps({
  tabsConstants: {
    type: Object,
    required: true,
  },
  tabsItems: {
    type: Array,
    required: true,
  },
});

const state = reactive({
  form: {
    login: "",
    password: "",
  },
});

const currentType = computed(() => props.tabsItems.find((el) => el.isActive));

watch(
  () => currentType.value.id,
  () => {
    state.form.login = "";
    state.form.password = "";
  }
);

const emit = defineEmits(["submit"]);

const onSubmit = ({ errors, values }) => {
  for (const error of errors) {
    toast.error(error.errorText)
  }

  if (!errors.length) {
    emit("submit", values);
  }
};
</script>

<template>
  <Form class="form" @submit="onSubmit">
    <Input
      v-if="currentType.id === tabsConstants.mail"
      name="email"
      v-model:value="state.form.login"
      class="form-row"
      placeholder="example@gmail.com"
      :error-text="'Неверный формат электронной почты'"
      :label="currentType.value"
      :rules="[{ validator: (val) => !reEmail.test(val) }]"
    />
    <Input
      v-else
      name="phone"
      v-model:value="state.form.login"
      class="form-row"
      type="tel"
      placeholder="+79161234567"
      :error-text="'Неверный формат телефона'"
      :label="currentType.value"
      :mask="'+7##########'"
      :rules="[{ validator: (val) => !rePhone.test(val) }]"
    />

    <Input
      v-model:value="state.form.password"
      name="password"
      class="form-row"
      type="password"
      error-text="Введите пароль"
      :label="'Пароль'"
      placeholder="••••••••"
      :rules="[{ validator: (val) => !val.length }]"
    />

    <div class="form-row flex">
      <Checkbox>Запомнить меня</Checkbox>
      <RouterLink to="/recovery">Забыли пароль?</RouterLink>
    </div>

    <template #bottom>
      <div class="form-bottom">
        <button type="submit" class="form-submit">Войти</button>
        <div class="form-bottom-text">
          У вас еще нет доступа?
          <RouterLink to="/registration">Зарегистрироваться</RouterLink>
        </div>
      </div>
    </template>
  </Form>
</template>

<style lang="scss" scoped>
.form {
  &-row {
    &:not(:last-child) {
      margin-bottom: 16px;
    }

    &.flex {
      display: flex;
      justify-content: space-between;
      align-items: center;

      @media all and (min-width: $xl) {
        margin-top: 30px;
      }
    }
  }

  &-submit {
    @include submit-button();

    margin-bottom: 16px;

    @media all and (min-width: $xl) {
      margin-bottom: 20px;
    }
  }

  &-bottom {
    &-text {
      text-align: center;
      color: $color-dark-20;
      font-weight: 400;
      font-size: 14px;
      line-height: 19px;
    }
  }
}
</style>
