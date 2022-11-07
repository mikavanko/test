<script>
import { reactive, computed, nextTick, ref, watch, watchEffect, onMounted } from "vue";
import { useStore } from "vuex";
import { isMobile } from "@/assets/js/utils";
import Modal from "@/components/VModal.vue";
import FieldValueWrapper from "../FieldValueWrapper.vue";
import Calendar from "@/components/Calendar.vue";

import {
  TIME_FORMATS_ID,
  TIME_FORMATS_ID_NO_TIME,
  TIME_FORMATS_ID_WITH_TIME,
  TIME_FORMATS_ID_RELATED,
} from "../taskProperties";

import CalendarFormatModal from "@/components/task/CalendarFormatModal.vue";
import CalendarFormatModalTimeFormats from "@/components/task/CalendarFormatModalTimeFormats.vue";
import CalendarFormatModalTimeZones from "@/components/task/CalendarFormatModalTimeZones.vue";

import moment from "moment";

export default {
  components: {
    FieldValueWrapper,
    Modal,
    Calendar,
    CalendarFormatModal,
    CalendarFormatModalTimeFormats,
    CalendarFormatModalTimeZones,
  },
  emits: [
    "update:modelValue",
    "close-calendar-modal",
    "switch-range",
    "date-changed",
    "change-format",
  ],
  props: {
    value: {
      type: Object,
      default: () => ({}),
    },
    hasEnd: {
      type: Boolean,
      default: false,
    },
    hasTime: {
      type: Boolean,
      default: false,
    },
    formatId: {
      type: Number,
      default: 1,
    },
    timezoneId: {
      type: Number,
      default: 427,
    },
    editMode: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    const store = useStore();

    const modalRootRef = ref();
    const formats = computed(() => store.getters["documents/getTimeFormats"]);
    const format = computed(() =>
      formats.value.find((f) => f.id === props.formatId)
    );

    const visibleDateFormat = computed(()=>format.value.format.split(" ")[0])

    const defaultFormat = computed(() =>
      formats.value.find((f) => f.id === TIME_FORMATS_ID.DEFAULT)
    );

    const state = reactive({
      isActive: false,
      date: null,
      time: null,
      isRange: false,
      isTime: false,
      isCalendarFormatModalVisible: false,
      calendarFormatModalCoords: null,
      isTimeFormatsModalVisible: false,
      timeFormatsModalCoords: null,
      isTimeZonesModalVisible: false,
      timeZonesModalCoords: null,
      dateWasChanged: false,
    });

    watchEffect(() => {
      state.isRange = props.hasEnd;
    });
    watchEffect(() => {
      state.isTime = props.hasTime;
    });

    onMounted(()=>{
      initTime()

      const date = props.value;

      if (!date?.from) {
        return;
      }

      if (props.hasEnd) {
        const dateFrom = moment(date.from).add(3, 'hours')
        const dateTo = date.to ? moment(date.to).add(3, 'hours') : null
        state.date = {
          start: dateFrom.toDate(),
          end: date.to ? dateTo.toDate() : null,
        };
        state.time = {
          start: dateFrom.format("HH:mm"),
          end: date.to ? dateTo.format("HH:mm") : "12:00",
        }
      } else {
        const dateFrom = moment(date.from).add(3, 'hours')
        state.date = dateFrom.toDate();
        state.time = dateFrom.format("HH:mm");
      }
    })

    const items = ref([]);

    const modalCoords = ref({});

    function onOpen(e) {
      const rect = e.currentTarget.getBoundingClientRect();
      modalCoords.value = {
        x: rect.x,
        y: rect.y,
      };
    }

    function initTime() {
      if(props.hasEnd){
        state.time = {
          start: "12:00",
          end: "12:00",
        }
      }else{
        state.time = "12:00"
      }
    }

    function openCalendarFormatModal(e) {
      state.isCalendarFormatModalVisible = true;
      state.calendarFormatModalCoords = getModalCoords(e);
    }

    function getModalCoords(e) {
      const modalRootNode = modalRootRef.value.$refs.modalRef;
      const modalRootNodeRect = modalRootNode.getBoundingClientRect();

      return {
        x: modalRootNodeRect.right,
        y: e.clientY,
      };
    }

    function openTimeFormats(e) {
      state.isTimeFormatsModalVisible = true;
      state.timeFormatsModalCoords = {
        x: e.clientX,
        y: e.clientY,
      };
    }
    function openTimeZones(e) {
      state.isTimeZonesModalVisible = true;
      state.timeZonesModalCoords = {
        x: e.clientX,
        y: e.clientY,
      };
    }

    function modalClose() {
      const sendFormat = format.value?.formatWithTime ?? defaultFormat.value.format;

      if (state.date) {
        let resDate = null;

        let formatFunc = formatDateWithTime

        if (state.isRange) {
          resDate = {
            from: formatFunc(state.date.start, sendFormat, state.time.start),
            to: formatFunc(state.date.end, sendFormat, state.time.end),
          };
        } else {
          resDate = formatFunc(state.date, sendFormat, state.time);
        }

        emit("date-changed", resDate);
      }

      emit("close-calendar-modal");
    }

    function formatDateWithTime(date, format, time) {
      const h = time.split(":")[0];
      const m = time.split(":")[1];
      return moment(date).set({h, m}).format(format);
    }

    function formatDate(date, format) {
      return moment(date).format(format);
    }

    async function switchRange(val) {
      if (val) {
        state.date = {
          start: state.date || new Date(),
          end: state.date || new Date(),
        };
        state.time = {
          start: state.time || "12:00",
          end: state.time || "12:00",
        }
      } else {
        state.date = state.date.start || new Date();
        state.time = state.time.start || "12:00";
      }

      await nextTick();
      state.dateWasChanged = false;

      emit("switch-range", val);
    }

    function dateWasChangedHandler() {
      state.dateWasChanged = true;
    }

    function changeFormat(item) {
      emit("change-format", item);
    }
    function toggleTime(val) {
      emit("toggle-time", val);
    }

    return {
      state,
      isMobile,
      items,
      modalCoords,
      onOpen,
      openCalendarFormatModal,
      modalRootRef,
      openTimeFormats,
      openTimeZones,
      modalClose,
      switchRange,
      dateWasChangedHandler,
      formatDate,
      formats,
      format,
      changeFormat,
      toggleTime,
      visibleDateFormat,
    };
  },
};
</script>

<template>
  <FieldValueWrapper
    :value="state.date"
    :clickOutside="false"
    :editMode="editMode"
    v-model:isActive="state.isActive"
    @open="onOpen"
  >
    <template #component="{ setFocusRef }">
      <!-- :ref="(el) => setFocusRef(el)" -->
      <Teleport to="body">
        <Modal
          ref="modalRootRef"
          v-model="state.isActive"
          :showModalTop="isMobile()"
          :width="isMobile() ? '100%' : '300px'"
          :height="isMobile() ? '100%' : 'auto'"
          :padding="'0'"
          :bgColor="'transparent'"
          :coords="modalCoords"
          autoPositionMode
          @modal-close="modalClose"
        >
          <Calendar
            :format="visibleDateFormat"
            v-model="state.date"
            v-model:isRange="state.isRange"
            v-model:isTime="state.isTime"
            v-model:time="state.time"
            @update:isTime="toggleTime"
            @update:modelValue="dateWasChangedHandler"
            @update:time="dateWasChangedHandler"
            @update:isRange="switchRange"
            @click-format="openCalendarFormatModal"
          />
        </Modal>
      </Teleport>
    </template>
    <template #text="{ item }">
      <div class="date-view" v-if="$props.hasEnd">
        {{ formatDate(item.start, visibleDateFormat) }}
        <template v-if="state.isTime">
          {{state.time.start}}
        </template>
        —
        {{
          formatDate(item.end, visibleDateFormat)
        }}
        <template v-if="state.isTime">
          {{state.time.end}}
        </template>
      </div>
      <div class="date-view" v-else>
        {{ formatDate(item, visibleDateFormat) }}
        <template v-if="state.isTime">
          {{state.time}}
        </template>
      </div>
    </template>
  </FieldValueWrapper>

  <CalendarFormatModal
    v-model="state.isCalendarFormatModalVisible"
    :coords="state.calendarFormatModalCoords"
    :translateY="'-50%'"
    z-index="778"
    @click-time-formats="openTimeFormats"
    @click-time-zones="openTimeZones"
  />

  <CalendarFormatModalTimeFormats
    v-model="state.isTimeFormatsModalVisible"
    :coords="state.timeFormatsModalCoords"
    :translateY="'-100%'"
    :translateX="'-50%'"
    :formats="formats"
    z-index="778"
    hideOnAction
    @change-format="changeFormat"
  />

  <CalendarFormatModalTimeZones
    v-model="state.isTimeZonesModalVisible"
    :coords="state.timeZonesModalCoords"
    :translateY="'-100%'"
    :translateX="'-50%'"
    z-index="778"
  />
</template>

<style lang="scss" scoped>
.date-view {
  font-weight: 400;
  font-size: 14px;
  line-height: 22px;
  color: $color-dark;
}
</style>
