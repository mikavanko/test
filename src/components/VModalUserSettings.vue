<script setup>
import { reactive } from "vue";
import Modal from "@/components/VModal.vue";
import UserSettings from "@/components/VUserSettings.vue";

defineProps({
  user: {
    type: Object,
    default: () => {},
  },
});

const state = reactive({
  isModalVisible: false,
});

const cancel = () => {
  state.isModalVisible = false
}
</script>
 
<template>
  <Modal
    id="modal-user-settings"
    :title="'Настройки'"
    v-model="state.isModalVisible"
  >
    <UserSettings
      :user="user"
      @submitSuccess="state.isModalVisible = false"
      @cancel="cancel"
    />
  </Modal>
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
  @include clear-input;

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
</style>