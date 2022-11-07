<script>
import { watchEffect, ref, computed, reactive, onMounted } from "vue";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import { debounce } from "lodash";
import { Types as DocumentTypes, DocumentViews } from "@/enums/Document.ts";

import Contenteditable from "@/components/VContenteditable.vue";
import DocumentViewsHeader from "@/components/VDocumentViewsHeader.vue";

import VTable from "@/components/VTable.vue";

const defaultTitle = "Untitled";

export default {
  components: {
    Contenteditable,
    DocumentViewsHeader,
    VTable,
  },
  navbar: {
    useDocument: true,
  },
  setup() {
    const store = useStore();
    const route = useRoute();

    const currentDocument = ref();
    const colors = ref();

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

    onMounted(() => {
      store
        .dispatch("documents/loadColors")
        .then((res) => (colors.value = res));

      store.dispatch("documents/loadTimeZones");
      store.dispatch("documents/loadTimeFormats");
    });

    function initDesk(data) {
      // Set title block
      state.title.value =
        data?.projectItem?.name === defaultTitle ? "" : data?.projectItem?.name;
    }

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

    function addTask(e){
    }

    return {
      state,
      currentDocument,
      onInputTitle,
      colors,
      addTask,
    };
  },
};
</script>

<template>
  <div class="desk-page">
    <contenteditable
      v-bind="state.title"
      v-model="state.title.value"
      class="block-title"
      @update:modelValue="onInputTitle"
    />

    <div class="document-views">
      <DocumentViewsHeader
        v-model:documentSearch="state.documentSearch"
        :documentViews="state.documentViews"
        @add-task="addTask"
      />

      <VTable />
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