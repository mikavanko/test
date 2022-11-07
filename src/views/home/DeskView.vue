<script>
import { watch, watchEffect, ref, computed, reactive, onMounted, onUnmounted } from "vue";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import { debounce } from "lodash";
import { Types as DocumentTypes, DocumentViews } from "@/enums/Document.ts";

import Contenteditable from "@/components/VContenteditable.vue";
import DocumentViewsHeader from "@/components/VDocumentViewsHeader.vue";
import Board from "@/components/VBoard.vue";

const defaultTitle = "Untitled";

import { toggleEditDocument } from "@/api/documents.js";
import ProjectItemAdapter from "@/adapters/ProjectItem.js";

const timeToToggleEditDoc = 30*60*1000;
let timeout;

export default {
  components: {
    Contenteditable,
    DocumentViewsHeader,
    Board,
  },
  navbar: {
    useDocument: true,
  },
  setup() {
    const store = useStore();
    const route = useRoute();

    const currentDocument = ref();
    const colors = ref();
    const boardRef = ref();

    const user = computed(() => store.getters["auth/getUser"]);
    const editModeEnabled = computed(
      () => currentDocument.value?.projectItem?.editor?.id === user.value?.id
    );

    const state = reactive({
      title: {
        tag: "div",
        contenteditable: editModeEnabled,
        value: "",
        noNL: false,
        noHTML: true,
        placeholder: "Название",
        spellcheck: true,
        isDocumentDefaultModalVisible: false,
      },
      documentViews: [DocumentViews.desk],
      documentSearch: "",
    });

    watch(editModeEnabled, (val) => {
      if (val) {
        document.onmousemove = function () {
          clearTimeout(timeout);
          timeout = setTimeout(function () {
            document.onmousemove = null;

            toggleEdit();
          }, timeToToggleEditDoc);
        }
      } else {
        clearTimeout(timeout);
        document.onmousemove = null;
      }
    })

    watchEffect(async () => {
      const deskId = route.params.deskId;

      store.dispatch("documents/setCurrentDocument", null);

      if (deskId) {
        currentDocument.value = await store.dispatch(
          "documents/getCurrentDocument",
          {
            id: deskId,
            documentType: DocumentTypes.desk,
          }
        );

        initDesk(currentDocument.value);
      }
    });

    onMounted(() => {
      store
        .dispatch("documents/loadColors")
        .then((res) => (colors.value = res));

      store.dispatch("documents/loadTimeZones");
      store.dispatch("documents/loadTimeFormats");

      // renameMedia(65, 'fuck2.pdf')
    });

    onUnmounted(() => {
      clearTimeout(timeout);
      document.onmousemove = null
    })

    function initDesk(data) {
      // Set title block
      state.title.value =
        data?.projectItem?.name === defaultTitle ? "" : data?.projectItem?.name;
    }

    const toggleEdit = async () => {
      const res = await toggleEditDocument(currentDocument.value?.projectItem?.id);
      const projectItem = ProjectItemAdapter(res.data.data);
      store.dispatch("documents/setProjectItemToCurrentDocument", projectItem);

      store.dispatch("documents/setEditMode");
    };


    function updateDocumentTitle(title) {
      store.dispatch("documents/updateDocumentTitle", {
        projectItemId: currentDocument.value.projectItem.id,
        title,
      });
    }

    const onInputTitle = debounce((val) => {
      const title = val || defaultTitle;
      updateDocumentTitle(title);
    }, 500);

    function addTask(e) {
      const column = currentDocument.value.columns[0]
      const columnIdx = 0
      boardRef.value.addTask(e, column, columnIdx)
    }

    return {
      state,
      currentDocument,
      onInputTitle,
      colors,
      boardRef,
      addTask,
    };
  },
};
</script>

<template>
  <div class="desk-page">
    <contenteditable v-bind="state.title" v-model="state.title.value" class="block-title"
      @update:modelValue="onInputTitle" />

    <div class="document-views">
      <DocumentViewsHeader v-model:documentSearch="state.documentSearch" :documentViews="state.documentViews"
        @add-task="addTask" />

      <Board ref="boardRef" :filter="state.documentSearch" :colors="colors" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.block-title {
  font-weight: 600;
  font-size: 30px;
  line-height: 38px;
  margin-bottom: 16px;
}

.desk-page {
  padding: 32px 24px;
  outline: none;
  -webkit-tap-highlight-color: transparent;
}

@media all and (min-width: $xl) {
  .desk-page {
    padding: 36px 24px 0;
  }

  .block-title {
    font-weight: 600;
    font-size: 40px;
    line-height: 48px;
    margin-bottom: 30px;
    // padding: 0 24px;
  }
}
</style>