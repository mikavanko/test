<script setup>
import { reactive } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { useToast } from 'vue-toastification';

import { reEmail, reName, reNickname, rePhone } from "@/assets/js/regex.js";

import Form from "@/components/VForm.vue";
import Input from "@/components/VInput.vue";

import { isMobile } from "@/assets/js/utils";
import { debounce } from "lodash";

import ErrorAdapter from "@/adapters/Error";
import { validateUserData } from "@/api/auth";

import TickIcon from "@/assets/icons/svg/tick-circle.svg";

const router = useRouter();
const store = useStore();
const toast = useToast();

const state = reactive({
  isDisabled: false,
  form: null,
  inputs: {
    name: {
      name: "name",
      value: "",
      type: "text",
      label: "Имя",
      placeholder: "Имя",
      errorText: "Заполните поле Имя",
      rules: [
        {
          validator: (val) => !reName.test(val) || !val.length,
        },
      ],
    },
    nickname: {
      name: "nickname",
      value: "",
      type: "text",
      label: "Ваш никнейм",
      placeholder: "Rari",
      errorText: "Заполните поле Никнейм",
      hasError: false,
      rules: [
        {
          validator: (val) => !reNickname.test(val) || !val.length,
        },
      ],
    },
    phone: {
      name: "phone",
      value: "",
      type: "tel",
      label: "Номер телефона",
      info: "Для восстановления пароля введите телефон",
      placeholder: "+79161234567",
      errorText: "Неверный формат номера телефона",
      hasError: false,
      mask: "+7##########",
      rules: [
        {
          validator: (val) => !rePhone.test(val),
        },
      ],
    },
    email: {
      name: "email",
      value: "",
      type: "text",
      label: "Элетронная почта",
      placeholder: "example@gmail.com",
      errorText: "Неверный формат электронной почты",
      hasError: false,
      rules: [
        {
          validator: (val) => !reEmail.test(val),
        },
      ],
    },
  },
  isNicknameExist: false,
  isNicknameOk: false,
  isEmailExist: false,
  isEmailOk: false,
});

const onInputNickname = debounce((val) => {
  state.isNicknameExist = false;
  state.inputs.nickname.hasError = false;
  state.isNicknameOk = false;

  const nicknameInput = state.form.find(
    (el) => el.name === state.inputs.nickname.name
  );
  const nicknameErr = nicknameInput.validate();

  if (!nicknameErr.hasError) {
    validateUserData({ nickname: val })
      .then(() => {
        state.isNicknameOk = true;
      })
      .catch(() => {
        // const error = ErrorAdapter(err);

        state.isNicknameExist = true;
        state.inputs.nickname.hasError = true;
      });
  }
}, 500);

const onInputEmail = debounce((val) => {
  state.isEmailExist = false;
  state.inputs.email.hasError = false;
  state.isEmailOk = false;

  const emailInput = state.form.find(
    (el) => el.name === state.inputs.email.name
  );
  const emailErr = emailInput.validate();

  if (!emailErr.hasError) {
    validateUserData({ email: val })
      .then(() => {
        state.isEmailOk = true;
      })
      .catch(() => {
        // const error = ErrorAdapter(err);

        state.isEmailExist = true;
        state.inputs.email.hasError = true;
      });
  }
}, 500);

const onSubmit = ({ errors, values }) => {
  for (const error of errors) {
    toast.error(error.errorText)
  }

  if (!errors.length) {
    const data = {
      ...values.reduce((obj, item) => ((obj[item.name] = item.value), obj), {}),
    };

    validateUserData(data)
      .then(() => {
        store.dispatch("registration/setParams", data);
        router.push({ path: "/registration/setpassword" });
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
        <span class="registration-step__value">01</span>
        <span class="registration-step__slash">/</span>
        <span class="registration-step__amount">04</span>
      </div>
    </div>

    <Form class="form" @submit="onSubmit" v-model="state.form">
      <Input
        :name="state.inputs.name.name"
        v-model:value="state.inputs.name.value"
        class="form-row"
        :type="state.inputs.name.type"
        :label="state.inputs.name.label"
        :placeholder="state.inputs.name.placeholder"
        :rules="state.inputs.name.rules"
        :errorText="state.inputs.name.errorText"
      />
      <Input
        :name="state.inputs.nickname.name"
        v-model:value="state.inputs.nickname.value"
        class="form-row"
        @update:value="onInputNickname"
        :type="state.inputs.nickname.type"
        :label="state.inputs.nickname.label"
        :placeholder="state.inputs.nickname.placeholder"
        :has-error="state.inputs.nickname.hasError"
        :rules="state.inputs.nickname.rules"
        :errorText="state.inputs.nickname.errorText"
      >
        <template #suffixIcon v-if="state.isNicknameOk && isMobile()">
          <TickIcon class="input-succes-icon" />
        </template>
        <template #outsideContentRight v-if="!isMobile()">
          <div class="input-status">
            <div
              class="input-status__item input-status_error"
              v-if="state.isNicknameExist"
            >
              Недоступный
            </div>
            <div
              class="input-status__item input-status_success"
              v-if="state.isNicknameOk"
            >
              <TickIcon class="input-status__icon input-succes-icon" />
              Доступный
            </div>
          </div>
        </template>
      </Input>
      <Input
        class="form-row"
        :ref="state.inputs.phone.name"
        :name="state.inputs.phone.name"
        v-model:value="state.inputs.phone.value"
        :type="state.inputs.phone.type"
        :label="state.inputs.phone.label"
        :placeholder="state.inputs.phone.placeholder"
        :error-text="state.inputs.phone.errorText"
        v-model:has-error="state.inputs.phone.hasError"
        :rules="state.inputs.phone.rules"
        :mask="state.inputs.phone.mask"
      />
      <Input
        :name="state.inputs.email.name"
        class="form-row"
        v-model:value="state.inputs.email.value"
        @update:value="onInputEmail"
        :type="state.inputs.email.type"
        :label="state.inputs.email.label"
        :placeholder="state.inputs.email.placeholder"
        :has-error="state.inputs.email.hasError"
        :rules="state.inputs.email.rules"
        :errorText="state.inputs.email.errorText"
      >
        <template #suffixIcon v-if="state.isEmailOk && isMobile()">
          <TickIcon class="input-succes-icon" />
        </template>
        <template #outsideContentRight v-if="!isMobile()">
          <div class="input-status">
            <div
              class="input-status__item input-status_error"
              v-if="state.isEmailExist"
            >
              Данная почта уже используется
            </div>
            <div
              class="input-status__item input-status_success"
              v-if="state.isEmailOk"
            >
              <TickIcon class="input-status__icon input-succes-icon" />
              Доступна
            </div>
          </div>
        </template>
      </Input>

      <template #bottom>
        <button type="submit" class="form-submit" :disabled="state.isDisabled">
          Далее
        </button>
        <div v-if="isMobile()" @click="$router.go(-1)" class="form-back">
          Вернуться назад
        </div>
        <div v-else class="form-bottom-text">
          У вас уже есть аккаунт?
          <RouterLink to="/auth">Войти</RouterLink>
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
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  height: 100%;

  &-row {
    position: relative;

    &:not(:last-child) {
      margin-bottom: 16px;
    }
  }

  &-body {
    flex-grow: 1;
    padding-bottom: 24px;
  }

  &-submit {
    @include submit-button();

    @media all and (min-width: $xl) {
      margin-top: 6px;
    }
  }

  &-back {
    @include secondary-button();

    margin-top: 8px;
  }

  &-bottom {
    &-text {
      text-align: center;
      color: $color-dark-20;
      font-weight: 400;
      font-size: 14px;
      line-height: 19px;
      margin-top: 15px;
    }
  }

  @media all and (min-width: $xl) {
    width: 350px;
    margin: 0 auto;
  }
}

.input-status {
  white-space: nowrap;

  &__item {
    font-weight: 400;
    font-size: 12px;
    line-height: 20px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
  }

  &__icon {
    margin-right: 5px;
  }

  &_success {
    padding-left: 10px;
    color: $color-success;
  }
  &_error {
    color: $color-error;
  }
}

.input-succes-icon {
  color: $color-success;
}
.input-error-icon {
  color: $color-error;
}
</style>
