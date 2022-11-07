<script setup>
import { reactive } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { useToast } from 'vue-toastification';
import ErrorAdapter from "@/adapters/Error";
import { sendCode } from "@/api/auth";

import Input from "@/components/VInput.vue";
import Form from "@/components/VForm.vue";
import GetCodeBtn from "@/components/VGetCodeBtn.vue";

const store = useStore();
const router = useRouter();

const user = store.getters["auth/getUser"];

const toast = useToast();

const state = reactive({
  isDisabled: true,
  isCodeSent: false,
  intervalId: null,
  timeToGetCode: 0,
  form: {
    code: {
      name: "code",
      value: "",
      errorText: "Неверный код подтверждения",
      type: "tel",
      label: "Код подтверждения",
      info: `Введите код, отправленный через Telegram`,
      placeholder: "• • • •",
      hasError: false,
      mask: "####",
    },
  },
});

const getCode = async () => {
  const data = {
    phone: user.phone,
  };

  return sendCode(data)
};

const onCodeInput = (val) => (state.isDisabled = val.length !== 4);

const onSubmit = ({ values }) => {
  const data = {
    ...values.reduce((obj, item) => ((obj[item.name] = item.value), obj), {}),
    phone: user.phone,
  };

  store.dispatch("auth/loginByPhone", data).then((res) => {
    const error = ErrorAdapter(res.error);

    if (error) {
      toast.error(error.message)
    } else {
      router.push({ path: "/" });
    }
  });
};
</script>

<template>
  <div class="check-page">
    <h2 class="h2">Проверка безопасности</h2>

    <Form class="form" @submit="onSubmit">
      <Input
        :ref="state.form.code.name"
        :name="state.form.code.name"
        v-model:value="state.form.code.value"
        @update:value="onCodeInput"
        :type="state.form.code.type"
        :label="state.form.code.label"
        :info="state.form.code.info"
        :placeholder="state.form.code.placeholder"
        v-model:has-error="state.form.code.hasError"
        :mask="state.form.code.mask"
      >
        <template #suffixIcon>
          <GetCodeBtn :callback="getCode" sendCode />
        </template>
      </Input>
      <template #bottom>
        <button type="submit" class="form-submit" :disabled="state.isDisabled">
          Войти
        </button>
      </template>
    </Form>
  </div>
</template>

<style lang="scss" scoped>
.check-page {
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
    line-height: 43px;
    margin-bottom: 46px;
    text-align: center;
  }
}

.form {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  height: 100%;

  @media all and (min-width: $xl) {
    width: 350px;
    margin: 0 auto;
  }

  &-body {
    flex-grow: 1;
    padding-bottom: 24px;

    @media all and (min-width: $xl) {
      flex-grow: 0;
    }
  }

  &-submit {
    @include submit-button();
  }
}
</style>
