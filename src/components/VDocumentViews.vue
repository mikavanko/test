<script>
import { reactive, watch } from "vue";
import { useRoute } from "vue-router";
import DocumentViewsHeader from "@/components/VDocumentViewsHeader.vue";
import Board from "@/components/VBoard.vue";

import { Types as DocumentTypes, DocumentViews } from "@/enums/Document.ts";

export default {
  components: {
    DocumentViewsHeader,
    Board,
  },
  props: {
    documentType: {
      type: String,
      default: DocumentTypes.unset,
    },
  },
  setup(props, { expose }) {
    const route = useRoute();

    watch(
      () => route.params.documentId,
      () => {
        state.documentSearch = "";
      }
    );

    const state = reactive({
      //захардкодил пока есть только доска
      documentViews: [DocumentViews.desk],
      documentSearch: "",
    });

    function addDocumentView(view) {
      if (DocumentViews[view]) {
        state.documentViews.push(DocumentViews[view]);
      }
    }

    expose({
      addDocumentView,
    });

    return {
      state,
      DocumentTypes,
    };
  },
};
</script>

<template>
  <div class="document-views">
    <DocumentViewsHeader
      v-if="
        //захардкодил пока есть только доска
        state.documentViews.length &&
        $props.documentType === DocumentTypes.desk
      "
      v-model:documentSearch="state.documentSearch"
      :documentViews="state.documentViews"
    />

    <Board
      v-if="$props.documentType === DocumentTypes.desk"
      :filter="state.documentSearch"
    />
  </div>
</template>

<style lang="scss" scoped>
</style>