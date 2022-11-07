<script>
import { reactive, computed, watch } from "vue";
import { useStore } from "vuex";
import { isMobile } from "@/assets/js/utils";
import Modal from "@/components/VModal.vue";
import Switch from "@/components/VSwitch.vue";

import GlobalSearchIcon from "@/assets/icons/svg/global-search.svg";

import { useToast } from 'vue-toastification';
import ErrorAdapter from "@/adapters/Error";

import ProjectItemAdapter from "@/adapters/ProjectItem.js";
import { toggleLinkDocument, regenerateLinkDocument } from "@/api/documents.js";

export default {
  emits: ["update:isVisible"],
  props: {
    isVisible: {
      type: Boolean,
      default: false,
    },
    coords: {
      type: Object,
      default: () => null,
    },
  },
  setup(props, { emit }) {
    const toast = useToast();
    watch(
      () => props.isVisible,
      (val) => {
        state.showModal = val;
      }
    );

    const store = useStore();

    const currentDocument = computed(
      () => store.getters["documents/getCurrentDocument"]
    );
    const isLinkAvailable = computed(
      () => currentDocument.value?.projectItem?.link?.isAvailable
    );

    let isModalVisible = computed({
      get() {
        return props.isVisible || state.showModal;
      },
      set(val) {
        state.showModal = val;
        emit("update:isVisible", val);
      },
    });

    const state = reactive({
      showModal: props.isVisible,
      isSwitchOn: isLinkAvailable,
    });

    const onToggleSwitch = async (val) => {
      const id = currentDocument.value?.projectItem?.id;
      let res = await toggleLinkDocument(id);

      if (!val) {
        res = await regenerateLinkDocument(id);
      }

      const projectItem = ProjectItemAdapter(res.data.data);
      store.dispatch("documents/setProjectItemToCurrentDocument", projectItem);
      store.dispatch("documents/updateDocument", projectItem);
    };

    const copyLinkDocument = () => {
      const link = currentDocument.value?.projectItem?.link?.link;
      navigator.clipboard
        .writeText(link)
        .then(() => {
          console.log("Copy Success");
        })
        .catch((err) => {
          const error = ErrorAdapter(err);

          if (error) {
            toast.error(error.message)
          }
        });
    };

    return {
      isMobile,
      isModalVisible,
      state,
      onToggleSwitch,
      currentDocument,
      copyLinkDocument,
    };
  },
  components: {
    Modal,
    Switch,
    GlobalSearchIcon,
  },
};
</script>

<template>
  <Modal
    id="modal-document-share"
    :title="'Поделиться'"
    v-model="isModalVisible"
    :showModalTop="isMobile()"
    :width="isMobile() ? '100%' : '500px'"
    :height="isMobile() ? '100%' : 'auto'"
    :customBodyClass="isMobile() ? 'mob-body-class' : 'desktop-body-class'"
    :customWrapperClass="isMobile() ? '' : 'desktop-wrapper-class'"
    :style="{
      '--top': coords?.y + 'px',
      '--left': coords?.x + 'px',
    }"
  >
    <div class="share-switch">
      <GlobalSearchIcon class="global-search-icon" />
      <div class="share-switch-text">
        <h2 class="share-switch-h2">Публичный доступ к документу</h2>
        <p class="share-switch-p">Пользователи ссылкой могут просматривать</p>
      </div>
      <Switch
        class="share-switch-switch"
        :modelValue="state.isSwitchOn"
        @update:modelValue="onToggleSwitch"
      />
    </div>

    <div class="share-input-wrapper" v-if="state.isSwitchOn">
      <input
        ref="copyInput"
        type="text"
        class="share-input"
        :value="currentDocument?.projectItem?.link?.link"
        readonly
      />
      <button class="share-copy-btn" @click="copyLinkDocument">
        Скопировать
      </button>
    </div>
  </Modal>
</template>

<style lang="scss" scoped>
.desktop-wrapper-class {
  :deep(.modal-bg) {
    background-color: transparent;
  }
  :deep(.modal) {
    transform: none;
    top: 60px;
    left: auto;
    right: 20px;
  }
}
:deep(.desktop-body-class) {
  padding: 20px;
}

.global-search-icon {
  font-size: 24px;
  color: $color-dark;
  margin-right: 8px;
}
.share-switch {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}
.share-switch-switch {
  margin-left: auto;
}
.share-switch-text {
}
.share-switch-h2 {
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
}
.share-switch-p {
  font-weight: 400;
  font-size: 11px;
  line-height: 13px;
  color: $color-dark-40;
}

.share {
  &-input {
    @include clear-input;
    height: 30px;
    line-height: 30px;
    padding: 0 8px;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    color: $color-dark-70;
    border: 1px solid $color-dark-20;
    border-right: none;
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
    width: 100%;
    margin-right: -5px;

    &:read-only {
      color: $color-dark-40;
    }

    &-wrapper {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      margin-top: 24px;

      @media all and (min-width: $xl) {
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid $color-dark-10;
      }
    }
  }

  &-copy-btn {
    @include button-primary-small;
  }
}
</style>