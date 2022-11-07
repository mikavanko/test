<script>
import { reactive, computed, watch, ref, nextTick, onMounted } from "vue";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import { isMobile } from "@/assets/js/utils";
import Contenteditable from "@/components/VContenteditable.vue";
import FieldType from "./FieldType.vue";
import FieldValue from "./FieldValue.vue";
import TaskModalField from "./TaskModalField.vue";
import { Types as DocumentTypes } from "@/enums/Document.ts";

import {
  TYPE,
  TYPE_ICONS,
  NUMBER_FORMAT,
  TIME_ZONES,
  TIME_FORMATS_ID,
} from "./taskProperties";

import {
  getTask,
  deskColumnTaskUpdate,
  deskFieldAddProperties,
  deskFieldRemoveProperties,
  updateFieldProperty,
  addMedia,
  removeMedia,
} from "@/api/desk.js";
import TaskAdapter from "@/adapters/Task";
import FieldAdapter from "@/adapters/Field";
import FieldValueAdapter from "@/adapters/FieldValue";
import OptionAdapter from "@/adapters/Option";
import { debounce, map } from "lodash";

import VText from "./field-value-components/Text.vue";
import VNumber from "./field-value-components/Number.vue";
import VProperty from "./field-value-components/Property.vue";
import VMultiList from "./field-value-components/MultiList.vue";
import VDate from "./field-value-components/Date.vue";
import VPeople from "./field-value-components/People.vue";
import VFile from "./field-value-components/File.vue";
import VCheckbox from "./field-value-components/Checkbox.vue";
import VUrl from "./field-value-components/Url.vue";
import VEmail from "./field-value-components/Email.vue";
import VPhone from "./field-value-components/Phone.vue";

const UNRESERCED_TYPES = {
  status: {
    text: "Статус",
    icon: "arrow-circle",
  },
};

function optionsAdapter(data) {
  return {
    name: data.name,
    color: data.color.id,
  };
}

export default {
  components: {
    Contenteditable,
    FieldType,
    FieldValue,
    TaskModalField,

    VText,
    VNumber,
    VProperty,
    VMultiList,
    VDate,
    VPeople,
    VFile,
    VCheckbox,
    VUrl,
    VEmail,
    VPhone,
  },
  emits: ["update:modelValue", "update:name", "reload-task"],
  props: {
    task: {
      type: Object,
      default: () => ({
        executors: [],
        fields: [],
        id: null,
        name: "",
        order: null,
      }),
    },
    column: {
      type: Object,
      default: () => {},
    },
  },
  setup(props, { emit }) {
    const task = ref({});

    watch(
      () => props.task,
      (val) => {
        task.value = val;
        state.fields = JSON.parse(JSON.stringify(val.fields));
      },
      {
        deep: true,
      }
    );

    const store = useStore();
    const route = useRoute();

    const currentDocument = computed(
      () => store.getters["documents/getCurrentDocument"]
    );
    const columns = computed(() => currentDocument.value?.columns);
    const currentColumnId = ref(null);

    watch(
      () => props.column,
      (col) => {
        currentColumnId.value = col.id;
      }
    );

    const users = computed(() => store.getters["projects/getUsers"]);
    const editMode = computed(() => store.getters["documents/getEditMode"]);

    const title = computed({
      get() {
        return props.task?.name;
      },
      set(val) {
        emit("update:name", val);
      },
    });

    const fieldsRefs = ref([]);
    const titleRef = ref();
    const activeField = ref(null);
    const activeFieldIdx = ref(null);
    const activeFieldCoords = ref(null);

    const state = reactive({
      isTaskModalFieldVisible: false,
      fields: [],
    });

    function addField(e) {
      const deskId = route.params.deskId;
      store
        .dispatch("documents/fieldCreate", {
          desk: deskId,
          name: "Свойство " + (state.fields.length + 1),
          type: TYPE.TEXT,
        })
        .then(async (field) => {
          const fieldValue = FieldValueAdapter({
            field,
          });
          state.fields.push(fieldValue);

          const idx = state.fields.length - 1;

          await nextTick();
          editField(fieldsRefs.value[idx], idx);
        });
    }

    function editField(target, idx) {
      state.isTaskModalFieldVisible = true;
      activeFieldIdx.value = idx;
      activeField.value = state.fields[idx];

      const rect = target.getBoundingClientRect();
      activeFieldCoords.value = {
        x: rect.left,
        y: rect.top + rect.height,
      };
    }

    function updateField({ id, name, type }, params) {
      return store.dispatch("documents/fieldUpdate", {
        deskField: id,
        name,
        type,
        additionalParams: params,
      });
    }

    function defaultFieldValue(field, type) {
      const fieldValue = {
        field,
        value: null,
      };
      switch (type) {
        case TYPE.NUMBER:
          fieldValue.value = {
            format: "NUMBER",
            number: "0",
          };
          break;
        case TYPE.FILE:
          fieldValue.value = [];
          break;
        default:
          fieldValue.value = null;
      }

      return fieldValue;
    }

    function updateFieldType({ type }) {
      let additionalParams = {};
      switch (type) {
        case TYPE.NUMBER:
          additionalParams = {
            numberFormat: NUMBER_FORMAT.NUMBER,
          };
          break;
        case TYPE.PEOPLE:
          additionalParams = {
            personLimit: 0,
          };
          break;
        case TYPE.DATE:
          additionalParams = {
            format: TIME_FORMATS_ID.DEFAULT,
            timezone: TIME_ZONES.MOSCOW,
            hasEnd: false,
          };
          break;
        default:
          break;
      }
      updateField(
        {
          id: state.fields[activeFieldIdx.value].field.id,
          name: state.fields[activeFieldIdx.value].name,
          type: TYPE[type],
        },
        additionalParams
      ).then((field) => {
        state.fields[activeFieldIdx.value] = defaultFieldValue(field, type);
        activeField.value = state.fields[activeFieldIdx.value];

        if (type === TYPE.DATE) {
          emit("reload-task");
        }
      });
    }

    function updateFieldName(name) {
      updateField({
        id: state.fields[activeFieldIdx.value].field.id,
        name: name,
        type: state.fields[activeFieldIdx.value].field.type,
      }).then((field) => {
        state.fields[activeFieldIdx.value] = {
          ...state.fields[activeFieldIdx.value],
          field,
        };
      });
    }

    function updateNumberFormat(format, item, idx) {
      updateField(
        {
          id: item.id,
          name: item.name,
          type: item.type,
        },
        {
          numberFormat: NUMBER_FORMAT[format],
        }
      ).then((field) => {
        state.fields[idx].value.format = format;
      });
    }

    function addListOptions(options, item, idx) {
      activeFieldIdx.value = idx;

      deskFieldAddProperties(item.field.id, map(options, optionsAdapter)).then(
        (res) => {
          const field = FieldAdapter(res.data.data);

          state.fields[activeFieldIdx.value] = {
            ...state.fields[activeFieldIdx.value],
            field,
          };
        }
      );
    }

    function removeListOptions(activeOption, item, idx) {
      activeFieldIdx.value = idx;

      deskFieldRemoveProperties(item.field.id, [activeOption.id]).then(
        (res) => {
          const fieldData = state.fields[activeFieldIdx.value];
          const values = fieldData.value;
          const options = fieldData.field.options

          const optionIdx = options.findIndex(el => el.id === activeOption.id)
          options.splice(optionIdx, 1);

          const valueIdx = values.findIndex(el => el === activeOption.id)

          if(valueIdx > -1){
            values.splice(valueIdx, 1);
          }
        }
      );
    }

    function changeOptionName({newName, option}, item, idx) {
      activeFieldIdx.value = idx;
      
      updateFieldProperty(option.id, { name: newName }).then(
        (res) => {
          const option = OptionAdapter(res.data.data);

          const fieldData = state.fields[activeFieldIdx.value];
          const options = fieldData.field.options

          const optionIdx = options.findIndex(el => el.id === option.id)
          options[optionIdx] = option
        }
      )
    }

    function changeOptionColor({color, option}, item, idx) {
      activeFieldIdx.value = idx;
      
      updateFieldProperty(option.id, { colorId: color.id }).then(
        (res) => {
          const option = OptionAdapter(res.data.data);

          const fieldData = state.fields[activeFieldIdx.value];
          const options = fieldData.field.options

          const optionIdx = options.findIndex(el => el.id === option.id)
          options[optionIdx] = option
        }
      )
    }

    function deleteField(field) {
      state.isTaskModalFieldVisible = false;
      activeFieldIdx.value = null;
      activeField.value = null;

      const idx = state.fields.findIndex(
        (el) => el.field.id === field.field.id
      );
      state.fields.splice(idx, 1);

      store
        .dispatch("documents/fieldDelete", {
          deskField: field.field.id,
        })
        .then((res) => {
          console.log("res", res);
        });
    }
    function duplicateField(field) {
      const deskId = route.params.deskId;
      store
        .dispatch("documents/fieldCreate", {
          desk: deskId,
          name: field.field.name,
          type: field.field.type,
        })
        .then(async (field) => {
          const fieldValue = FieldValueAdapter({
            field,
          });
          state.fields.push(fieldValue);

          state.isTaskModalFieldVisible = false;
          activeFieldIdx.value = null;
          activeField.value = null;
        });
    }

    const updateFieldValueDebounce = debounce((val, item) => {
      updateFieldValue(val, item);
    }, 500);

    async function updateFieldValue(val, { value, field: { type, id } }) {
      const { name, id: taskId } = task.value;
      const fields = [];
      let field = {};

      switch (type) {
        case TYPE.NUMBER:
          field = {
            id,
            value: {
              number: value.number,
            },
          };
          break;
        case TYPE.MULTI_LIST:
          field = {
            id,
            value: map(val, ({ id }) => id),
          };
          break;
        case TYPE.PROPERTY:
          field = {
            id,
            value: val?.id ?? null,
          };
          break;
        case TYPE.PEOPLE:
          field = {
            id,
            value: map(val, ({ id }) => id),
          };
          break;
        case TYPE.DATE:
          field = {
            id,
            value: val,
          };
          break;
        default:
          field = {
            id,
            value,
          };
      }

      fields.push(field);

      const taskRaw = await deskColumnTaskUpdate(taskId, { name, fields });
      task.value = TaskAdapter(taskRaw.data.data);
    }

    async function updateTaskColumn(column) {
      await store.dispatch("documents/deskColumnTaskMove", {
        task: task.value?.id,
        targetTaskId: null,
        columnId: column?.id,
      });

      await updateDocument();
    }

    async function updateDocument() {
      const deskId = route.params.deskId;
      await store.dispatch("documents/getCurrentDocument", {
        id: deskId,
        documentType: DocumentTypes.desk,
      });
    }

    async function addFileHandler(formData, field, idx) {
      const res = await addMedia(field.field.id, task.value.id, formData);
      const resField = FieldValueAdapter(res.data.data);
      state.fields[idx] = resField;
    }

    async function removeFileHandler(file, field, idx) {
      const res = await removeMedia(field.id, [file.id]);
      const resField = FieldValueAdapter(res.data.data);
      state.fields[idx] = resField;
    }

    function setEndDate(val, field, idx) {
      updateField(
        {
          id: field.field.id,
          name: field.field.name,
          type: field.field.type,
        },
        {
          hasEnd: val,
        }
      ).then((field) => {
        state.fields[idx].field = field;
      });
    }

    function updateDateFormat(format, item, idx) {
      updateField(
        {
          id: item.field.id,
          name: item.field.name,
          type: item.field.type,
        },
        {
          format: format.id,
        }
      ).then((field) => {
        state.fields[idx].field = field;
      });
    }

    function toggleTime(hasTime, item, idx) {
      updateField(
        {
          id: item.field.id,
          name: item.field.name,
          type: item.field.type,
        },
        {
          hasTime,
        }
      ).then((field) => {
        state.fields[idx].field = field;
      });
    }

    return {
      state,
      isMobile,
      titleRef,
      title,
      addField,
      editField,
      activeField,
      activeFieldIdx,
      activeFieldCoords,
      UNRESERCED_TYPES,
      TYPE,
      updateFieldType,
      updateFieldName,
      deleteField,
      duplicateField,
      fieldsRefs,
      updateFieldValueDebounce,
      TYPE,
      TYPE_ICONS,
      task,
      FieldValue,
      updateNumberFormat,
      addListOptions,
      removeListOptions,
      changeOptionName,
      changeOptionColor,
      users,
      columns,
      currentColumnId,
      updateTaskColumn,
      addFileHandler,
      removeFileHandler,
      setEndDate,
      updateDateFormat,
      toggleTime,
      editMode,
    };
  },
};
</script>

<template>
  <div class="task">
    <contenteditable
      ref="titleRef"
      class="task-title"
      tag="div"
      placeholder="Название"
      :contenteditable="editMode"
      :noNL="false"
      :noHTML="true"
      :spellcheck="true"
      v-model="title"
    />
    <div class="fields">
      <div class="field">
        <FieldType
          :name="UNRESERCED_TYPES.status.text"
          :icon="UNRESERCED_TYPES.status.icon"
          :iconOpacity="'0.4'"
          :edit-mode="editMode"
        />

        <div class="field-value">
          <VProperty
            v-model="currentColumnId"
            :options="columns"
            :edit-mode="editMode"
            @close="updateTaskColumn($event)"
          />
        </div>
      </div>
      <div
        class="field"
        v-for="(item, idx) of state.fields"
        :key="idx"
        ref="fieldsRefs"
      >
        <FieldType
          :name="item.field.name"
          :icon="TYPE_ICONS[item.field.type]"
          :iconOpacity="item.field.type === TYPE.PROPERTY ? '0.4' : '1'"
          :edit-mode="editMode"
          @[editMode&&`click`]="editField($event.currentTarget, idx)"
        />

        <div class="field-value">
          <VText
            v-if="item.field.type === TYPE.TEXT"
            v-model="item.value"
            :edit-mode="editMode"
            @close="updateFieldValueDebounce($event, item)"
          />
          <VNumber
            v-if="item.field.type === TYPE.NUMBER"
            v-model="item.value.number"
            v-model:format="item.value.format"
            :edit-mode="editMode"
            @update:modelValue="updateFieldValueDebounce($event, item)"
            @update:format="updateNumberFormat($event, item.field, idx)"
          />
          <VProperty
            v-if="item.field.type === TYPE.PROPERTY"
            v-model="item.value"
            :options="item.field.options"
            :edit-mode="editMode"
            @option-add="addListOptions([$event], item, idx)"
            @option-remove="removeListOptions($event, item, idx)"
            @name-changed="changeOptionName($event, item, idx)"
            @color-changed="changeOptionColor($event, item, idx)"
            @close="updateFieldValueDebounce($event, item)"
          />
          <VMultiList
            v-if="item.field.type === TYPE.MULTI_LIST"
            v-model="item.value"
            :options="item.field.options"
            :edit-mode="editMode"
            @option-add="addListOptions([$event], item, idx)"
            @option-remove="removeListOptions($event, item, idx)"
            @name-changed="changeOptionName($event, item, idx)"
            @color-changed="changeOptionColor($event, item, idx)"
            @close="updateFieldValueDebounce($event, item)"
          />
          <VDate
            v-if="item.field.type === TYPE.DATE"
            :value="item.value"
            :has-end="item.field?.additionalData?.hasEnd"
            :has-time="item.field?.additionalData?.hasTime"
            :formatId="item.field?.additionalData?.format"
            :timezoneId="item.field?.additionalData?.timezone"
            :edit-mode="editMode"
            @date-changed="updateFieldValueDebounce($event, item)"
            @switch-range="setEndDate($event, item, idx)"
            @change-format="updateDateFormat($event, item, idx)"
            @toggle-time="toggleTime($event, item, idx)"
          />
          <!-- @update:modelValue="updateFieldValueDebounce($event, item)" -->
          <VPeople
            v-if="item.field.type === TYPE.PEOPLE"
            v-model="item.value"
            :options="users"
            :edit-mode="editMode"
            @close="updateFieldValueDebounce($event, item)"
          />
          <VFile
            v-if="item.field.type === TYPE.FILE"
            v-model="item.value"
            :edit-mode="editMode"
            @upload-file="addFileHandler($event, item, idx)"
            @remove-file="removeFileHandler($event, item, idx)"
          />
          <!-- @update:modelValue="updateFieldValueDebounce($event, item)" -->
          <VCheckbox
            v-if="item.field.type === TYPE.CHECKBOX"
            v-model="item.value"
            :edit-mode="editMode"
            @update:modelValue="updateFieldValueDebounce($event, item)"
          />
          <VUrl
            v-if="item.field.type === TYPE.URL"
            v-model="item.value"
            :edit-mode="editMode"
            @update:modelValue="updateFieldValueDebounce($event, item)"
          />
          <VEmail
            v-if="item.field.type === TYPE.EMAIL"
            v-model="item.value"
            :edit-mode="editMode"
            @close="updateFieldValueDebounce($event, item)"
          />
          <VPhone
            v-if="item.field.type === TYPE.PHONE"
            v-model="item.value"
            :edit-mode="editMode"
            @close="updateFieldValueDebounce($event, item)"
          />
        </div>
      </div>
      <div
        v-if="editMode"
        class="field"
      >
        <div class="field-type add-field" @click="addField">
          <svg-icon class="field-type-icon" name="add" />
          <div class="field-type-name">Добавить свойства</div>
        </div>
      </div>
    </div>

    <TaskModalField
      v-if="activeFieldIdx !== null"
      :coords="isMobile() ? null : activeFieldCoords"
      :field="state.fields[activeFieldIdx]"
      :field-name="state.fields[activeFieldIdx].field.name"
      :format="state.fields[activeFieldIdx].value?.format"
      v-model="state.isTaskModalFieldVisible"
      @update:field="updateFieldType"
      @delete="deleteField(activeField)"
      @duplicate="duplicateField(activeField)"
      @change-name="updateFieldName"
      @modal-close="updateFieldName"
      @update:format="
        updateNumberFormat(
          $event,
          state.fields[activeFieldIdx].field,
          activeFieldIdx
        )
      "
    />
  </div>
</template>

<style lang="scss" scoped>
.task-title {
  font-weight: 600;
  font-size: 40px;
  line-height: 48px;
  margin-bottom: 20px;
}
.fields {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.field {
  display: flex;
  justify-content: flex-start;
  align-items: stretch;
  gap: 10px;

  &-value {
    flex: 1;
    min-width: 0;
  }

  &-type {
    width: 160px;
    min-width: 160px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 5px;
    border-radius: 4px;
    padding: 5px;
    height: 34px;
    cursor: pointer;
    transition: 0.3s ease;

    $p: &;

    &:hover {
      background-color: $color-primary-10;
    }

    &-name {
      font-weight: 400;
      font-size: 14px;
      line-height: 24px;
      color: $color-dark-40;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    &-icon {
      color: $color-dark-40;
      font-size: 18px;
      flex-shrink: 0;
    }

    &.add-field {
      #{$p}-name,
      #{$p}-icon {
        color: $color-dark-20;
      }
    }
  }
}
</style>
