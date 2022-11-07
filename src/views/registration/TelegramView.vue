<script>
import { reactive, ref, computed } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { useToast } from 'vue-toastification';

import Form from "@/components/VForm.vue";

export default {
  setup() {
    const toast = useToast();
    const router = useRouter();
    const store = useStore();

    const state = reactive({
    });

    function submitHandler(e){
      window.open('https://telegram.me/test_bot', '_target');
      router.push({ path: "/registration/confirm" });
    }


    return {
      state,
      submitHandler,
    };
  },
  components: {
    Form,
  },
};
</script>

<template>
  <div class="registration-page">
    <div class="h2-wrapper">
      <h2 class="h2">Регистрация</h2>
      <div class="registration-step">
        <span class="registration-step__value">03</span>
        <span class="registration-step__slash">/</span>
        <span class="registration-step__amount">04</span>
      </div>
    </div>

    <Form class="form" @submit="submitHandler">
      <p class="form-text">Чтобы продолжить регистрацию в Test, необходимо привязать ваш Telegram</p>
      <template #bottom>
          <div class="form-bottom">
            <button
              type="submit"
              class="form-submit"
            >
              <svg-icon class="form-submit-icon" name="telegram" />Привязать ваш Telegram
            </button>
            <div @click="$router.go(-1)" class="form-back">Назад</div>
          </div>
      </template>
    </Form>
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

.h2-wrapper {
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media all and (min-width: $xl) {
    width: 350px;
    margin: 0 auto 36px auto;
  }
}

.h2 {
  font-weight: 400;
  font-size: 26px;
  line-height: 35px;

  @media all and (min-width: $xl) {
    font-weight: 400;
    font-size: 36px;
    line-height: 53px;
  }
}

.registration-step {
  white-space: nowrap;

  &__value {
    font-weight: 400;
    font-size: 21px;
    line-height: 25px;
    color: $color-dark-70;
    margin-right: 2px;
  }
  &__slash {
    font-weight: 400;
    font-size: 14px;
    line-height: 17px;
    color: $color-dark-40;
    margin-right: 2px;
  }
  &__amount {
    font-weight: 400;
    font-size: 14px;
    line-height: 17px;
    color: $color-dark-40;
  }

  @media all and (min-width: $xl) {
    margin-top: 10px;
  }
}

.form {
  &-text{
    font-weight: 400;
    font-size: 16px;
    line-height: 22px;
  }
  
  &-bottom {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  &-submit {
    @include submit-button();

    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;

    &-icon{
      font-size: 22px;
    }
  }

  &-back {
    @include secondary-button();
  }

  &-submit {
    @include submit-button();
  }

  @media all and (min-width: $xl) {
    width: 350px;
    margin: 0 auto;
  }
}
</style>
