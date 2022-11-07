<script>
import { reactive, ref, computed, nextTick, watch } from "vue";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";

import Draggable from "vuedraggable";

import AddIcon from "@/assets/icons/svg/add.svg";
import AddSquareIcon from "@/assets/icons/svg/add-square-3.svg";

import BoardTaskCard from "@/components/board-task-card/BoardTaskCard.vue";
import BoardGroup from "@/components/board-group/BoardGroup.vue";
import Modal from "@/components/VModal.vue";
import BoardTaskModal from "@/components/VBoardTaskModal.vue";

import { boardData } from "@/mocks/document.js";

import { isMobile } from "@/assets/js/utils";
import { cloneDeep, debounce } from "lodash";

import ErrorAdapter from "@/adapters/Error";
import { useToast } from 'vue-toastification';

export default {
  components: {
    Draggable,
    AddIcon,
    AddSquareIcon,
    BoardTaskCard,
    BoardGroup,
    Modal,
    BoardTaskModal,
  },
  props: {
    filter: {
      type: String,
      default: "",
    },
    colors: {
      type: Array,
      default: () => [],
    }
  },
  setup(props) {
    const store = useStore();
    const route = useRoute();
    const router = useRouter();
    const toast = useToast();

    const addGroupInputRef = ref();

    const isSidebarMenuVisible = computed(
      () => store.getters["menu/isVisible"]
    );
    const currentDocument = computed(
      () => store.getters["documents/getCurrentDocument"]
    );
    const user = computed(() => store.getters["auth/getUser"]);
    const isCurrentDocumentEditable = computed(
      () => currentDocument.value?.projectItem?.editor?.id === user.value?.id
    );
    const filteredGroups = computed({
      get() {
        if (!props.filter) {
          return columns.value;
        } else {
          const fGroups = columns.value.map((el) => {
            const newEl = { ...el };
            const tasks = el.tasks.filter((f) => {
              return (
                f.name.toLowerCase().indexOf(props.filter.toLowerCase()) !== -1
              );
            });
            newEl.tasks = tasks;
            return newEl;
          });

          return fGroups;
        }
      },
      set(val) {
        columns.value = val;
      },
    });

    const columns = ref([]);

    watch(
      () => currentDocument.value?.columns,
      (val) => {
        columns.value = cloneDeep(currentDocument.value?.columns || []);
      },
      {
        deep: true,
      }
    );

    const state = reactive({
      // groups: columns,
      isAddGroupModalVisible: false,
      addGroupInput: "",
      isTaskModalOpen: false,
      activeTask: null,
      editableTask: {},
    });

    async function addTask(e, column, columnIdx) {
      if(isCurrentDocumentEditable.value){
        await store.dispatch("documents/deskColumnTaskCreate", {
          column: column.id,
          name: "Untitled",
        });

        const taskColumn = columns.value[columnIdx];
        const task = cloneDeep(taskColumn.tasks[taskColumn.tasks.length - 1]);
        setEditableTask(task);
      }
    }

    function setEditableTask(task) {
      state.editableTask = task;
      state.editableTask.edit = true;
    }

    function onTaskTitleBlur() {
      state.editableTask = {};
    }

    function addGroup(name) {
      store.dispatch("documents/deskColumnCreate", { name });
    }

    async function onUpdateGroupDrag(e) {
      const newIndex = e.newIndex;
      const targetColumnId = newIndex !== 0 ? columns.value[newIndex - 1].id : null;
      const columnId = columns.value[newIndex].id;

      await store.dispatch("documents/deskColumnMove", {
        columnId,
        targetColumnId,
      });
      updateColumns();
    }
    async function onUpdateTaskDrag(e, column) {
      const el = e.added || e.moved;
      if (el) {
        const taskId = el.element.id;
        const columnId = column.id;
        const targetTaskIdx = el.newIndex - 1;
        const targetTaskId =
          targetTaskIdx < 0 ? null : column.tasks[targetTaskIdx].id;

        await store.dispatch("documents/deskColumnTaskMove", {
          task: taskId,
          targetTaskId,
          columnId,
        });
        updateColumns();
      }
    }
    function updateColumns() {
      const curDocCloned = cloneDeep(currentDocument.value);
      const columnsCloned = cloneDeep(columns.value);
      curDocCloned.columns = columnsCloned;
      store.dispatch("documents/setCurrentDocument", curDocCloned);
    }

    async function showAddGroupModal() {
      state.isAddGroupModalVisible = true;
      await nextTick();
      addGroupInputRef.value.focus();
    }

    function addGroupSubmitHandler(e) {
      addGroup(state.addGroupInput);
      state.isAddGroupModalVisible = false;
      state.addGroupInput = "";
    }

    function openTaskModal(e, task, columnIndex, taskIndex) {
      if (isMobile()) {
        const id = route.params.id;
        const deskId = route.params.deskId;
        router.push(`/projects/${id}/desks/${deskId}/tasks/${task.id}`);
      } else {
        state.isTaskModalOpen = true;
        state.activeTask = task;
        state.activeTask.columnIndex = columnIndex;
        state.activeTask.taskIndex = taskIndex;
      }
    }

    const onTaskNameInput = debounce(
      async (name, task, columnIndex, taskIndex) => {
        store.dispatch("documents/deskColumnTaskUpdate", {
          taskId: task.id,
          name,
          columnIndex,
          taskIndex,
        });
      },
      500
    );

    function removeTask(task, columnIdx, taskIdx) {
      store.dispatch("documents/deskColumnTaskDelete", {
        task,
        columnIdx,
        taskIdx,
      });
    }

    function duplicateTask(task, columnIdx, taskIdx) {
      store.dispatch("documents/deskColumnTaskCreate", {
        column: columns.value[columnIdx].id,
        name: task.name,
      });
    }

    function copyTaskLink(task) {
      const link = `${location.href}/tasks/${task.id}`;
      navigator.clipboard
        .writeText(link)
        .then(() => {})
        .catch((err) => {
          const error = ErrorAdapter(err);

          if (error) {
            toast.error(error.message)
          }
        });
    }
    function openTaskInNewTab(task) {
      const link = `${route.path}/tasks/${task.id}`;
      window.open(link, '_blank');
    }
    function renameTask(e, task) {
      e.stopPropagation();

      setEditableTask(task);
    }

    function updateGroupColor(color, column, columnIdx){
      column.color = color;
      store.dispatch("documents/deskColumnSetColor", {color, column: column.id, columnIdx})
    }

    async function moveToOtherList(e, columnIdx) {
      e.item.remove()
    }

    return {
      state,
      filteredGroups,
      addTask,
      addGroup,
      onUpdateGroupDrag,
      onUpdateTaskDrag,
      isSidebarMenuVisible,
      isMobile,
      addGroupSubmitHandler,
      showAddGroupModal,
      addGroupInputRef,
      openTaskModal,
      columns,
      onTaskNameInput,
      removeTask,
      duplicateTask,
      copyTaskLink,
      openTaskInNewTab,
      renameTask,
      onTaskTitleBlur,
      updateGroupColor,
      isCurrentDocumentEditable,
      moveToOtherList,
    };
  },
};
</script>

<template>
  <div class="board">
    <div
      :class="[
        'board-horizontal-scroll',
        { 'full-width': !isSidebarMenuVisible },
      ]"
      data-simplebar
    >
      <div class="board-horizontal-scroll-inner">
        <Draggable
          class="board-groups"
          v-model="filteredGroups"
          group="groups"
          item-key="group"
          :animation="200"
          ghostClass="board-group_ghost"
          handle=".board-group-handle"
          draggable=".board-group-draggable"
          :delay="isMobile() ? 300 : 0"
          :disabled="!isCurrentDocumentEditable"
          @update="onUpdateGroupDrag"
        >
          <template #item="{ element, index }">
            <BoardGroup
              class="board-group"
              v-bind="element"
              :colors="$props.colors"
              :count="element.tasks.length"
              :class="'board-group-draggable'"
              :handleClass="'board-group-handle'"
              @update:group-color="updateGroupColor($event, element, index)"
              @add-task="addTask($event, element, index)"
            >
              <!-- Если нужно чтобы первую колонку нельзя было драгать -->
              <!-- :class="[{ 'board-group-draggable': index !== 0 }]"
              :handleClass="{ 'board-group-handle': index !== 0 }" -->
              <Draggable
                tag="ul"
                v-model="element.tasks"
                item-key="task"
                class="board-group__draggable"
                :delay="isMobile() ? 300 : 0"
                :disabled="!isCurrentDocumentEditable"
                @change="onUpdateTaskDrag($event, element)"
                ghostClass="board-task_ghost"
                chosenClass="board-task_choosen"
                dragClass="board-task_drag"
                :group="{ name: 'tasks', put: true }"
                >
                <template #item="task">
                  <template v-if="task.element.id === state.editableTask.id">
                    <BoardTaskCard
                      tag="li"
                      v-model="task.element.name"
                      v-bind="task.element"
                      v-model:edit="state.editableTask.edit"
                      @title-blur="onTaskTitleBlur"
                      @update:modelValue="
                        onTaskNameInput($event, task.element, index, task.index)
                      "
                      @click="
                        openTaskModal($event, task.element, index, task.index)
                      "
                      @remove-task="removeTask(task.element, index, task.index)"
                      @duplicate-task="
                        duplicateTask(task.element, index, task.index)
                      "
                      @copy-task-link="copyTaskLink(task.element)"
                      @open-task-in-new-tab="openTaskInNewTab(task.element)"
                      @rename-task="renameTask($event, task.element)"
                      @edit-properies="openTaskModal($event, task.element, index, task.index)"
                    />
                  </template>
                  <template v-else>
                    <BoardTaskCard
                      tag="li"
                      v-model="task.element.name"
                      v-bind="task.element"
                      @update:modelValue="
                        onTaskNameInput($event, task.element, index, task.index)
                      "
                      @click="
                        openTaskModal($event, task.element, index, task.index)
                      "
                      @remove-task="removeTask(task.element, index, task.index)"
                      @duplicate-task="
                        duplicateTask(task.element, index, task.index)
                      "
                      @copy-task-link="copyTaskLink(task.element)"
                      @open-task-in-new-tab="openTaskInNewTab(task.element)"
                      @rename-task="renameTask($event, task.element)"
                      @edit-properies="openTaskModal($event, task.element, index, task.index)"
                    />
                  </template>
                </template>
                <template #footer>
                  <div
                    class="board-group__add"
                    @click="addTask($event, element, index)"
                  >
                    <AddIcon class="board-group__add-icon" />
                    Добавить
                  </div>
                </template>
              </Draggable>
            </BoardGroup>
          </template>
        </Draggable>
        <div class="board-group-add">
          <div class="add-group" @click="showAddGroupModal">
            <AddSquareIcon class="add-square-icon" />
          </div>
        </div>
      </div>
    </div>
    <Teleport to="body">
      <Modal
        v-model="state.isAddGroupModalVisible"
        :showModalTop="isMobile()"
        :width="isMobile() ? '100%' : '260px'"
        :height="isMobile() ? '100%' : 'auto'"
        :bgColor="'transparent'"
        :translateX="'-100%'"
        :translateY="'20px'"
        :captureClick="!isMobile()"
        :padding="'10px 10px 10px 20px'"
      >
        <form class="add-group-form" @submit.prevent="addGroupSubmitHandler">
          <input
            class="add-group-input"
            ref="addGroupInputRef"
            type="text"
            v-model="state.addGroupInput"
          />
          <button class="add-group-submit" type="submit">Создать</button>
        </form>
      </Modal>
    </Teleport>
    <BoardTaskModal
      v-model="state.isTaskModalOpen"
      :task="state.activeTask"
      @update:name="
        onTaskNameInput(
          $event,
          state.activeTask,
          state.activeTask.columnIndex,
          state.activeTask.taskIndex
        )
      "
    />
  </div>
</template>

<style lang="scss" scoped>
.add-group {
  &-form {
    display: flex;
    gap: 10px;
  }

  &-input {
    @include clear-input;
  }

  &-submit {
    @include button-primary-small;
  }
}

// desktop vars START
$outer-width: calc(100vw - $menuWidthDesktop);
$dynamic-content-padding: calc(($outer-width - 100%) / 2);
// desktop vars END

.board-horizontal-scroll {
  width: 100vw;
  transform: translateX(-50%);
  left: 50%;

  &.full-width {
    width: 100vw;
  }

  &-inner {
    display: flex;
    max-width: 900px;
    margin: 0 auto;
    padding: 0 24px 36px 24px;
    min-height: 100vh;
  }

  :deep(.simplebar-track.simplebar-horizontal) {
    position: sticky;
    left: -24px;
    right: -24px;
    bottom: 0;
  }

  @media all and (min-width: $xl) {
    width: $outer-width;
  }
}

.board-group-add {
  padding-right: 24px;

  .add-group {
    cursor: pointer;
  }

  .add-square-icon {
    font-size: 18px;
    color: $color-dark-40;
  }

  @media all and (min-width: $xl) {
    padding-right: $dynamic-content-padding;
  }
}

.board-group {
  position: relative;

  &__draggable{
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  &__add {
    color: $color-dark-40;
    font-weight: 400;
    font-size: 14px;
    line-height: 18px;
    height: 42px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: 12px 10px;
    cursor: pointer;
    border-radius: 4px;
    order: 9999;

    &-icon {
      font-size: 18px;
      margin-right: 4px;
    }

    &:hover {
      background-color: $color-primary-10;
    }
  }
}

.board-groups {
  display: flex;
  gap: 15px;
  justify-content: flex-start;
  align-items: flex-start;
  margin-right: 15px;
}
</style>
