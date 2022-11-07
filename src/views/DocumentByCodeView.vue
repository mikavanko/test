<script>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { getDocumentByCode } from "@/api/documents.js";
import DocumentAdapter from "@/adapters/Document.js";

import Document from "@/components/VDocument.vue";

export default {
  components: {
    Document,
  },
  setup() {
    const route = useRoute();

    const currentDocument = ref();

    onMounted(() => {
      const code = route.query.url_code || null;
      if (code) {
        getDocumentByCode(code).then((res) => {
          currentDocument.value = DocumentAdapter(res.data.data);
        });
      }
    });

    return {
      currentDocument,
    };
  },
};
</script>

<template>
  <Document :currentDocument="currentDocument" noNavBar />
</template>

<style lang="scss" scoped>
</style>