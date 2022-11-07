<script setup>
import {
  reactive,
} from "vue";

import UploadImage from "@/components/VUploadImage.vue"

const emit = defineEmits(["update:modelValue"]);

const props = defineProps({
  required: {
    type: Boolean,
    default: false,
  },
  modelValue: {
    type: Object,
    default: () => null,
  },
  title: {
    type: String,
    default: "",
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
});
</script>

<template>
  <UploadImage v-bind="props">
    <template #label>
      <slot name="label" />
    </template>
    <template #top>
      <h3 class="uploader-title">{{ props.title }}</h3>
    </template>
  </UploadImage>
</template>

<style lang="scss" scoped>
.uploader {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-areas:
    "a b ."
    "c b .";

  :deep(.uploader-btn) {
    grid-area: c;
  }
  :deep(.uploader-img-wrapper) {
    grid-area: b;
    margin: 0 auto;
  }
}
.uploader-title {
  grid-area: a;
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
  margin-bottom: 8px;
  color: $color-dark-70;
}

@media all and (min-width: $xl){
  .uploader {
    grid-template-areas:
      "a"
      "b"
      "c";

    :deep(.uploader-img-wrapper) {
      margin: 0 0 10px 0;
      width: 81px;
      height: 81px;
    }
  }
  .uploader-title {
    margin-bottom: 10px;
  }
}
</style>