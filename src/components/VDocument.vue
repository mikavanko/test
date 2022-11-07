<script>
import { reactive, computed, watch, ref, nextTick } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import { isMobile } from "@/assets/js/utils";
import { debounce } from "lodash";
import { Types as DocumentTypes } from "@/enums/Document.ts";
import DeskAdapter from "@/adapters/Desk.js"

import { useAsyncSetFocus } from "@/assets/js/asyncSetFocus.js";

import Contenteditable from "@/components/VContenteditable.vue";
import DocumentDefault from "@/components/VDocumentDefault.vue";
import DocumentDefaultModal from "@/components/VDocumentDefaultModal.vue";
import DocumentDraggableBlocks from "@/components/VDocumentDraggableBlocks.vue";
import DocumentViewsComponent from "@/components/VDocumentViews.vue";

import { deskCreate } from "@/api/desk";
import router from "../router";

const blockId = "conteneditable";

const block = {
  text: "",
};

function initBlocks() {
  // return [...Array(1)].map(() => ({ ...block }));
  return [];
}

const defaultTitle = "Untitled";

export default {
  components: {
    Contenteditable,
    DocumentDefault,
    DocumentDraggableBlocks,
    DocumentViewsComponent,
    DocumentDefaultModal,
  },
  props: {
    currentDocument: {
      type: Object,
      default: () => null,
    },
  },
  setup(props) {
    const store = useStore();
    const route = useRoute();

    const curentDocumentReactive = computed(
      () => store.getters["documents/getCurrentDocument"]
    );
    const currentProject = computed(
      () => store.getters["projects/getCurrentProject"]
    );
    const user = computed(() => store.getters["auth/getUser"]);
    const editModeEnabled = computed(
      () => curentDocumentReactive.value?.projectItem?.editor?.id === user.value?.id
    );
    const documentType = computed(
      () => store.getters["documents/getDocumentType"]
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
    });

    const blocks = ref(initBlocks());
    const documentViewsRef = ref();

    watch(
      () => props.currentDocument,
      (doc) => {
        // Set title block
        state.title.value =
          doc?.projectItem?.name === defaultTitle ? "" : doc?.projectItem?.name;

        // Reset blocks if new document
        blocks.value = initBlocks();

        // Set blocks
        const b = doc?.blocks;
        if (b && b.length) {
          blocks.value = b;

          store.dispatch("documents/setDocumentType", DocumentTypes.document);
        } else {
          store.dispatch("documents/setDocumentType", DocumentTypes.unset);
        }
      },
      // { deep: true }
    );

    watch(documentType, (type) => {
      switch (type) {
        case DocumentTypes.document:
          if (!blocks.value.length) {
            startBlockMode(-1);
          }
          break;
        case DocumentTypes.desk:
          break;
      }
    });

    function updateDocumentTitle(title) {
      store.dispatch("documents/updateDocumentTitle", {
        projectItemId: props.currentDocument.projectItem.id,
        title,
      });
    }

    const onInputTitle = debounce((val) => {
      const title = val || defaultTitle;
      updateDocumentTitle(title);
    }, 500);

    function insertBlock(idx, block) {
      blocks.value.splice(idx, 0, { ...block });
    }

    function downPressed(idx) {
      useAsyncSetFocus(`${blockId}-${idx}`);
    }

    async function startBlockMode(idx) {
      insertBlock(idx, block);
      downPressed(idx);
    }

    function enterPressedOnTitle(idx) {
      // if type not choosen, force to document
      if (documentType.value === DocumentTypes.unset) {
        store.dispatch("documents/setDocumentType", DocumentTypes.document);
      }

      // downPressed(idx);
      startBlockMode(idx);
    }

    function deleteNoContentPressed(idx) {
      if (idx === 0) {
        useAsyncSetFocus(`${blockId}-title`);

        if (blocks.value.length === 0) {
          store.dispatch("documents/setDocumentType", DocumentTypes.unset);
        }
      }
    }

    async function handleDocumentType(type) {
      store.dispatch("documents/setDocumentType", DocumentTypes[type]);

      const name = state.title.value || defaultTitle;
      
      if(DocumentTypes.desk === type){

        const res = await createDesk(currentProject.value.id, { name })

        const desk = DeskAdapter(res.data.data);
        store.dispatch("documents/pushDocument", desk.projectItem);

        store.dispatch("documents/deleteDocument", props.currentDocument.projectItem.id);

        router.push(`/projects/${currentProject.value.id}/desks/${desk.id}`)
      }else if(DocumentTypes.table === type){
        router.push(`/projects/${currentProject.value.id}/tables/1`)
      }
    }

    function createDesk(id, { name }){
      return deskCreate(currentProject.value.id, { name })
    }

    return {
      state,
      enterPressedOnTitle,
      downPressed,
      // blocks,
      blockId,
      block,
      isMobile,
      editModeEnabled,
      blocks,
      onInputTitle,
      deleteNoContentPressed,
      handleDocumentType,
      DocumentTypes,
      documentType,
      documentViewsRef,
    };
  },
};
</script>

<template>
  <div class="document">
    <contenteditable
      :id="`${blockId}-title`"
      v-bind="state.title"
      v-model="state.title.value"
      class="block-title"
      @enterPressed="enterPressedOnTitle(0)"
      @downPressed="downPressed(0)"
      @update:modelValue="onInputTitle"
    />

    <p
      v-if="
        !isMobile() && documentType === DocumentTypes.unset && !blocks.length
      "
      class="document-subtitle"
      @click="enterPressedOnTitle(0)"
    >
      Нажмите Enter, чтобы продолжить с пустой страницей или выберите шаблон
    </p>
    <p
      v-if="
        isMobile() && documentType === DocumentTypes.unset && !blocks.length
      "
      class="document-subtitle"
      @click="enterPressedOnTitle(0)"
    >
      Нажмите для продолжения
    </p>

    <div
      v-if="isMobile() && documentType === DocumentTypes.unset"
      class="choose-template"
      @click="state.isDocumentDefaultModalVisible = true"
    >
      <svg-icon class="shapes-icon" name="shapes" /> Шаблон заполнения...
      <svg-icon class="arrow-down-icon" name="chevron-down" />
    </div>

    <DocumentDefault
      v-if="documentType === DocumentTypes.unset && !isMobile()"
      @click="handleDocumentType"
    />

    <DocumentDefaultModal
      v-if="isMobile()"
      v-model="state.isDocumentDefaultModalVisible"
    />

    <DocumentDraggableBlocks
      v-if="documentType === DocumentTypes.document"
      v-model="blocks"
      :blockId="blockId"
      :block="block"
      @delete-no-content-pressed="deleteNoContentPressed"
    />

    <DocumentViewsComponent
      ref="documentViewsRef"
      :documentType="documentType"
    />
  </div>
</template>

<style lang="scss" scoped>
.choose-template {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 4px;
  background-color: $color-light-f;
  color: $color-dark-70;

  .shapes-icon {
    font-size: 20px;
  }
  .arrow-down-icon {
    font-size: 18px;
    color: $color-dark-40;
  }
}
.document {
  padding: 32px 24px;
  outline: none;
  -webkit-tap-highlight-color: transparent;
}
.block-title {
  font-weight: 600;
  font-size: 30px;
  line-height: 38px;
  margin-bottom: 16px;
}
.document-subtitle {
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
  color: $color-dark-20;
  margin-bottom: 20px;
}

.block {
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
  margin-bottom: 16px;

  &-wrapper {
    position: relative;

    &:focus {
      z-index: 7;
    }
  }

  &-menu {
    position: fixed;
    top: 0;
    left: 0;
    max-width: 100%;
    height: 42px;
    box-shadow: 0px 0px 20px rgba(34, 34, 34, 0.1);
    background-color: $color-light;
    border-radius: 8px;
    white-space: nowrap;
    justify-content: flex-start;
    align-items: center;
    display: flex;
    visibility: hidden;
    opacity: 0;
    z-index: 9999;

    &.show {
      visibility: visible;
      opacity: 1;
    }

    &__item {
      font-size: 24px;
      font-weight: 400;
      line-height: 17px;
      color: $color-dark-70;
      width: 42px;
      justify-content: center;
      display: flex;
      cursor: pointer;

      &:not(:last-child) {
        border-right: 1px solid $color-dark-10;
      }

      .move-down-icon {
        transform: rotate(180deg);
      }
    }
  }

  &-handle {
    display: none;
  }
}

@media all and (min-width: $xl) {
  .document {
    padding: 36px 24px 0;
  }

  .block-title {
    font-weight: 600;
    font-size: 40px;
    line-height: 48px;
    margin-bottom: 30px;
  }

  .block {
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;

    &-wrapper {
      margin-left: -120px;
      padding-left: 120px;

      &:hover {
        .block-handle {
          display: flex;
        }
      }
    }

    &-menu {
      width: 227px;
      padding: 8px 10px;
      display: block;
      height: auto;

      &__item {
        padding: 5px 10px;
        width: 100%;
        display: flex;
        justify-content: flex-start;

        &::after {
          content: attr(text);
          font-weight: 400;
          font-size: 12px;
          line-height: 17px;
        }

        &:not(:last-child) {
          margin-bottom: 4px;
          border: none;
        }
      }

      &__icon {
        font-size: 17px;
        margin-right: 10px;
      }
    }
  }

  .block-handle {
    position: absolute;
    top: 0;
    left: 96px;
    cursor: grab;
    font-size: 24px;
    color: $color-dark-20;
    width: 24px;
    height: 24px;
    font-size: 24px;
    display: none;

    &::before {
      content: "";
      display: block;
      position: absolute;
      z-index: -1;
      top: 0;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      background-color: $color-light-f;
      border-radius: 4px;
      width: 18px;
    }

    &:active {
      &::before {
        background-color: $color-dark-10;
      }
    }
  }
}
</style>