<script>
import { reactive, computed, ref } from "vue";
import { useStore } from "vuex";
import { isMobile } from "@/assets/js/utils";
import Form from "@/components/VForm.vue";
import Input from "@/components/VInput.vue";
import UploadImageAvatar from "@/components/VUploadImageAvatar.vue";

export default {
  components: {
    Form,
    Input,
    UploadImageAvatar
  },
  props: {
    desktop: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const store = useStore();

    const currentProject = computed(
      () => store.getters["projects/getCurrentProject"]
    );

    const letter = computed(() => currentProject.value.name[0])

    const state = reactive({
      form: null,
      inputs: {
        name: {
          name: "name",
          value: currentProject.value.name,
          type: "text",
          label: "Название",
          placeholder: "",
          errorText: "Название введено неверно",
          successText: "Название успешно изменено",
          rules: [
            {
              validator: (val) => !val.length,
            },
            // {
            //   validator: (val) => !reName.test(val),
            // },
          ],
        },
        avatar: {
          name: "avatar",
          imgUrl: currentProject.value.avatar?.originalUrl,
          value: null,
          title: "Логотип",
          buttonText: "Загрузить",
          required: false,
          showButtonIfImgPicked: true,
        },
      },
    });

    const onSubmit = ({ errors, values }) => {
      console.log('errors', errors, values)
      // for (const error of errors) {
      //   toast.error(error.errorText)
      // }

      // if (!errors.length) {
      //   const data = {
      //     ...values.reduce((obj, item) => ((obj[item.name] = item.value), obj), {}),
      //   };

      //   const userInfoData = {
      //     name: data.name,
      //     nickname: data.nickname,
      //   };

      //   var avatarFormData = new FormData();
      //   avatarFormData.append("avatar", data.avatar);
      // }
    }

    return {
      state,
      onSubmit,
      isMobile,
      letter,
    };
  },
};
</script>

<template>
  <Form
    class="form"
    @submit="onSubmit"
    :height="isMobile() ? '100%' : 'auto'"
    v-model="state.form"
  >
    <h2 class="v-h2" v-if="desktop">Настройки проекта</h2>
    <div class="form-block">
      <div class="v-h3">Название</div>

      <Input
        class="form-input"
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

      <div class="form-hint">
        Ты можешь использовать свое имя или название твоей команды. Пусть все будет просто.
      </div>
    </div>

    <hr class="v-hr" />
    
    <div class="form-block">
      <UploadImageAvatar class="form-avatar" v-bind="state.inputs.avatar">
        <template #label>
          <div class="form-avatar-label">
            <div class="form-avatar-label-letter">
              {{letter}}
            </div>
          </div>
        </template>
      </UploadImageAvatar>

      <div class="form-hint">
        Загрузи изображение или выбери смайлик. Он будет отображаться на вашей боковой панели и в уведомлениях
      </div>
    </div>

    <hr class="v-hr" />

    <div class="form-block">
      <div class="v-h3">Передача прав владельца</div>
      <div class="form-hint">
        Нажимая на кнопку ты отказываешь от владения продуктом и передаешь данные права другому пользователю, становясь обычным участником проекта.
      </div>
      <div class="form-button secondary">
        Передать проект
      </div>
    </div>

    <hr class="v-hr" />

    <div class="form-block">
      <div class="v-h3">Удаление</div>
      <div class="form-hint">
        Твой проект будет удалён навсегда
      </div>
      <div class="form-button remove">
        Удалить проект
      </div>
    </div>

    <template #bottom>
      <div class="form-bottom">
        <button type="submit" class="form-submit">Сохранить</button>
        <div @click="$emit('cancel')" class="form-cancel">Отменить</div>
      </div>
    </template>
  </Form>
</template>

<style lang="scss" scoped>
.form-button{
  &.remove{
    @include button-remove-small;
  }

  &.secondary{
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
}
.form-hint{
  font-weight: 400;
  font-size: 12px;
  line-height: 14px;
  color: $color-dark-20;

  &:not(:last-child){
    margin-bottom: 10px;
  }
}
.form-avatar{
  margin-bottom: 10px;

  &-label{
    width: 72px;
    height: 72px;
    border: 1px solid $color-dark-10;
    border-radius: 3px;
    padding: 6px;
    cursor: pointer;

    &-letter{
      background-color: $color-dark-20;
      border-radius: 3px;
      font-weight: 400;
      font-size: 40px;
      line-height: 42px;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100%;
      color: $color-light;
    }
  }
}
.form-input {
  margin-bottom: 10px;

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

.form-bottom {
  position: fixed;
  bottom: 0;
  left: 265px;
  right: 0;
  display: flex;
  justify-content: flex-start;
  border-top: 1px solid $color-dark-10;
  padding: 20px 50px;
  background-color: $color-light;

  .form-cancel {
    @include button-secondary-small;
    margin-right: 7px;
  }
  .form-submit {
    @include button-primary-small;
    margin-right: 7px;
  }
}
.v-h2 {
  font-weight: 400;
  font-size: 20px;
  line-height: 29px;
  padding-bottom: 15px;
  border-bottom: 1px solid $color-dark-10;
  margin-bottom: 20px;
}
.v-h3{
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
  color: $color-dark-70;
  margin-bottom: 5px;
}
.v-hr{
  width: 100%;
  height: 1px;
  background-color: $color-dark-10;
  border-radius: 10px;
  border: none;
  margin: 24px 0;
}
.btn-primary-small {
  @include button-primary-small;
}
.form {
  &-submit {
    @include submit-button();
  }
}
</style>