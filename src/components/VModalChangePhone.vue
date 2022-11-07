<script>
import { computed, reactive, ref } from "vue";
import { useStore } from "vuex";
import Modal from "@/components/VModal.vue";
import Form from "@/components/VForm.vue";
import Input from "@/components/VInput.vue";
import SuccessInfo from "@/components/VSuccessInfo.vue";
import GetCodeBtn from "@/components/VGetCodeBtn.vue";

import { rePhone } from "@/assets/js/regex.js";
import ErrorAdapter from "@/adapters/Error";
import { sendCode, verifyCode } from "@/api/auth";
import { useToast } from 'vue-toastification';
import { updateUserPhone } from "@/api/userPersonal.js";
import UserAdapter from "@/adapters/User";
import PhoneSnakeAdapter from "@/adapters/PhoneSnake";
import { debounce } from "lodash";
import { isMobile, maskPhone } from "@/assets/js/utils";

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

    const oldPhoneCodeInfo = computed(() => `Введите 4-значный код, отправленный на ${maskPhone(props.user?.phone)}`)
    const phoneInfo = computed(() => `Введите 4-значный код, отправленный на ${maskPhone(state.form.phone?.value)}`)

    const state = reactive({
      step: STEPS.STEP1,
      isDisabled: true,
      newPhone: "",
      form: {
        oldPhoneCode: {
          name: "oldPhoneCode",
          value: "",
          type: "tel",
          label: "Код подтверждения",
          info: oldPhoneCodeInfo,
          placeholder: "• • • •",
          errorText: "Неверный код",
          hasError: false,
          hintErrorText: `Неверный код подтверждения`,
          hintErrorTextWidth: "105px",
          mask: "####",
          readonly: false,
          rules: [
            {
              validator: (val) => val.length !== 4,
            },
          ],
        },
        phone: {
          name: "phone",
          value: "",
          type: "tel",
          label: "Номер телефона",
          placeholder: "+79161234567",
          errorText: "Неверный формат номера телефона",
          hasError: false,
          hintErrorText: ``,
          hintErrorTextWidth: "",
          mask: "+7##########",
          disabled: true,
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
          info: phoneInfo,
          placeholder: "• • • •",
          errorText: "Неверный код",
          hasError: false,
          hintErrorText: `Неверный код подтверждения `,
          hintErrorTextWidth: "105px",
          mask: "####",
          readonly: false,
          disabled: true,
          rules: [
            {
              validator: (val) => val.length !== 4,
            },
          ],
        },
      },
      isModalVisible: false,
    });

    const getCodeOldPhone = async () => {
      const data = {
        phone: props.user.phone,
      };

      return await sendCode(data);
    };

    const phone = ref(null);

    const getCodeNewPhone = async () => {
      const error = phone.value.validate();

      if (!error.hasError) {
        const data = {
          phone: state.form.phone.value,
        };

        return await sendCode(data).then((res) => {
          state.newPhone = data.phone;
          state.form.code.disabled = false;

          return res;
        });
      } else {
        toast.error(error.errorText)
      }
    };

    const onOldCodeInput = debounce((val) => {
      if (val.length === 4) {
        state.form.oldPhoneCode.readonly = true;

        const data = {
          phone: props.user.phone,
          code: val,
        };

        verifyCode(data)
          .then(() => {
            state.form.phone.disabled = false;
          })
          .catch((err) => {
            state.form.oldPhoneCode.readonly = false;
            state.form.oldPhoneCode.hasError = true;

            const error = ErrorAdapter(err);
            toast.error(error.message)
          });
      }
    }, 500);

    const onNewCodeInput = debounce((val) => {
      if (val.length === 4) {
        state.form.code.readonly = true;

        const data = {
          phone: state.newPhone,
          code: val,
        };

        verifyCode(data)
          .then(() => {
            state.isDisabled = false;
          })
          .catch((err) => {
            state.form.code.readonly = false;
            state.form.code.hasError = true;

            const error = ErrorAdapter(err);

            toast.error(error.message)
          });
      }
    }, 500);

    const onSubmit = ({ errors, values }) => {
      for (const error of errors) {
        toast.error(error.errorText)
      }

      if (!errors.length) {
        const data = {
          ...PhoneSnakeAdapter(
            values.reduce(
              (obj, item) => ((obj[item.name] = item.value), obj),
              {}
            )
          ),
        };

        updateUserPhone(data)
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
      onOldCodeInput,
      onNewCodeInput,
      getCodeOldPhone,
      getCodeNewPhone,
      modalOpen,
      state,
      STEPS,
      phone,
      isMobile,
    };
  },
  components: {
    Form,
    Input,
    Modal,
    SuccessInfo,
    GetCodeBtn,
  },
};
</script>

<template>
  <Modal
    id="modal-phone"
    :title="'Смена телефона'"
    v-model="state.isModalVisible"
    @modalOpen="modalOpen"
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
          :name="state.form.oldPhoneCode.name"
          v-model:value="state.form.oldPhoneCode.value"
          @update:value="onOldCodeInput"
          :type="state.form.oldPhoneCode.type"
          :label="state.form.oldPhoneCode.label"
          :info="state.form.oldPhoneCode.info"
          infoFontSize="10px"
          :placeholder="state.form.oldPhoneCode.placeholder"
          v-model:has-error="state.form.oldPhoneCode.hasError"
          :error-text="state.form.oldPhoneCode.errorText"
          :hintErrorText="state.form.oldPhoneCode.hintErrorText"
          :hintErrorTextWidth="state.form.oldPhoneCode.hintErrorTextWidth"
          :rules="state.form.oldPhoneCode.rules"
          :mask="state.form.oldPhoneCode.mask"
          :readonly="state.form.oldPhoneCode.readonly"
          height="40px"
        >
          <template #suffixIcon>
            <GetCodeBtn
              :callback="getCodeOldPhone"
            />
          </template>
        </Input>
        <Input
          class="form-row"
          :ref="state.form.phone.name"
          :name="state.form.phone.name"
          v-model:value="state.form.phone.value"
          :type="state.form.phone.type"
          :label="state.form.phone.label"
          :info="state.form.phone.info"
          infoFontSize="10px"
          :placeholder="state.form.phone.placeholder"
          :error-text="state.form.phone.errorText"
          :hintErrorText="state.form.phone.hintErrorText"
          :hintErrorTextWidth="state.form.phone.hintErrorTextWidth"
          v-model:has-error="state.form.phone.hasError"
          :disabled="state.form.phone.disabled"
          :rules="state.form.phone.rules"
          :mask="state.form.phone.mask"
          height="40px"
        >
          <template #suffixIcon>
            <GetCodeBtn
              :callback="getCodeNewPhone"
              :disabled="state.form.phone.disabled"
            />
          </template>
        </Input>
        <Input
          class="form-row"
          :name="state.form.code.name"
          v-model:value="state.form.code.value"
          @update:value="onNewCodeInput"
          :type="state.form.code.type"
          :label="state.form.code.label"
          :info="state.form.code.info"
          infoFontSize="10px"
          :placeholder="state.form.code.placeholder"
          :error-text="state.form.code.errorText"
          :hintErrorText="state.form.code.hintErrorText"
          :hintErrorTextWidth="state.form.code.hintErrorTextWidth"
          v-model:has-error="state.form.code.hasError"
          :disabled="state.form.code.disabled"
          :rules="state.form.code.rules"
          :mask="state.form.code.mask"
          :readonly="state.form.code.readonly"
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
        :text="'Вы успешно обновили <br>номер телефона'"
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
</style>