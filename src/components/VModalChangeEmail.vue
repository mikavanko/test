<script>
import { computed, reactive } from "vue";
import { useStore } from "vuex";
import Modal from "@/components/VModal.vue";
import Form from "@/components/VForm.vue";
import Input from "@/components/VInput.vue";
import SuccessInfo from "@/components/VSuccessInfo.vue";

import { reEmail } from "@/assets/js/regex.js";
import ErrorAdapter from "@/adapters/Error";
import { sendCode } from "@/api/auth";
import { useToast } from 'vue-toastification';
import { updateUserEmail } from "@/api/userPersonal.js";
import UserAdapter from "@/adapters/User";

import { isMobile } from "@/assets/js/utils";

const STEPS = {
  STEP1: 1,
  STEP2: 2,
};

export default {
  props: {
    user: {
      type: Object,
      default: () => {},
    },
  },
  setup(props) {
    const toast = useToast();
    const store = useStore();

    const oldEmail = computed(() => props.user?.email)

    const state = reactive({
      step: STEPS.STEP1,
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
          placeholder: "• • • •",
          errorText: "Неверный код",
          hasError: false,
          mask: "####",
          rules: [
            {
              validator: (val) => val.length !== 4,
            },
          ],
        },
        email: {
          name: "email",
          value: "",
          type: "text",
          label: "Новая электронная почта",
          placeholder: "newadress@mail.ru",
          errorText: "Неверный формат электронной почты",
          hasError: false,
          disabled: true,
          rules: [
            {
              validator: (val) => !reEmail.test(val),
            },
          ],
        },
        oldEmail: {
          // name: "email",
          value: oldEmail,
          type: "text",
          label: "Старая электронная почта",
          placeholder: "newadress@mail.ru",
          disabled: true,
          notUse: true,
        },
      },
      isModalVisible: false,
    });

    const getCode = () => {
      try {
        const data = {
          phone: props.user.phone,
        };

        sendCode(data)
          .then(() => {
            state.isCodeSent = true;

            timerToGetCode();
          })
          .catch((err) => {
            const error = ErrorAdapter(err);

            toast.error(error.message)
          });
      } catch (error) {
        toast.error(error.message)
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

    const onCodeInput = (val) => (state.form.email.disabled = val.length !== 4);
    const onEmailInput = (val) => (state.isDisabled = !reEmail.test(val));

    const onSubmit = ({ errors, values }) => {
      for (const error of errors) {
        toast.error(error.errorText)
      }

      if (!errors.length) {
        const data = {
          ...values.reduce(
            (obj, item) => ((obj[item.name] = item.value), obj),
            {}
          ),
        };

        updateUserEmail(data)
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

    const modalOpen = () =>{
      console.log('modalOpen')
    }

    return {
      onSubmit,
      onCodeInput,
      onEmailInput,
      getCode,
      modalOpen,
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
    id="modal-email"
    :title="'Смена почты'"
    v-model="state.isModalVisible"
    @modalOpen="modalOpen"
    :showModalTop="isMobile()"
    :width="isMobile() ? '100%' : '410px'"
    :height="isMobile() ? '100%' : 'auto'"
    :customBodyClass="isMobile() ? '' : 'desktop-body-class'"
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
          v-bind="state.form.oldEmail"
          height="40px"
        />

        <Input
          class="form-row"
          :name="state.form.code.name"
          v-model:value="state.form.code.value"
          @update:value="onCodeInput"
          :type="state.form.code.type"
          :label="state.form.code.label"
          :placeholder="state.form.code.placeholder"
          :error-text="state.form.code.errorText"
          :rules="state.form.code.rules"
          :mask="state.form.code.mask"
          height="40px"
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
          :name="state.form.email.name"
          v-model:value="state.form.email.value"
          @update:value="onEmailInput"
          :type="state.form.email.type"
          :label="state.form.email.label"
          :placeholder="state.form.email.placeholder"
          :error-text="state.form.email.errorText"
          v-model:has-error="state.form.email.hasError"
          :rules="state.form.email.rules"
          :disabled="state.form.email.disabled"
          height="40px"
        />
        <template #bottom>
          <div class="form-bottom">
            <div @click="state.isModalVisible = false" class="form-back">
              Назад
            </div>
            <button
              type="submit"
              class="form-submit"
              :disabled="state.isDisabled"
            >
              Подтвердить
            </button>
          </div>
        </template>
      </Form>
      <SuccessInfo
        v-if="state.step === STEPS.STEP2"
        :text="'Вы успешно обновили электронную почту'"
        @click="(state.isModalVisible = false), (state.step = STEPS.STEP1)"
      />
    </template>
  </Modal>
</template>

<style lang="scss" scoped>
:deep(.desktop-body-class){
  padding: 40px 55px;
}
.form-title{
  font-weight: 400;
  font-size: 24px;
  line-height: 120%;
  margin-bottom: 25px;
}
.form-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form {
  &-row {
    &:not(:last-child) {
      margin-bottom: 16px;
    }
  }

  &-submit {
    @include submit-button(40px);
  }

  &-back {
    @include secondary-button(40px);
    border-color: $color-dark-20;
    color: $color-dark-40;

    margin-right: 7px;
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