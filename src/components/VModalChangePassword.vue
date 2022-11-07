<script>
import { reactive, watch } from "vue";
import { useStore } from "vuex";
import Modal from "@/components/VModal.vue";
import Form from "@/components/VForm.vue";
import Input from "@/components/VInput.vue";
import SuccessInfo from "@/components/VSuccessInfo.vue";

import { rePassword } from "@/assets/js/regex.js";
import ErrorAdapter from "@/adapters/Error";
import { useToast } from 'vue-toastification';
import { updateUserPassword } from "@/api/userPersonal.js";
import PasswordSnakeAdapter from "@/adapters/PasswordSnake";
import UserAdapter from "@/adapters/User";
import { isMobile } from "@/assets/js/utils";

const STEPS = {
  STEP1: 1,
  STEP2: 2,
};

export default {
  setup() {
    const toast = useToast();
    const store = useStore();

    const state = reactive({
      step: STEPS.STEP1,
      isDisabled: true,
      form: {
        oldPassword: {
          name: "oldPassword",
          label: "Старый пароль",
          value: "",
          type: "password",
          placeholder: "••••••••",
          hasError: false,
          errorText: "Неверный пароль",
          hintErrorText: `Неверный старый пароль`,
          hintErrorTextWidth: "98px",
          rules: [
            {
              validator: (val) => !rePassword.test(val),
            },
          ],
        },
        password: {
          name: "password",
          label: "Новый пароль",
          value: "",
          type: "password",
          placeholder: "••••••••",
          hasError: false,
          errorText:
            "Пароль должен содержать хотя бы: <br>1 пропискую букву,<br> 1 строчкую букву, <br>1 цифру, <br>1 спец. символ, <br>длина не менее 8 символов",
          hintErrorText: `&bull; Минимум 8 символов
          &bull; Не менее 1 цифры 
          &bull; Хотя бы 1 сивол в верхнем регистре
          &bull; Хотя бы 1 строчная буква 
          &bull; Использование спец. символа `,
          hintErrorTextWidth: "235px",
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
          hintErrorText: `Неверное подтверждения пароля`,
          hintErrorTextWidth: "147px",
          rules: [
            {
              validator: (val) => state.form.password.value !== val,
            },
          ],
        },
      },
      isModalVisible: false,
    });

    watch(
      () => state.form,
      (form) => {
        const oldPassword = form.oldPassword.value;
        const password = form.password.value;
        const rPassword = form.passwordConfirmation.value;

        state.isDisabled = !(
          oldPassword.length !== 0 &&
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
        const data = {
          ...PasswordSnakeAdapter(
            values.reduce(
              (obj, item) => ((obj[item.name] = item.value), obj),
              {}
            )
          ),
        };

        updateUserPassword(data)
          .then((res) => {
            store.commit("auth/setUser", UserAdapter(res.data.data));

            state.step = STEPS.STEP2;
          })
          .catch((err) => {
            const error = ErrorAdapter(err);

            toast.error(error.message)
          });
      }
    };

    return {
      onSubmit,
      state,
      STEPS,
      isMobile,
    };
  },
  components: {
    Form,
    Input,
    Modal,
    SuccessInfo,
  },
};
</script>

<template>
  <Modal
    id="modal-password"
    :title="'Смена пароля'"
    v-model="state.isModalVisible"
    :showModalTop="isMobile()"
    :width="isMobile() ? '100%' : '410px'"
    :height="isMobile() ? '100%' : 'auto'"
    :customBodyClass="isMobile() ? '' : 'desktop-body-class'"
    :useScroll="false"
  >
    <template #body="item">
      <h3 class="form-title" v-if="!isMobile()">{{item.title}}</h3>
      <Form
        class="form"
        @submit="onSubmit"
        v-if="state.step === STEPS.STEP1"
        :height="isMobile() ? '100%' : 'auto'"
      >
        <Input
          class="form-row"
          :name="state.form.oldPassword.name"
          v-model:value="state.form.oldPassword.value"
          :type="state.form.oldPassword.type"
          :label="state.form.oldPassword.label"
          :placeholder="state.form.oldPassword.placeholder"
          :error-text="state.form.oldPassword.errorText"
          :hintErrorText="state.form.oldPassword.hintErrorText"
          :hintErrorTextWidth="state.form.oldPassword.hintErrorTextWidth"
          v-model:has-error="state.form.oldPassword.hasError"
          :rules="state.form.oldPassword.rules"
          height="40px"
        />
        <Input
          class="form-row"
          :name="state.form.password.name"
          v-model:value="state.form.password.value"
          :type="state.form.password.type"
          :label="state.form.password.label"
          :placeholder="state.form.password.placeholder"
          :error-text="state.form.password.errorText"
          :hintErrorText="state.form.password.hintErrorText"
          :hintErrorTextWidth="state.form.password.hintErrorTextWidth"
          v-model:has-error="state.form.password.hasError"
          :rules="state.form.password.rules"
          height="40px"
        />
        <Input
          class="form-row"
          :name="state.form.passwordConfirmation.name"
          v-model:value="state.form.passwordConfirmation.value"
          :type="state.form.passwordConfirmation.type"
          :label="state.form.passwordConfirmation.label"
          :placeholder="state.form.passwordConfirmation.placeholder"
          :error-text="state.form.passwordConfirmation.errorText"
          :hintErrorText="state.form.passwordConfirmation.hintErrorText"
          :hintErrorTextWidth="state.form.passwordConfirmation.hintErrorTextWidth"
          :rules="state.form.passwordConfirmation.rules"
          v-model:has-error="state.form.passwordConfirmation.hasError"
          height="40px"
        />
        <template #bottom>
          <div class="form-bottom">
            <div @click="state.isModalVisible = false" class="form-back">
              Отменить
            </div>
            <button
              type="submit"
              class="form-submit"
              :disabled="state.isDisabled"
            >
              Сменить
            </button>
          </div>
        </template>
      </Form>
      <SuccessInfo
        v-if="state.step === STEPS.STEP2"
        :text="'Вы успешно обновили пароль'"
        @click="(state.isModalVisible = false), (state.step = STEPS.STEP1)"
      />
    </template>
  </Modal>
</template>

<style lang="scss" scoped>
.form-title{
  font-weight: 400;
  font-size: 24px;
  line-height: 120%;
  margin-bottom: 25px;
}
:deep(.desktop-body-class){
  padding: 40px 55px;
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
    @include secondary-button(40px);
    border-color: $color-dark-20;
    color: $color-dark-40;

    margin-right: 7px;
  }

  &-submit {
    @include submit-button(40px);
  }
}
</style>