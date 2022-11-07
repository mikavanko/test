<script>
import { reactive, ref, computed } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { useToast } from 'vue-toastification';

import Form from "@/components/VForm.vue";
import Input from "@/components/VInput.vue";

import { rePhone } from "@/assets/js/regex.js";
import ErrorAdapter from "@/adapters/Error";
import { sendCode, telegramBindUser } from "@/api/auth";

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
        code: {
          name: "code",
          value: "",
          type: "tel",
          label: "Код подтверждения",
          info: "Введите код, отправленный через Telegram",
          placeholder: "• • • - • • •",
          hasError: false,
          disabled: true,
          mask: "###-###",
          rules: [
            {
              validator: (val) => val.length === 7,
            },
          ],
        },
      },
    });

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
      state.timeToGetCode = 120;
      state.intervalId = setInterval(() => {
        if (state.timeToGetCode === 0) {
          state.isCodeSent = false;
          clearInterval(state.intervalId);
        } else {
          state.timeToGetCode--;
        }
      }, 1000);
    };

    const onCodeInput = (val) => (state.isDisabled = val.length !== 7);

    const onSubmit = ({ values }) => {
      const data = {
        ...values.reduce(
          (obj, item) => ((obj[item.name] = item.value), obj),
          {}
        ),
        ...store.getters["registration/getParams"],
      };
      
      store
        .dispatch("registration/telegramBindUser", { code: data.code, phone: data.phone })
        .then(() => {
          router.push({ path: "/registration/telegram-success" });
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
  <div class="registration-page">
    <div class="h2-wrapper">
      <h2 class="h2">Регистрация</h2>
      <div class="registration-step">
        <span class="registration-step__value">04</span>
        <span class="registration-step__slash">/</span>
        <span class="registration-step__amount">04</span>
      </div>
    </div>

    <Form class="form" @submit="onSubmit">
      <Input
        class="form-row"
        v-model:has-error="state.form.code.hasError"
        v-model:value="state.form.code.value"
        :name="state.form.code.name"
        :type="state.form.code.type"
        :label="state.form.code.label"
        :info="state.form.code.info"
        :placeholder="state.form.code.placeholder"
        :mask="state.form.code.mask"
        @update:value="onCodeInput"
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
      <template #bottom>
        <div class="form-bottom">
          <div @click="$router.go(-1)" class="form-back">Назад</div>
          <button type="submit" class="form-submit" :disabled="state.isDisabled">
            Подтвердить
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
