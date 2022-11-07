<script setup>
import XIcon from "@/assets/icons/svg/round-x.svg";

defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  modalBodyText: {
    type: String,
    default: "",
  },
  modalButtonText: {
    type: String,
    default: "Ок",
  },
});

const emit = defineEmits(["update:modelValue"]);

const close = () => emit("update:modelValue", false);
</script>

<template>
  <div v-if="modelValue" class="modal">
    <div class="modal-bg" @click="close" />
    <div class="modal-body">
      <XIcon class="modal-icon" />
      <div class="modal-text" v-if="modalBodyText.length">
        {{ modalBodyText }}
      </div>
      <button class="modal-button" @click="close">{{ modalButtonText }}</button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.modal {
  position: fixed;
  z-index: 777;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;

  &-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(3, 2, 41, 0.6);
  }

  &-body {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    max-width: 327px;
    width: 100%;
    padding: 48px 38px;
    background-color: $color-light;
    box-shadow: 0px 0px 20px rgba(3, 2, 41, 0.15);
    border-radius: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }

  &-icon {
    color: $color-error;
    margin-bottom: 30px;
    font-size: 100px;
  }

  &-text {
    color: $color-dark;
    font-weight: 400;
    font-size: 18px;
    line-height: 25px;
    margin-bottom: 15px;
    text-align: center;
  }

  &-button {
    @include submit-button;
  }
}
</style>
