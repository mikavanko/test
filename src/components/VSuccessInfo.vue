<script setup>
defineProps({
  img: {
    type: String,
    default: "@/static/img/success.jpg"
  },
  text: {
    type: String,
    default: "Операция выполнена успешно!",
  },
  btnText: {
    type: String,
    default: "Продолжить",
  },
})
</script>

<template>
  <div class="success-block">
    <div class="success-block__body">
      <div class="success-block__img-wrapper">
        <img class="success-block__img" src="@/static/img/success.jpg" alt="success-img" />
      </div>
      <p class="success-block__text" v-html="text" />
    </div>

    <div class="success-block__btn" @click="$emit('click')">{{btnText}}</div>
  </div>
</template>

<style lang="scss" scoped>
.success-block {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  height: 100%;

  &__img-wrapper {
    margin-bottom: 20px;
  }

  &__body {
    flex-grow: 1;
    padding-bottom: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;

    @media all and (min-width: $xl) {
      flex-grow: 0;
    }
  }

  &__text{
    font-weight: 400;
    font-size: 16px;
    line-height: 22px;
    text-align: center;
  }

  &__btn {
    @include submit-button();
  }
}
</style>