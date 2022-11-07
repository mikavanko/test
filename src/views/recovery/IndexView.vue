<script>
import { reactive, ref, computed } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { useToast } from 'vue-toastification';

import Form from "@/components/VForm.vue";
import Input from "@/components/VInput.vue";

import { rePhone } from "@/assets/js/regex.js";
import ErrorAdapter from "@/adapters/Error";
import { sendCode } from "@/api/auth";

export default {
  setup() {
    const toast = useToast();
    const router = useRouter();
    const store = useStore();

    const state = reactive({
      isDisabled: true,
      isCodeSent: false,
      intervalId: null,
      timeToGetCode: 0,
      phoneToVerify: null,
      form: {
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
        code: {
          name: "code",
          value: "",
          type: "tel",
          label: "Код подтверждения",
          info: "Введите 4-значный код, отправленный на 915***1515",
          placeholder: "• • • •",
          hasError: false,
          disabled: true,
          mask: "####",
          rules: [
            {
              validator: (val) => val.length === 4,
            },
          ],
        },
      },
    });

    const codeInfo = computed(
      () =>
        `Введите 4-значный код ${
          state.form.phone.value.length
            ? ", отправленный на " + state.form.phone.value
            : ""
        }`
    );

    const phone = ref(null);

    const getCode = () => {
      const error = phone.value.validate();

      if (!error.hasError) {
        const data = {
          phone: state.form.phone.value,
        };

        sendCode(data)
          .then(() => {
            state.isCodeSent = true;
            state.form.code.disabled = false;
            state.phoneToVerify = data.phone;

            timerToGetCode();
          })
          .catch((err) => {
            const error = ErrorAdapter(err);

            toast.error(error.message)
          });
      } else {
        toast.error(error.errorText)
      }
    };

    const timerToGetCode = () => {
      state.timeToGetCode = 30;
      state.intervalId = setInterval(() => {
        if (state.timeToGetCode === 0) {
          state.isCodeSent = false;
          clearInterval(state.intervalId);
        } else {
          state.timeToGetCode--;
        }
      }, 1000);
    };

    const onCodeInput = (val) => (state.isDisabled = val.length !== 4);

    const onSubmit = (/*{ errors, values }*/) => {
      const data = {
        phone: state.phoneToVerify,
        code: state.form.code.value,
      };

      store
        .dispatch("auth/verifyCode", data)
        .then(() => {
          router.push({ path: "/recovery/setpassword" });
        })
        .catch((err) => {
          const error = ErrorAdapter(err);

          state.form.code.hasError = true;

          toast.error(error.message)
        });
    };

    return {
      phone,
      onSubmit,
      onCodeInput,
      getCode,
      codeInfo,
      state,
    };
  },
  components: {
    Form,
    Input,
  },
};
</script>

<template>
  <div class="recovery-page">
    <h2 class="h2">Восстановление</h2>

    <Form class="form" @submit="onSubmit">
      <Input
        class="form-row"
        :ref="state.form.phone.name"
        :name="state.form.phone.name"
        v-model:value="state.form.phone.value"
        :type="state.form.phone.type"
        :label="state.form.phone.label"
        :info="state.form.phone.info"
        :placeholder="state.form.phone.placeholder"
        :error-text="state.form.phone.errorText"
        v-model:has-error="state.form.phone.hasError"
        :rules="state.form.phone.rules"
        :mask="state.form.phone.mask"
      >
        <template #suffixIcon>
          <div v-if="!state.isCodeSent" class="get-code-btn" @click="getCode">
            Получить код
          </div>
          <div v-else class="get-code-wait">
            Получить код через {{ state.timeToGetCode }}с
          </div>
        </template>
      </Input>
      <Input
        class="form-row"
        :name="state.form.code.name"
        v-model:value="state.form.code.value"
        @update:value="onCodeInput"
        :type="state.form.code.type"
        :label="state.form.code.label"
        :info="codeInfo"
        :placeholder="state.form.code.placeholder"
        v-model:has-error="state.form.code.hasError"
        :disabled="state.form.code.disabled"
        :mask="state.form.code.mask"
      />
      <template #bottom>
        <button type="submit" class="form-submit" :disabled="state.isDisabled">
          Восстановить
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
