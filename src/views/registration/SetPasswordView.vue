<script setup>
import { reactive, watch } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { useToast } from 'vue-toastification';

import { rePassword } from "@/assets/js/regex.js";

import Form from "@/components/VForm.vue";
import Input from "@/components/VInput.vue";

import ErrorAdapter from "@/adapters/Error";
import { validatePassword } from "@/api/auth";

const router = useRouter();
const store = useStore();
const toast = useToast();

const state = reactive({
  isDisabled: true,

  form: {
    password: {
      name: "password",
      value: "",
      label: "Пароль",
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
    repeatPassword: {
      name: "repeatPassword",
      label: "Подтверждения пароля",
      type: "password",
      placeholder: "••••••••",
      value: "",
      hasError: false,
      errorText: "Неверное подтверждение пароля",
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
    const rPassword = form.repeatPassword.value;

    state.isDisabled = !(password.length !== 0 && rPassword.length !== 0);
  },
  { deep: true }
);

const onSubmit = ({ errors, values }) => {
  for (const error of errors) {
    toast.error(error.errorText)
  }

  if (!errors.length) {
    const data = {
      ...values.reduce((obj, item) => ((obj[item.name] = item.value), obj), {}),
    };

    validatePassword({ password: data.password })
      .then(() => {
        store.dispatch("registration/setParams", { password: data.password });

        const regParams = {
          // ...values.reduce(
          //   (obj, item) => ((obj[item.name] = item.value), obj),
          //   {}
          // ),
          ...store.getters["registration/getParams"],
          // code: '1111',
        };
        store
          .dispatch("registration/registration", regParams)
          .then(() => {
            router.push({ path: "/registration/telegram" });
          })
          .catch((err) => {
            console.log('err',err)
            const error = ErrorAdapter(err);

            toast.error(error.message)
          });

      })
      .catch((err) => {
        const error = ErrorAdapter(err);

        toast.error(error.message)
      });
  }
};
</script>

<template>
  <div class="registration-page">
    <div class="h2-wrapper">
      <h2 class="h2">Регистрация</h2>
      <div class="registration-step">
        <span class="registration-step__value">02</span>
        <span class="registration-step__slash">/</span>
        <span class="registration-step__amount">04</span>
      </div>
    </div>

    <Form class="form" @submit="onSubmit">
      <Input
        :name="state.form.password.name"
        v-model:value="state.form.password.value"
        class="form-row"
        :type="state.form.password.type"
        :label="state.form.password.label"
        :placeholder="state.form.password.placeholder"
        v-model:has-error="state.form.password.hasError"
        :rules="state.form.password.rules"
        :errorText="state.form.password.errorText"
      />
      <Input
        :name="state.form.repeatPassword.name"
        v-model:value="state.form.repeatPassword.value"
        class="form-row"
        :type="state.form.repeatPassword.type"
        :label="state.form.repeatPassword.label"
        :placeholder="state.form.repeatPassword.placeholder"
        v-model:has-error="state.form.repeatPassword.hasError"
        :rules="state.form.repeatPassword.rules"
        :errorText="state.form.repeatPassword.errorText"
      />
      <template #bottom>
        <div class="form-bottom">
          <div @click="$router.go(-1)" class="form-back">Назад</div>
          <button
            type="submit"
            class="form-submit"
            :disabled="state.isDisabled"
          >
            Далее
          </button>
        </div>
      </template>
    </Form>
  </div>
</template>

<style lang="scss" scoped>
.registration-page {
  padding: 60px 0;
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  @media all and (min-width: $xl) {
    padding: 100px 0;
  }
}

.h2-wrapper {
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media all and (min-width: $xl) {
    width: 350px;
    margin: 0 auto 36px auto;
  }
}

.h2 {
  font-weight: 400;
  font-size: 26px;
  line-height: 35px;

  @media all and (min-width: $xl) {
    font-weight: 400;
    font-size: 36px;
    line-height: 53px;
  }
}

.registration-step {
  white-space: nowrap;

  &__value {
    font-weight: 400;
    font-size: 21px;
    line-height: 25px;
    color: $color-dark-70;
    margin-right: 2px;
  }
  &__slash {
    font-weight: 400;
    font-size: 14px;
    line-height: 17px;
    color: $color-dark-40;
    margin-right: 2px;
  }
  &__amount {
    font-weight: 400;
    font-size: 14px;
    line-height: 17px;
    color: $color-dark-40;
  }

  @media all and (min-width: $xl) {
    margin-top: 10px;
  }
}

.form {
  &-row {
    &:not(:last-child) {
      margin-bottom: 16px;
    }
  }

  &-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &-submit {
    @include submit-button();
  }

  &-back {
    @include secondary-button();

    margin-right: 7px;
  }

  &-submit {
    @include submit-button();
  }

  @media all and (min-width: $xl) {
    width: 350px;
    margin: 0 auto;
  }
}

.get-code-btn {
  color: $color-primary;
  font-weight: 600;
  font-size: 14px;
  line-height: 22px;
  cursor: pointer;
}

.get-code-wait {
  font-weight: 600;
  font-size: 14px;
  line-height: 22px;
  color: $color-dark-20;
}
</style>
