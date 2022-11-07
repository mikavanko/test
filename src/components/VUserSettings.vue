<script setup>
import { reactive } from "vue";
import { useStore } from "vuex";
import Form from "@/components/VForm.vue";
import UploadImageAvatar from "@/components/VUploadImageAvatar.vue";
import Input from "@/components/VInput.vue";
import { reName, reNickname } from "@/assets/js/regex.js";
import ErrorAdapter from "@/adapters/Error";
import { useToast } from 'vue-toastification';
import { updateUserInfo, saveUserAvatar } from "@/api/userPersonal.js";
import { isMobile } from "@/assets/js/utils";
import { debounce } from "lodash";
import { validateUserData } from "@/api/auth";

import TickIcon from "@/assets/icons/svg/tick-circle.svg";

const store = useStore();

const props = defineProps({
  user: {
    type: Object,
    default: () => {},
  },
  useFormBottom: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["submit-success", "cancel"]);

const toast = useToast();

const oldData = {
  name: props.user.name,
  nickname: props.user.nickname,
}

const state = reactive({
  form: null,
  inputs: {
    avatar: {
      name: "avatar",
      imgUrl: props.user?.avatar?.originalUrl,
      value: null,
      title: "Аватар",
      buttonText: "Загрузить",
      required: false,
    },
    name: {
      name: "name",
      value: props.user.name,
      type: "text",
      label: " Ваше имя",
      placeholder: "",
      errorText: "Имя введено неверно",
      successText: "Имя успешно изменено",
      hintErrorText: `Вы не можете использовать цифры и латинский алфавит
      Проверьте данные и введите имя, используя только кириллицу`,
      hintErrorTextWidth: "204px",
      rules: [
        {
          validator: (val) => !val.length,
        },
        {
          validator: (val) => !reName.test(val),
        },
      ],
    },
    nickname: {
      name: "nickname",
      value: props.user.nickname,
      type: "text",
      label: " Ваш никнейм",
      placeholder: "",
      errorText: "Никнейм введен неверно",
      successText: "Никнейм успешно изменен",
      hasError: false,
      rules: [
        {
          validator: (val) => !val.length,
        },
        {
          validator: (val) => !reNickname.test(val),
        },
      ],
    },
  },
  isNicknameExist: false,
  isNicknameOk: false,
});

const onInputNickname = debounce((val) => {

  state.isNicknameExist = false;
  state.inputs.nickname.hasError = false;
  state.isNicknameOk = false;

  if (props.user?.nickname === val) return;

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

const onSubmit = ({ errors, values }) => {
  for (const error of errors) {
    toast.error(error.errorText)
  }

  if (!errors.length) {
    const data = {
      ...values.reduce((obj, item) => ((obj[item.name] = item.value), obj), {}),
    };

    const userInfoData = {
      name: data.name,
      nickname: data.nickname,
    };

    var avatarFormData = new FormData();
    avatarFormData.append("avatar", data.avatar);

    Promise.all([
      updateUserInfo(userInfoData),
      ...(data.avatar ? [saveUserAvatar(avatarFormData)] : []),
    ])
      .then(() => {
        store.dispatch("auth/getUser").then(() => {
          emit("submit-success");
        });

        for(const key in userInfoData){
          if(userInfoData[key] !== oldData[key]){
            toast.success(state.inputs[key].successText)
            oldData[key] = userInfoData[key]
          }
        }
      })
      .catch((err) => {
        const error = ErrorAdapter(err);

        toast.error(error.message)
      });
  }
};

defineExpose({
  submit: onSubmit,
});
</script>

<template>
  <Form
    class="form"
    @submit="onSubmit"
    :height="isMobile() ? '100%' : 'auto'"
    v-model="state.form"
  >
    <UploadImageAvatar v-bind="state.inputs.avatar" />
    <hr class="modal-hr" />
    <div class="modal-row-wrapper">
      <h3 class="modal-h3">Персональная информация</h3>
      <div class="modal-row">
        <h4 class="modal-h4">Электронная почта</h4>
        <div class="modal-value">
          <span class="modal-value-inner">{{ user.email }}</span>
          <div class="modal-value-btn" v-modal-open="'modal-email'">
            Изменить
          </div>
        </div>
      </div>
      <div class="modal-row">
        <h4 class="modal-h4">Номер телефона</h4>
        <div class="modal-value">
          <span class="modal-value-inner">{{ user.phone }}</span>
          <div class="modal-value-btn" v-modal-open="'modal-phone'">
            Изменить
          </div>
        </div>
      </div>
    </div>
    <div class="modal-row-wrapper">
      <div class="modal-row">
        <Input
          class="modal-input"
          :name="state.inputs.name.name"
          v-model:value="state.inputs.name.value"
          :type="state.inputs.name.type"
          :label="state.inputs.name.label"
          :error-text="state.inputs.name.errorText"
          :hint-error-text="state.inputs.name.hintErrorText"
          :hint-error-text-width="state.inputs.name.hintErrorTextWidth"
          :rules="state.inputs.name.rules"
          :width="isMobile() ? '100%' : '300px'"
        />
      </div>
      <div class="modal-row">
        <Input
          class="modal-input"
          :name="state.inputs.nickname.name"
          v-model:value="state.inputs.nickname.value"
          @update:value="onInputNickname"
          :type="state.inputs.nickname.type"
          :label="state.inputs.nickname.label"
          :error-text="state.inputs.nickname.errorText"
          :rules="state.inputs.nickname.rules"
          :hasError="state.inputs.nickname.hasError"
          :width="isMobile() ? '100%' : '300px'"
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
                v-else-if="state.isNicknameOk"
              >
                <TickIcon class="input-status__icon input-succes-icon" />
                Доступный
              </div>
            </div>
          </template>
        </Input>
      </div>
    </div>
    <hr class="modal-hr" />
    <h3 class="modal-h3">Пароль</h3>
    <div class="modal-help">
      Вы можете установить постоянный пароль, если не хотите использовать
      временные коды входа
    </div>
    <div class="modal-btn" v-modal-open="'modal-password'">Изменить пароль</div>

    <template #bottom v-if="useFormBottom">
      <div class="form-bottom">
        <div @click="$emit('cancel')" class="form-cancel">Отменить</div>
        <button type="submit" class="form-submit">Сохранить</button>
      </div>
    </template>
  </Form>
</template>

<style lang="scss" scoped>
.modal-h3 {
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
  margin-bottom: 8px;
  color: $color-dark-70;
}
.modal-h4 {
  font-weight: 400;
  font-size: 12px;
  line-height: 14px;
  margin-bottom: 2px;
  color: $color-dark-40;
}
.form-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.form-cancel {
  @include secondary-button(52px);

  margin-right: 7px;
}
.form-submit {
  @include submit-button(52px);
}
.modal-hr {
  width: 100%;
  height: 1px;
  background-color: $color-dark-10;
  border-radius: 10px;
  border: none;
  margin: 24px 0;
}

.modal-row {
  &:not(:last-child) {
    margin-bottom: 8px;
  }

  &-wrapper {
    &:not(:last-child) {
      margin-bottom: 16px;
    }
  }
}

.modal-value {
  display: flex;
  justify-content: flex-start;
  align-items: center;

  &-inner {
    font-weight: 400;
    font-size: 14px;
    line-height: 21px;
    color: $color-dark-70;

    &:not(:last-child) {
      margin-right: 9px;
    }
  }

  &-btn {
    @include clear-button();

    padding: 5px 13px;
    font-weight: 600;
    font-size: 12px;
    line-height: 16px;
    color: $color-dark-40;
  }
}
.modal-help {
  font-weight: 400;
  font-size: 12px;
  line-height: 14px;
  color: $color-dark-20;
  margin-bottom: 16px;
}
.modal-input {
  // @include clear-input;

  &:deep(.input) {
    height: 30px;
    line-height: 30px;
    padding: 0 8px;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    color: $color-dark-70;
    border-radius: 4px;
  }
  &:deep(.input-wrapper) {
    height: auto;
  }
  &:deep(.label) {
    font-weight: 400;
    font-size: 12px;
    line-height: 14px;
    margin-bottom: 2px;
    color: $color-dark-40;
  }
}

.modal-btn {
  @include clear-button();

  display: inline-block;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: $color-dark-70;
  padding: 5px 10px;
  border: 1px solid $color-dark-20;
  border-radius: 4px;
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