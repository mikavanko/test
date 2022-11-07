<script>
import { reactive, computed, nextTick, ref, getCurrentInstance } from "vue";
import { isMobile } from "@/assets/js/utils";
import { DatePicker } from "v-calendar";
import TimeInput from "@/components/TimeInput.vue";
import "v-calendar/dist/style.css";

import Switch from "@/components/VSwitch.vue";

const defaultTime = "12:00"

export default {
  components: {
    DatePicker,
    Switch,
    TimeInput,
  },
  emits: [
    "update:modelValue",
    "update:isRange",
    "update:isTime",
    "click-format",
  ],
  props: {
    modelValue: {
      type: null,
    },
    isRange: {
      type: Boolean,
      default: true,
    },
    isTime: {
      type: Boolean,
      default: false,
    },
    format: {
      type: String,
      default: "YYYY-MM-DD",
    },
    time: {
      type: null,

    },
  },
  setup(props, { emit }) {
    const date = computed({
      get() {
        if(props.isRange){
          return props.modelValue || {
            start: new Date(),
            end: new Date(),
          };
        }else{
          return props.modelValue || new Date();
        }
      },
      set(val) {
        emit("update:modelValue", val);
      },
    });
    const time = computed({
      get() {
        if(props.isRange){
          return props.time || {
            start: defaultTime,
            end: defaultTime,
          };
        }else{
          return props.time || defaultTime;
        }
      },
      set(val) {
        console.log('update:time',val)
        emit("update:time", val);
      },
    });

    const isRange = computed({
      get() {
        return props.isRange;
      },
      set(val) {
        emit("update:isRange", val);
      },
    });
    const isTime = computed({
      get() {
        return props.isTime;
      },
      set(val) {
        emit("update:isTime", val);
      },
    });

    const popover = ref({
      visibility: "hidden",
    });

    const format = computed(() => props.format);

    const state = reactive({
      themeStyles: {
        dayNotInMonth: "not-in-month",
      },
      masks: {
        title: "MMMM YYYY",
        weekdays: "WW",
        navMonths: "MMM",
        input: format,
        dayPopover: "WWW, MMM D, YYYY",
        data: ["L", "YYYY-MM-DD", "YYYY/MM/DD"],
      },
    });

    function updateRangeDate(d, key) {
      const dateTemp = {
        ...date.value,
        [key]: d,
      };
      date.value = dateTemp;
    }

    return {
      state,
      date,
      time,
      isRange,
      isTime,
      popover,
      updateRangeDate,
    };
  },
};
</script>

<template>
  <div class="calendar-wrapper">
    <div class="date-picker-inputs" v-if="!isRange">
      <div class="date-picker-inputs-group">
        <DatePicker
          :theme="state.themeStyles"
          :masks="state.masks"
          :update-on-input="false"
          mode="date"
          v-model="date"
          :popover="popover"
          class="date-picker-input-wrapper date-picker-inputs-group__item"
        >
          <template #default="{ inputValue, inputEvents }">
            <input
              :class="['date-picker-input']"
              :value="inputValue"
              v-on="inputEvents"
            />
          </template>
        </DatePicker>
        <TimeInput
          v-if="isTime"
          :class="[
            'time-picker date-picker-inputs-group__item',
            { 'time-right': isTime },
          ]"
          v-model="time"
        />
      </div>
    </div>
    <div :class="['date-picker-inputs', { time: isTime }]" v-else>
      <div class="date-picker-inputs-group">
        <DatePicker
          :theme="state.themeStyles"
          :masks="state.masks"
          :update-on-input="false"
          mode="date"
          v-model="date.start"
          @update:modelValue="updateRangeDate(date.start, 'start')"
          :popover="popover"
          class="date-picker-input-wrapper date-picker-inputs-group__item"
        >
          <template #default="{ inputValue, inputEvents }">
            <input
              :class="['date-picker-input']"
              :value="inputValue"
              v-on="inputEvents"
            />
          </template>
        </DatePicker>
        <TimeInput
          v-if="isTime"
          :class="[
            'time-picker date-picker-inputs-group__item',
            { 'time-right': isTime },
          ]"
          v-model="time.start"
        />
      </div>
      <div class="date-picker-inputs-group">
        <DatePicker
          :theme="state.themeStyles"
          :masks="state.masks"
          :update-on-input="false"
          mode="date"
          v-model="date.end"
          @update:modelValue="updateRangeDate(date.end, 'end')"
          :popover="popover"
          class="date-picker-input-wrapper date-picker-inputs-group__item"
        >
          <template #default="{ inputValue, inputEvents }">
            <input
              :class="['date-picker-input']"
              :value="inputValue"
              v-on="inputEvents"
            />
          </template>
        </DatePicker>
        <TimeInput
          v-if="isTime"
          :class="[
            'time-picker date-picker-inputs-group__item',
            { 'time-right': isTime },
          ]"
          v-model="time.end"
        />
      </div>
    </div>
    <div class="calendar-datepicker">
      <DatePicker
        :theme="state.themeStyles"
        :masks="state.masks"
        title-position="left"
        mode="date"
        v-model="date"
        :is-range="isRange"
        class="calendar"
      />
    </div>
    <!-- <template #day-content="{ day, dayEvents, attributes }">
    {{attributes}}
        <div class="day"
            v-on="dayEvents"
        > -->
    <!-- :class="getDayClass(day)" -->
    <!-- <div class="day__day">{{ day.day }}</div> -->

    <!-- </div>
    </template> -->
    <!-- </DatePicker> -->

    <hr class="hr" />
    <div class="calendar-block">
      <div class="calendar-period" @click="isRange = !isRange">
        <p class="calendar-period-text">Дата окончания</p>
        <Switch class="calendar-switch" @click.stop v-model="isRange" />
      </div>
      <div class="calendar-period">
        <p class="calendar-period-text">Добавить время</p>
        <Switch class="calendar-switch" @click.stop v-model="isTime" />
        <!-- v-model="isRange" -->
      </div>
    </div>
    <hr class="hr" />
    <div class="calendar-block">
      <div class="calendar-period" @click="$emit('click-format', $event)">
        <p class="calendar-period-text">
          <svg-icon class="calendar-period-icon" name="setting-3" />
          Формат даты и времени
        </p>
      </div>
    </div>
    <hr class="hr" />
    <div class="calendar-block">
      <div class="calendar-period">
        <p class="calendar-period-text">Очистить</p>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.calendar-block {
  gap: 4px;
  display: flex;
  flex-direction: column;
}

.calendar-period {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: 0.3s ease;

  &:hover {
    background: $color-light-f;
  }

  &-text {
    color: $color-dark-70;
    font-weight: 400;
    font-size: 12px;
    line-height: 17px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 10px;
  }

  &-icon {
    font-size: 17px;
    color: $color-dark-70;
  }
}

.hr {
  background-color: $color-dark-10;
  margin: 10px 0;
  border: none;
  height: 1px;
}

.date-picker-inputs {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 10px;
  margin-bottom: 5px;

  &.time {
    flex-wrap: wrap;
  }
}

.date-picker-inputs-group {
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  border: 1px solid $color-dark-20;
  border-radius: 4px;
  overflow: hidden;
  transition: 0.3s ease;

  &:focus-within {
    background: $color-primary-5;
    border: 1px solid $color-primary;
  }

  &__item {
    width: 50%;

    &.time-right {
      position: relative;

      &:before {
        content: "";
        position: absolute;
        width: 1px;
        height: 17px;
        background-color: $color-dark-10;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
      }
    }
  }
}

.date-picker-input {
  @include clear-input;

  font-weight: 400;
  font-size: 12px;
  line-height: 17px;
  color: $color-dark-70;
  padding: 5px 10px;
  background-color: $color-light-f;

  &-wrapper {
    flex: 1;
  }
}

.calendar {
  border: none;

  &-datepicker {
    display: flex;
    justify-content: center;
  }

  &-wrapper {
    padding: 15px 10px 10px;
  }

  :deep() {
    .vc-day.is-not-in-month * {
      opacity: 1;
      pointer-events: all;
    }

    .vc-weekday {
      text-transform: capitalize;
      font-weight: 400;
      font-size: 12px;
      line-height: 18px;
      color: $color-dark-40;
    }

    .vc-title {
      text-transform: capitalize;
      font-weight: 600;
      font-size: 14px;
      line-height: 21px;
      color: $color-dark-70;
    }

    .vc-header {
      padding: 10px;
    }

    .vc-arrows-container {
      padding: 8px 0;
    }

    .vc-arrow {
      font-size: 21px;
    }

    // .weekday-position-6,
    // .weekday-position-7 {
    //   .vc-day-content {
    //     color: $color-primary-70 !important;
    //   }
    // }

    .vc-weeks {
      min-width: 240px;
    }

    .vc-highlight {
      width: 32px;
      height: 32px;
      border-radius: 6px !important;
      background-color: $color-primary-70 !important;
      color: $color-light;
      font-weight: 700;
      border: none !important;
    }

    .vc-highlight-base-middle {
      width: 100%;
      border-radius: 0 !important;
      background-color: $color-primary-10 !important;
    }

    .vc-highlight-base-start {
      border-radius: 6px 0 0 6px !important;
    }

    .vc-highlight-base-end {
      border-radius: 0 6px 6px 0 !important;
    }

    .vc-day-content {
      width: 32px;
      height: 32px;
      font-weight: 400 !important;
      font-size: 14px;
      line-height: 17px;
      color: $color-dark;
      border-radius: 6px;

      &:focus {
        background-color: inherit;
      }

      &:hover {
        background-color: $color-primary-70;
        color: $color-light !important;
        font-weight: 700 !important;
      }
    }
  }
}
</style>
