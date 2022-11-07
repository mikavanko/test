<script setup>
import { reactive } from "vue"
import UserSettings from "@/components/VUserSettings.vue";

defineProps({
  user: {
    type: Object,
    default: () => {},
  },
})

const emit = defineEmits(["submitSuccess","cancel"])

const submitSuccess = () => {
  emit("submitSuccess")
}
const cancel = () => {
  emit("cancel")
}

</script>


<template>
  <div class="user-settings-wrapper">
    <h2 class="title">Учётная запись</h2>
    <UserSettings
      ref="userSettings"
      :user="user"
      @cancel="cancel"
      @submit-success="submitSuccess"
    >
    </UserSettings>
  </div>
</template>

<style lang="scss" scoped>
.title{
  font-weight: 400;
  font-size: 20px;
  line-height: 29px;
  padding-bottom: 15px;
  border-bottom: 1px solid $color-dark-10;
  margin-bottom: 20px;
}

:deep(.form-bottom) {
  position: fixed;
  bottom: 0;
  left: 265px;
  right: 0;
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
</style>