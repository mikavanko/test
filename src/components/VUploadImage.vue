<script>
import {
  reactive,
  inject,
  onMounted,
  getCurrentInstance,
  onBeforeUnmount,
  computed,
  ref,
} from "vue";

export default{
  emits: ["update:modelValue"],
  props: {
    required: {
      type: Boolean,
      default: false,
    },
    modelValue: {
      type: Object,
      default: () => null,
    },
    name: {
      type: String,
      default: "",
    },
    buttonText: {
      type: String,
      default: "",
    },
    imgUrl: {
      type: String,
      default: "",
    },
    showButtonIfImgPicked: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }){
    const state = reactive({
      file: null,
      image: "",
      uid: null,
    });

    const image = computed(() => state.image || props.imgUrl);

    const showButton = computed(() => {
      if(props.showButtonIfImgPicked){
        return !image.value
      }else{
        return true
      }
    })

    const onFileChange = (e) => {
      let files = e.target.files || e.dataTransfer.files;
      if (!files.length) {
        return;
      }
      state.file = files[0];
      emit("update:modelValue", files[0]);
      return createImage(files[0]);
    };

    const createImage = (file) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        return (state.image = e.target.result);
      };

      return reader.readAsDataURL(file);
    };

    const form = inject("form");
    const curInst = getCurrentInstance();
    state.uid = curInst.uid;

    onMounted(() => {
      form &&
        form.bind({
          required: props.required,
          getValue,
          uid: state.uid,
          name: props.name,
        });
    });

    onBeforeUnmount(() => {
      form && form.unbind(state.uid);
    });

    function getValue() {
      return { name: props.name, value: state.file };
    }

    const fileInput = ref()

    const triggerFileModal = () => {
      fileInput.value.click()
    }

    return {
      state,
      image,
      onFileChange,
      triggerFileModal,
      fileInput,
      showButton,
    }
  }
}
</script>

<template>
  <div class="uploader">
    <slot name="top" />
    <div class="uploader-btn" v-if="showButton">
      <label :for="'uploader-input-' + state.uid">
        <slot name="label">
          <div class="uploader-btn__label">
            {{
              buttonText
            }}
          </div>
        </slot>
      </label>
      <input
        ref="fileInput"
        :id="'uploader-input-' + state.uid"
        class="uploader-btn__input"
        type="file"
        @change="onFileChange"
      />
    </div>
    <div class="uploader-img-wrapper" v-if="image" @click="triggerFileModal">
      <img class="uploader-img" :src="image" :alt="state.file?.name" />
    </div>
    <slot name="no-image" v-bind="{ triggerFileModal }" v-else />
  </div>
</template>

<style lang="scss" scoped>
.uploader {
}
.uploader-btn {
  display: inline-block;

  &__label {
    @include clear-button();
    display: inline-block;
    font-weight: 600;
    font-size: 14px;
    line-height: 20px;
    color: $color-dark-70;
    padding: 5px 10px;
    border: 1px solid $color-dark-20;
    border-radius: 4px;
    cursor: pointer;
  }

  &__input {
    display: none;
  }
}
.uploader-img-wrapper {
  width: 62px;
  height: 62px;
  position: relative;
  border-radius: 100%;
  overflow: hidden;
  margin: 0;
  cursor: pointer;
}
.uploader-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>