<script setup>
import { reactive, watch } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { useToast } from 'vue-toastification';

import Form from "@/components/VForm.vue";
import Input from "@/components/VInput.vue";

import { rePassword } from "@/assets/js/regex.js";
import { updatePassword } from "@/api/auth";

import ErrorAdapter from "@/adapters/Error";
import AuthToServerAdapter from "@/adapters/AuthToServer";

const store = useStore();
const router = useRouter();
const toast = useToast();

const user = store.getters["auth/getUser"];

const state = reactive({
  isDisabled: true,
  isModalShow: false,
  form: {
    password: {
      name: "password",
      label: "Новый пароль",
      value: "",
      type: "password",
      placeholder: "••••••••",
      hasError: false,
      errorText:
        "Пароль должен содержать хотя бы: <br>1 пропискую букву,<br> 1 строчкую букву, <br>1 цифру, <br>1 спец. символ, <br>длина не менее 8 символов",
      rules: [
        {
          validator: (val) => !rePassword.test(val),
        },
      ],
    },
    passwordConfirmation: {
      name: "passwordConfirmation",
      label: "Подтверждения нового пароля",
      type: "password",
      value: "",
      placeholder: "••••••••",
      errorText: "Неверное подтверждения пароля",
      hasError: false,
      rules: [
        {
          validator: (val) => state.form.password.value !== val,
        },
      ],
    },
  },
});

watch(
  () => state.form,
  (form) => {
    const password = form.password.value;
    const rPassword = form.passwordConfirmation.value;

    state.isDisabled = !(
      password.length !== 0 &&
      rPassword.length !== 0
    );
  },
  { deep: true }
);

const onSubmit = ({ errors, values }) => {
  for (const error of errors) {
    toast.error(error.errorText)
  }

  if (!errors.length) {
    const data = AuthToServerAdapter({
      ...values.reduce((obj, item) => ((obj[item.name] = item.value), obj), {}),
      phone: user.phone,
      id: user.id,
    });

    updatePassword(data)
      .then(() => {
        router.push({ path: "/recovery/success" });
      })
      .catch((err) => {
        const error = ErrorAdapter(err);

        toast.error(error.message)
      });
  }
};
</script>

<template>
  <div class="recovery-page">
    <h2 class="h2">Восстановление</h2>

    <Form class="form" @submit="onSubmit">
      <Input
        :name="state.form.password.name"
        v-model:value="state.form.password.value"
        class="form-row"
        :type="state.form.password.type"
        :label="state.form.password.label"
        :placeholder="state.form.password.placeholder"
        :error-text="state.form.password.errorText"
        v-model:has-error="state.form.password.hasError"
        :rules="state.form.password.rules"
      />
      <Input
        :name="state.form.passwordConfirmation.name"
        v-model:value="state.form.passwordConfirmation.value"
        class="form-row"
        :type="state.form.passwordConfirmation.type"
        :label="state.form.passwordConfirmation.label"
        :placeholder="state.form.passwordConfirmation.placeholder"
        :error-text="state.form.passwordConfirmation.errorText"
        :rules="state.form.passwordConfirmation.rules"
        v-model:has-error="state.form.passwordConfirmation.hasError"
      />
      <template #bottom>
        <button type="submit" class="form-submit" :disabled="state.isDisabled">
          Сохранить
        </button>
      </template>
    </Form>
  </div>
</template>

<style lang="scss" scoped>
.recovery-page {
  padding: 60px 0;
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  @media all and (min-width: $xl) {
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
    line-height: 53px;
    margin-bottom: 36px;
    text-align: center;
  }
}

.form {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  height: 100%;

  &-row {
    &:not(:last-child) {
      margin-bottom: 16px;
    }
  }

  &-submit {
    @include submit-button();
  }

  @media all and (min-width: $xl) {
    width: 350px;
    margin: 0 auto;
  }
}
</style>
