<script>
import { reactive, computed, nextTick, ref, watch, onUnmounted } from "vue";
import { useStore } from "vuex";
import { isMobile } from "@/assets/js/utils";
import FieldValueWrapper from "../FieldValueWrapper.vue";
import Modal from "@/components/VModal.vue";

import { TYPE, TYPE_ICONS, TYPE_PLACEHOLDERS } from "../taskProperties";
import MultiSelect from "@/components/MultiSelect.vue";

export default {
  components: {
    FieldValueWrapper,
    MultiSelect,
    Modal,
  },
  emits: ["update:modelValue", "close"],
  props: {
    modelValue: {
      type: null,
    },
    options: {
      type: Array,
      default: () => [],
    },
    multiselect: {
      type: Boolean,
      default: true,
    },
    editMode: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    const store = useStore();

    const value = computed({
      get() {
        if (props.multiselect) {
          return props.modelValue
            ? props.modelValue.map((id) =>
                props.options.find((el) => el.id === id)
              )
            : [];
        } else {
          return props.options.find((el) => el.id === props.modelValue) ?? null;
        }
      },
      set(val) {
        if (props.multiselect) {
          emit(
            "update:modelValue",
            val ? val.map((el) => el.id).filter((el) => el !== undefined) : []
          );
        } else {
          emit("update:modelValue", val?.id ?? null);
        }
      },
    });

    const state = reactive({
      filterInput: "",
      isActive: false,
    });

    const items = ref(props.options || []);

    watch(
      () => props.options,
      (val) => {
        items.value = val;
      },
      {
        deep: true,
      }
    );

    const modalCoords = ref({});

    function onOpen(e) {
      const rect = e.currentTarget.getBoundingClientRect();
      modalCoords.value = {
        x: rect.x,
        y: rect.y,
      };
    }

    function clearData() {
      state.filterInput = "";
    }

    watch(
      () => state.isActive,
      (val) => {
        if (!val) {
          clearData();
        }
      }
    );

    return {
      state,
      isMobile,
      value,
      items,
      modalCoords,
      onOpen,
    };
  },
};
</script>

<template>
  <FieldValueWrapper
    :value="value"
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
          :width="isMobile() ? '100%' : '547px'"
          :height="isMobile() ? '100%' : 'auto'"
          :padding="'0'"
          :bgColor="'transparent'"
          :coords="modalCoords"
          @modal-close="$emit('close', value)"
          autoPositionMode
        >
          <MultiSelect
            class="select"
            :items="items"
            :placeholder="'Найдите пользователя'"
            :noDataText="'Нет пользователей'"
            :title="'Выберите пользователя'"
            :showNoData="false"
            :filter-key="'name'"
            :multiselect="multiselect"
            v-model="value"
            v-model:filterInput="state.filterInput"
          >
            <template #item="{ item }">
              <div class="select-item">
                <div class="select-item-l">{{ item?.name[0] }}</div>
                {{ item.name }}
              </div>
            </template>
            <template #selected-item="{ item }">
              <div class="select-item">
                <div class="select-item-l">{{ item?.name[0] }}</div>
                {{ item.name }}
                <svg-icon class="select-item-icon" name="close-square" />
              </div>
            </template>
          </MultiSelect>
        </Modal>
      </Teleport>
    </template>
    <template #text="{ item }">
      <div class="select-item">
        <div class="select-item-l">{{ item?.name[0] }}</div>
        {{ item.name }}
      </div>
    </template>
  </FieldValueWrapper>
</template>

<style lang="scss" scoped>
.text-wrapper {
  padding: 6px 5px;
  min-height: 34px;
}
.select-item {
  border-radius: 4px;
  padding: 2px 5px;
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 5px;

  &-l {
    width: 16px;
    height: 16px;
    border-radius: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: 400;
    font-size: 10px;
    line-height: 12px;
    color: $color-light;
    background-color: $color-avatar;
  }

  &:hover{
    .select-item-icon {
      font-size: 16px;
      color: $color-dark-40;
      background-color: $color-dark-10;
    }
  }
}
.select-item-icon {
  font-size: 16px;
  color: $color-dark-40;
  border-radius: 4px;
  transition: background-color .3s ease;
}
</style>
