<script>
import { watch, watchEffect, ref, computed, onUnmounted } from "vue"
import { useStore } from "vuex"
import { useRoute } from "vue-router"

import Document from "@/components/VDocument.vue"

import { Types as DocumentTypes } from "@/enums/Document.ts";

import { toggleEditDocument } from "@/api/documents.js";
import ProjectItemAdapter from "@/adapters/ProjectItem.js";

const timeToToggleEditDoc = 30*60*1000;
let timeout;

export default {
  components: {
    Document,
  },
  navbar: {
    useDocument: true,
  },
  setup() {
    const store = useStore()
    const route = useRoute()

    const currentDocument = ref();

    const user = computed(() => store.getters["auth/getUser"]);
    const editModeEnabled = computed(
      () => currentDocument.value?.projectItem?.editor?.id === user.value?.id
    );

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
      const documentId = route.params.documentId;

      store.dispatch("documents/setCurrentDocument", null);

      if (documentId) {
        currentDocument.value = await store.dispatch(
          "documents/getCurrentDocument", {
          id: documentId,
          documentType: DocumentTypes.document,
        }
        );
      }
    });

    onUnmounted(() => {
      clearTimeout(timeout);
      document.onmousemove = null;
    })

    const toggleEdit = async () => {
      const res = await toggleEditDocument(currentDocument.value?.projectItem?.id);
      const projectItem = ProjectItemAdapter(res.data.data);
      store.dispatch("documents/setProjectItemToCurrentDocument", projectItem);

      store.dispatch("documents/setEditMode");
    };

    return {
      currentDocument,
    }
  }
}
</script>

<template>
  <Document :currentDocument="currentDocument" />
</template>

<style lang="scss" scoped>

</style>