<script>
import { reactive, ref, computed } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { useToast } from 'vue-toastification';

import Form from "@/components/VForm.vue";
import Input from "@/components/VInput.vue";

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
    const user = store.getters['auth/getUser'];

    const getCode = () => {
      const phone = user?.phone;

      if (phone) {
        sendCode({ phone })
          .then(() => {
            state.isCodeSent = true;
            state.form.code.disabled = false;

            timerToGetCode();
          })
          .catch((err) => {
            const error = ErrorAdapter(err);

            toast.error(error.message)
          });
      } else {
        // toast.error(error.errorText)
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
        .dispatch("registration/telegramBindUser", { code: data.code, phone: user.phone })
        .then(() => {
          router.push({ path: "/registration/telegram-success" });
        })
        .catch((err) => {
          const error = ErrorAdapter(err);
          state.form.code.hasError = true;

          toast.error(error.message)
        });
    };

    function openTg() {
      window.open('https://telegram.me/test_bot', '_target');
    }

    return {
      phone,
      onSubmit,
      onCodeInput,
      getCode,
      state,
      openTg,
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
      <h2 class="h2">Завершить регистрацию</h2>
    </div>

    <Form class="form" @submit="onSubmit">
      <p class="form-text">
        Вы не закончили регистрацию!<br />
        Для дальнейшей работы с test,
        необходимо подтвердите ваш Telegram
      </p>

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
        <div class="get-code-btn" @click="openTg">
          Привязать Telegram
        </div>
      </template>
      </Input>
      <template #bottom>
        <div class="form-bottom">
          <button type="submit" class="form-submit" :disabled="state.isDisabled">
            Завершить
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
  &-text{
    font-weight: 400;
    font-size: 16px;
    line-height: 22px;
    margin-bottom: 25px;
  }
  
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
