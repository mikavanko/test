<script setup>
import { reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useToast } from 'vue-toastification';
import ErrorAdapter from "@/adapters/Error";

const toast = useToast();

const state = reactive({
  isTimerStarted: false,
  intervalId: null,
  timeToGetCode: 0,
});

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
  callback: {
    type: Function,
    default: async () => {},
  },
  fontSize: {
    type: String,
    default: "14px",
  },
  startTimer: {
    type: Boolean,
    default: false,
  },
  sendCode: {
    type: Boolean,
    default: false,
  },
});

const router = useRouter();

onMounted(() => {
  if (props.startTimer) {
    timerToGetCode();
  }
  if (props.sendCode) {
    getCode();
  }
});

const getCode = () => {
  if (!props.disabled) {
    props
      .callback()
      .then(() => {
        timerToGetCode();
      })
      .catch((err) => {
        const error = ErrorAdapter(err);

        toast.error(error.message)
      });
  }
};

const timerToGetCode = () => {
  if (!props.isTimerStarted) {
    state.isTimerStarted = true;
    state.timeToGetCode = 30;
    state.intervalId = setInterval(() => {
      if (state.timeToGetCode === 0) {
        state.isTimerStarted = false;
        clearInterval(state.intervalId);
      } else {
        state.timeToGetCode--;
      }
    }, 1000);
  }
};
</script>

<template>
  <div
    v-if="!state.isTimerStarted"
    :class="['get-code-btn', { disabled: disabled }]"
    @click="getCode"
    :style="{
      '--fontSize': fontSize,
    }"
  >
    Получить код
  </div>
  <div
    v-else
    class="get-code-wait"
    :style="{
      '--fontSize': fontSize,
    }"
  >
    Получить код через {{ state.timeToGetCode }}с
  </div>
</template>

<style lang="scss" scoped>
.get-code-btn {
  color: $color-primary;
  font-weight: 600;
  font-size: var(--fontSize);
  line-height: 22px;
  cursor: pointer;

  &.disabled {
    color: $color-dark-40;
    cursor: initial;
  }
}

.get-code-wait {
  font-weight: 600;
  font-size: var(--fontSize);
  line-height: 22px;
  color: $color-dark-20;
}
</style>
