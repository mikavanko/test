<script setup>
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { reactive, defineEmits, defineProps, computed } from "vue";
import { useToast } from 'vue-toastification';

import { createProject } from "@/api/projects";
import Form from "@/components/VForm.vue";
import Input from "@/components/VInput.vue";
import UploadImage from "@/components/VUploadImage.vue";
import { isMobile } from "@/assets/js/utils";
import ProjectAdapter from "@/adapters/Project";
import ModalWait from "@/components/VModalWait.vue";

const store = useStore();
const router = useRouter();
const toast = useToast();
const emit = defineEmits(["project-created"])
const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
})

const state = reactive({
  isModalWaitVisible: false,
  form: {
    avatar: {
      name: "avatar",
      value: null,
      buttonText: "Добавить логотип",
      required: false,
    },
    name: {
      name: "name",
      label: "Название проекта",
      value: "",
      errorText: "Введите название проекта",
      rules: [
        {
          validator: (val) => !val.length,
        },
      ],
    },
  },
  isSubmitBtnDisabled: true,
});

const onInputProjectName = (val) => {
  state.isSubmitBtnDisabled = !val;
};

const onSubmit = ({ errors, values }) => {
  for (const error of errors) {
    toast.error(error.errorText)
  }

  if (!errors.length) {
    const data = {
      ...values.reduce((obj, item) => ((obj[item.name] = item.value), obj), {}),
    };

    var formData = new FormData();
    if (data.avatar) {
      formData.append("avatar", data.avatar);
    }

    formData.append("name", data.name);

    createProject(formData).then((res) => {
      state.isModalWaitVisible = true

      setTimeout(() => {
        state.isModalWaitVisible = false
        const project = res.data.data
        store.dispatch("projects/setNewProject", project);
        emit('project-created', project)
      }, 2000);
    });
  }
};

</script>

<template>
  <div class="form-wrapper">
    <div class="form-title" v-html="props.title" />
    <div class="form-subtitle" v-html="props.subtitle" />

    <Form class="form" @submit="onSubmit" :height="'100%'">
      <UploadImage
        v-bind="state.form.avatar"
        class="project-uploader"
        v-if="!isMobile()"
      >
        <template #no-image="item">
          <div class="no-image" @click="item.triggerFileModal">
            {{ state.form.name.value[0] || "T" }}
          </div>
        </template>
      </UploadImage>

      <Input
        v-bind="state.form.name"
        v-model:value="state.form.name.value"
        @update:value="onInputProjectName"
      />

      <template #bottom>
        <div class="form-bottom">
          <button type="submit" class="form-submit" :disabled="state.isSubmitBtnDisabled">Продолжить</button>
        </div>
      </template>
    </Form>
  </div>
  <ModalWait v-model:isVisible="state.isModalWaitVisible" />
</template>

<style lang="scss" scoped>
.project-uploader{
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 50px;

  :deep(.uploader-btn){
    order: 2;
    margin-top: 11px;

    .uploader-btn__label{
      color: $color-dark-40;
      font-weight: 400;
      font-size: 12px;
      line-height: 14px;
      padding: 0;
      border: none;
    }
  }
  :deep(.uploader-img-wrapper){
    width: 65px;
    height: 65px;
    border-radius: 3px;
  }
}
.no-image{
  width: 65px;
  height: 65px;
  border-radius: 3px;
  background-color: $color-dark-20;
  font-weight: 400;
  font-size: 40px;
  line-height: 42px;
  color: $color-light;
  display: flex;
  justify-content: center;
  align-items: center;
  text-transform: uppercase;
  order: 1;
  cursor: pointer;
}
.new-project-page {
  padding: 15px 0 32px;
  height: 100vh;
  display: flex;
  flex-direction: column;

  @media all and (min-width: $xl) {
    padding: 20px 0;
  }
}

.form {
  @media all and (min-width: $xl) {
    width: 350px;
    margin: 0 auto;
  }
}
.form-title {
  font-weight: 400;
  font-size: 20px;
  line-height: 24px;
  text-align: center;
  margin-bottom: 10px;

  @media all and (min-width: $xl) {
    font-size: 36px;
    line-height: 43px;
  }
}
.form-subtitle {
  font-weight: 400;
  font-size: 14px;
  line-height: 17px;
  text-align: center;
  color: $color-dark-40;
  margin-bottom: 28px;

  @media all and (min-width: $xl) {
    font-size: 18px;
    line-height: 27px;
    margin-bottom: 50px;
  }
}
.form-submit {
  @include submit-button;
}
</style>