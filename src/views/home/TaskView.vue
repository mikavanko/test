<script>
import { onMounted, ref, computed } from "vue";
import { useStore } from "vuex";
import { useRoute } from "vue-router";

import Task from "@/components/task/Task.vue";

import { getTask, deskColumnTaskUpdate } from "@/api/desk.js";
import { Types as DocumentTypes } from "@/enums/Document.ts";

import TaskAdapter from "@/adapters/Task";

import { debounce } from "lodash";

export default {
  components: {
    Task,
  },
  navbar: {
    visible: true,
  },
  setup() {
    const route = useRoute();
    const store = useStore();
    const task = ref({});
    const taskId = route.params.taskId;
    const currentDocument = ref(null)

    onMounted(async () => {
      store.dispatch("documents/loadTimeZones");
      store.dispatch("documents/loadTimeFormats");
      
      await store.dispatch("documents/loadColors");

      const deskId = route.params.deskId;

      if (deskId) {
        currentDocument.value = await store.dispatch("documents/getCurrentDocument", {
          id: deskId,
          documentType: DocumentTypes.desk,
        });
      }

      await getTask(taskId).then((res) => {
        task.value = TaskAdapter(res.data.data);
      });

    });

    const columns = computed(() => currentDocument.value?.columns);

    const currentColumn = computed(() => {
      return columns.value?.find((col) => {
        return col.tasks.find((t) => {
          if (parseInt(t.id) === parseInt(taskId)) {
            return t;
          }
        });
      });
    });
    
    const onTaskNameInput = debounce(async (name) => {
      deskColumnTaskUpdate(task.value.id, { name }).then((res) => {
        task.value = TaskAdapter(res.data.data);
      });
    }, 500);

    return {
      task,
      onTaskNameInput,
      currentColumn,
      currentDocument,
      columns
    };
  },
};
</script>

<template>
  <div class="task-page">
    <Task :task="task" :column="currentColumn" @update:name="onTaskNameInput" />
  </div>
</template>

<style lang="scss" scoped>
.task-page {
  padding: 36px 24px 0;
}
</style>