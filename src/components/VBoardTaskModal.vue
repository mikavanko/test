<script>
import { reactive, computed, onUpdated, ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useStore } from "vuex";
import { isMobile } from "@/assets/js/utils";
import Modal from "@/components/VModal.vue";
import Task from "@/components/task/Task.vue";
import TaskAdapter from "@/adapters/Task";
import { getTask } from "@/api/desk.js";

export default {
  components: {
    Modal,
    Task,
  },
  emits: ["update:modelValue", "update:name"],
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    menuItems: {
      type: Array,
      default: () => [],
    },
    useFilter: {
      type: Boolean,
      default: false,
    },
    translateX: {
      type: String,
      default: "0%",
    },
    translateY: {
      type: String,
      default: "0%",
    },
    task: {
      type: Object,
      default: () => {},
    },
    columnIndex: {
      type: Number,
      default: null,
    },
    taskIndex: {
      type: Number,
      default: null,
    },
  },
  setup(props, { emit }) {
    const router = useRouter();
    const route = useRoute();
    const store = useStore();

    const isModalVisible = computed({
      get() {
        return props.modelValue;
      },
      set(val) {
        emit("update:modelValue", val);
      },
    });

    const currentDocument = computed(
      () => store.getters["documents/getCurrentDocument"]
    );
    const taskId = computed(() => task.value?.id);
    const columns = computed(() => currentDocument.value.columns);
    const currentColumn = computed(() => {
      return columns.value.find((col) => {
        return col.tasks.find((t) => {
          if (t.id === taskId.value) {
            return t;
          }
        });
      });
    });

    const state = reactive({});

    const title = ref();

    onUpdated((val) => {});

    function maximizeModal() {
      const id = route.params.id;
      const documentId = route.params.deskId;
      const taskId = props.task.id;

      router.push(`/projects/${id}/desks/${documentId}/tasks/${taskId}`);
    }

    const task = ref({});

    watch(isModalVisible, async (val) => {
      if (val) {
        const taskRaw = await getTask(props.task.id);
        task.value = TaskAdapter(taskRaw.data.data);
      } else {
        task.value = null;
      }
    });

    async function reloadTask() {
      const taskRaw = await getTask(props.task.id);
      task.value = TaskAdapter(taskRaw.data.data);
    }

    return {
      state,
      isModalVisible,
      isMobile,
      maximizeModal,
      task,
      currentColumn,
      reloadTask,
    };
  },
};
</script>

<template>
  <Teleport to="body">
    <Modal
      v-model="isModalVisible"
      :showModalTop="isMobile()"
      :width="isMobile() ? '100%' : '972px'"
      :height="isMobile() ? '100%' : '80vh'"
      :padding="'15px'"
      :customBodyClass="'task-modal-body'"
    >
      <div class="task-header">
        <div class="task-header-maximize" @click="maximizeModal">
          <svg-icon name="maximize" class="maximize-icon" />
          Развернуть на всю страницу
        </div>
      </div>
      <div data-simplebar style="min-height: 0; max-height: 100%">
        <div class="task-content">
          <Task
            :task="task"
            :column="currentColumn"
            @update:name="$emit('update:name', $event)"
          />
        </div>
      </div>
    </Modal>
  </Teleport>
</template>

<style lang="scss" scoped>
:deep(.task-modal-body) {
  overflow: hidden;
}
.task-content {
  padding: 88px 115px;
}
.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  &-maximize {
    font-weight: 400;
    font-size: 14px;
    line-height: 17px;
    color: $color-dark-40;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 5px;
    cursor: pointer;

    .maximize-icon {
      font-size: 18px;
    }
  }

  &-actions {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 15px;
  }
  &-action {
    font-weight: 400;
    font-size: 14px;
    line-height: 17px;
    color: $color-dark-70;
    cursor: pointer;

    &_icon {
      font-size: 18px;
    }
  }
}
</style>
