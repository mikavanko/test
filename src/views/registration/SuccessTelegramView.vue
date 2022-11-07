<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

const onSubmit = (e) => {
  e.preventDefault();

  router.push({ path: "/auth" });
};
</script>

<template>
  <div class="registration-page">
    <h2 class="h2">Отличная работа!</h2>

    <form class="form" @submit="onSubmit">
      <div class="form-body">
        <div class="success">
          <img
            class="success-img"
            src="@/static/img/success-telegram.jpg"
            alt="success"
          />
          <span class="success-text">
            Вы успешно подключили Telegram <br>для дальнейшей работы с Test 
          </span>
        </div>
      </div>
      <button type="submit" class="form-submit">Ок</button>
    </form>
  </div>
</template>

<style lang="scss" scoped>
.registration-page {
  padding: 60px 0;
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  @media all and (min-width: $xl) {
    padding: 100px 0;
  }
}

.h2 {
  font-weight: 400;
  font-size: 26px;
  line-height: 35px;
  margin-bottom: 16px;

  @media all and (min-width: $xl) {
    font-weight: 400;
    font-size: 36px;
    line-height: 53px;
    margin-bottom: 36px;
    text-align: center;
  }
}

.form {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  height: 100%;

  &-row {
    margin-bottom: 20px;
  }

  &-body {
    flex-grow: 1;
    padding-bottom: 24px;
    display: flex;
    align-items: center;
    justify-content: center;

    @media all and (min-width: $xl) {
      flex-grow: 0;
    }
  }

  &-submit {
    @include submit-button();
  }

  @media all and (min-width: $xl) {
    width: 350px;
    margin: 0 auto;
  }
}

.success {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  pointer-events: none;
  text-align: center;
}
.success-img {
  width: 221px;
  margin-bottom: 20px;
}
.success-text {
  display: block;
  font-weight: 400;
  font-size: 16px;
  line-height: 22px;
}
</style>
