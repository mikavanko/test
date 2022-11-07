<script>
import { reactive, computed, nextTick, ref, watch } from "vue";
import { useStore } from "vuex";
import { isMobile } from "@/assets/js/utils";
import FieldValueWrapper from "../FieldValueWrapper.vue";
import Modal from "@/components/VModal.vue";
import OptionModal from "@/components/task/modals/VOptionModal.vue";


import { TYPE, TYPE_ICONS, TYPE_PLACEHOLDERS } from "../taskProperties";
import MultiSelect from "@/components/MultiSelect.vue";

export default {
  components: {
    FieldValueWrapper,
    MultiSelect,
    Modal,
    OptionModal,
  },
  emits: ["update:modelValue", "option-add", "option-remove", "close", "name-changed", "color-changed"],
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
    const colors = computed(() => store.getters["documents/getColors"]);
    const randomPropertyColor = ref(null);
    const modalRootRef = ref(null);

    const generateRandomPropertyColor = () => {
      if (colors.value?.length) {
        const idx = Math.floor(Math.random() * colors.value.length);
        randomPropertyColor.value = colors.value[idx];
      }
    };
    generateRandomPropertyColor();

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
      isPropertyExist: true,
      isActive: false,
      isOptionModalVisible: false,
      optionModalCoords: null,
      activeOption: null,
    });

    const items = ref(props.options || []);

    watch(
      () => props.options,
      (val) => {
        items.value = val;

        nextTick().then(()=>{
          modalRootRef.value && modalRootRef.value.setAutoPosition()
        })
      },
      {
        deep: true,
      }
    );

    const modalCoords = ref({});

    function onFilterInput(val) {
      if(!val) {
        state.isPropertyExist = true
        return;
      }
      
      state.isPropertyExist =
        items.value.findIndex((el) => el.name === val) !== -1;
    }

    function createProperty(name) {
      if(state.isPropertyExist) return

      const newItem = {
        name,
        color: randomPropertyColor.value,
      };

      items.value.push(newItem);

      clearData();

      emit("option-add", newItem);

      generateRandomPropertyColor();
    }

    function onOpen(e) {
      const rect = e.currentTarget.getBoundingClientRect();
      modalCoords.value = {
        x: rect.x,
        y: rect.y,
      };
    }

    function clearData() {
      state.filterInput = "";
      state.isPropertyExist = true;
    }

    watch(
      () => state.isActive,
      (val) => {
        if (!val) {
          clearData();
        }
      }
    );

    function showOptionModal(e, item) {
      state.activeOption = item;
      state.isOptionModalVisible = true;

      const rect = e.currentTarget.getBoundingClientRect();
      state.optionModalCoords = {
        x: rect.x,
        y: rect.y,
      };
    }

    function removeOption(item) {
      emit("option-remove", state.activeOption);
    }

    function changeColorOption(color) {
      emit('color-changed', { color, option: state.activeOption })
    }

    return {
      state,
      isMobile,
      value,
      items,
      onFilterInput,
      createProperty,
      modalCoords,
      onOpen,
      randomPropertyColor,
      modalRootRef,
      colors,
      showOptionModal,
      removeOption,
      changeColorOption,
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
            :placeholder="'Поиск'"
            :noDataText="'Выберите подходящий или создайте новый'"
            :title="'Выберите подходящий или создайте новый'"
            :showNoData="false"
            :filter-key="'name'"
            :multiselect="multiselect"
            v-model="value"
            v-model:filterInput="state.filterInput"
            @update:filterInput="onFilterInput"
            @enterPressed="createProperty"
          >
            <template #item="{ item }">
              <div class="select-item-wrapper">
                <div
                  class="select-item"
                  :style="`background: ${item?.color?.color}`"
                >
                  {{ item?.name }}
                </div>
                <div class="select-item-more-button" @click.stop="showOptionModal($event, item)">
                  <svg-icon class="select-item-icon" name="more" />
                </div>
              </div>
            </template>
            <template #selected-item="{ item }">
              <div class="select-item-wrapper">
                <div
                  class="select-item"
                  :style="`background: ${item?.color?.color}`"
                >
                  {{ item?.name }}
                  <svg-icon class="select-item-icon" name="close-square" />
                </div>
              </div>
            </template>
            <template #bottom="{ text }" v-if="!state.isPropertyExist">
              <div class="create-property">
                <div class="create-property-btn" @click="createProperty(text)">
                  Создать
                </div>
                <div
                  class="create-property-item select-item"
                  :style="`background-color: ${randomPropertyColor?.color}`"
                >
                  {{ text }}
                </div>
              </div>
            </template>
          </MultiSelect>
        </Modal>
      </Teleport>
    </template>
    <template #text="{ item }">
      <div
        class="select-item"
        :style="`background-color: ${item?.color?.color}`"
      >
        {{ item?.name }}
      </div>
    </template>
  </FieldValueWrapper>

  <OptionModal
      z-index="778"
      :title="'Свойства'"
      :translateX="'-50%'"
      :translateY="'20px'"
      v-model="state.isOptionModalVisible"
      :hideOnAction="!isMobile()"
      :option-name="state.activeOption?.name"
      :color="state.activeOption?.color"
      :colors="colors"
      :coords="state.optionModalCoords"
      @remove="removeOption"
      @changeColor="changeColorOption"
      @name-changed="$emit('name-changed', { newName: $event, option: state.activeOption })"
    />
</template>

<style lang="scss" scoped>
.create-property {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 5px;
  margin-top: 5px;

  &-btn {
    padding: 2px 5px;
    font-weight: 400;
    font-size: 12px;
    line-height: 16px;
    color: $color-dark-40;
    border: 1px solid $color-dark-10;
    border-radius: 4px;
    cursor: pointer;
  }

  &-item {
    background-color: $color-primary-10;
  }
}
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
  justify-content: center;
  align-items: center;
  gap: 5px;

  &:hover{
    .select-item-icon {
      font-size: 16px;
      color: $color-dark-40;
      background-color: rgba($color-dark-10, .5);
    }
  }
}
.select-item-icon {
  font-size: 16px;
  color: $color-dark-40;
  border-radius: 4px;
  transition: background-color .3s ease;
}
.select-item-wrapper{
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:hover{
    .select-item-more-button{
      opacity: 1;
      visibility: visible;
    }
  }
}
.select-item-more-button{
  width: 18px;
  height: 18px;
  opacity: 0;
  visibility: hidden;
  cursor: pointer;
  font-size: 18px;
  color: $color-dark-40;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
