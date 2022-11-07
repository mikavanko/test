<script>
import { reactive, computed, ref } from "vue";
import { isMobile } from "@/assets/js/utils";
import FieldValueWrapper from "../FieldValueWrapper.vue";
import Modal from "@/components/VModal.vue";
import { FILE_TYPE, FILE_TYPE_EXTENSION } from "../taskProperties";
import SvgIcon from "../../global/SvgIcon.vue";
import { useToast } from "vue-toastification";
const toast = useToast();

const ADD_FILE_KEYS = {
  LOAD_FILE: "load-file",
  LOAD_LINK: "load-link",
};

export default {
  components: {
    FieldValueWrapper,
    Modal,
    SvgIcon,
  },
  emits: ["update:modelValue", "upload-file", "remove-file"],
  props: {
    modelValue: {
      type: null,
    },
    editMode: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    const modalRootRef = ref(null);
    const inputFileRef = ref(null);
    const fileLinkInputRef = ref(null);

    const value = computed({
      get() {
        return props.modelValue;
      },
      set(val) {
        emit("update:modelValue", val);
      },
    });

    const files = computed(() => {
      return value.value.map((v) => {
        const extension = v.name.split(".").reverse()[0];
        let type = null;
        let icon = null;

        if (FILE_TYPE_EXTENSION.IMAGE.includes(extension)) {
          type = FILE_TYPE.IMAGE;
          icon = null;
        } else {
          type = FILE_TYPE.DOC;
          icon = "doc-file";
        }

        return {
          ...v,
          extension,
          type,
          icon,
        };
      });
    });

    const state = reactive({
      isActive: false,
      isAddFileModalVisible: false,
      isMenuFileModalVisible: false,
      addFileModalOptions: [
        {
          name: "Загрузить",
          key: ADD_FILE_KEYS.LOAD_FILE,
        },
        {
          name: "Вставить ссылку",
          key: ADD_FILE_KEYS.LOAD_LINK,
        },
      ],
      activeAddFileModalOption: ADD_FILE_KEYS.LOAD_FILE,
    });

    const activeFile = ref(null);

    const modalCoords = ref({});
    const addFileModalCoords = ref({});
    const menuFileModalCoords = ref({});

    function onOpen(e) {
      const rect = e.currentTarget.getBoundingClientRect();
      modalCoords.value = {
        x: rect.x,
        y: rect.y,
      };
    }

    function openAddFileModal(e) {
      const rect = e.currentTarget.getBoundingClientRect();
      addFileModalCoords.value = {
        x: rect.x + rect.width / 2,
        y: rect.y + rect.height,
      };

      state.isAddFileModalVisible = true;
    }

    function handleFileUpload(e) {
      const file = inputFileRef.value.files[0];
      const formData = new FormData();
      formData.append("media", file);

      emit("upload-file", formData);

      state.isAddFileModalVisible = false;
    }

    function openMenuFileModal(e, file) {
      activeFile.value = file;
      menuFileModalCoords.value = {
        x: e.clientX,
        y: e.clientY,
      };

      state.isMenuFileModalVisible = true;
    }

    function hideMenuFileModal() {
      state.isMenuFileModalVisible = false;
    }

    function downloadFile() {
      window.open(activeFile.value.originalUrl);
      hideMenuFileModal();
    }

    function openFile() {
      window.open(activeFile.value.originalUrl);
      hideMenuFileModal();
    }

    function renameFile() {
      hideMenuFileModal();
    }

    function removeFile() {
      emit("remove-file", activeFile.value);
      hideMenuFileModal();
    }

    function toggleActiveAddFileModalOption(key) {
      state.activeAddFileModalOption = key;
    }

    function addFileModalCloseHandler() {
      state.activeAddFileModalOption = ADD_FILE_KEYS.LOAD_FILE;
    }

    async function submitAddFileModalForm(e) {
      const url = fileLinkInputRef.value.value;

      const ext = getFileExtension(url);
      const dotExt = ext ? `.${ext}` : "";
      const fileName = getFilename(url);

      fetch(url)
        .then(async (r) => {
          const blob = await r.blob();
          const metadata = {
            type: blob.type,
          };

          const file = new File([blob], `${fileName}${dotExt}`, metadata);

          const formData = new FormData();
          formData.append("media", file);

          emit("upload-file", formData);
        })
        .catch((err) => {
          toast.error(err.message);
        });

      state.isAddFileModalVisible = false;
    }

    function getFileExtension(pathname) {
      return /[.]/.exec(pathname) ? /[^.]+$/.exec(pathname)[0] : undefined;
    }

    function getFilename(url) {
      if (url) {
        var m = url.toString().match(/.*\/(.+?)\./);
        if (m && m.length > 1) {
          return m[1];
        }
      }
      return "file";
    }

    return {
      state,
      isMobile,
      value,
      files,
      modalCoords,
      addFileModalCoords,
      menuFileModalCoords,
      onOpen,
      modalRootRef,
      inputFileRef,
      openAddFileModal,
      handleFileUpload,
      FILE_TYPE,
      openMenuFileModal,
      downloadFile,
      openFile,
      renameFile,
      removeFile,
      toggleActiveAddFileModalOption,
      ADD_FILE_KEYS,
      addFileModalCloseHandler,
      submitAddFileModalForm,
      fileLinkInputRef,
    };
  },
};
</script>

<template>
  <FieldValueWrapper
    :value="files"
    :clickOutside="false"
    :editMode="editMode"
    v-model:isActive="state.isActive"
    @open="onOpen"
  >
    <template #component="{ setFocusRef }">
      <!-- :ref="(el) => setFocusRef(el)" -->
      <Teleport to="body">
        <Modal
          ref="modalRootRef"
          v-model="state.isActive"
          :showModalTop="isMobile()"
          :width="isMobile() ? '100%' : '547px'"
          :height="isMobile() ? '100%' : 'auto'"
          :padding="'0'"
          :bgColor="'transparent'"
          :coords="modalCoords"
          @modal-close="$emit('close', value)"
          autoPositionMode
        >
          <div class="file-viewer" v-if="files.length">
            <div class="file-viewer-content" data-simplebar>
              <div class="file-viewer-item-wrapper">
                <div
                  class="file-viewer-item"
                  v-for="item in files"
                  :key="item.id"
                >
                  <template v-if="FILE_TYPE.IMAGE === item.type">
                    <div class="file-viewer-item-img">
                      <img :src="item.originalUrl" :alt="item.originalUrl" />
                    </div>
                  </template>
                  <template v-else-if="FILE_TYPE.DOC === item.type">
                    <svg-icon class="file-viewer-item-icon" :name="item.icon" />
                    <div class="file-viewer-item-name">
                      {{ item.name }}
                    </div>
                  </template>
                  <div
                    class="file-viewer-item-more"
                    @click="openMenuFileModal($event, item)"
                  >
                    <svg-icon class="file-viewer-item-more-icon" name="more" />
                  </div>
                </div>
              </div>
            </div>
            <div class="file-viewer-add" @click="openAddFileModal">
              <svg-icon class="file-viewer-add-icon" name="add" />
              Добавить фото или файл
            </div>
          </div>
          <div class="file-empty" v-else>
            <div class="file-empty-add" @click="openAddFileModal">
              <svg-icon class="file-empty-add-icon" name="add" />
              Фото или файл
            </div>
          </div>
        </Modal>
      </Teleport>
    </template>
    <template #text="{ item }">
      <div class="selected-file">
        <div class="image" v-if="FILE_TYPE.IMAGE === item.type">
          <img :src="item.originalUrl" :alt="item.originalUrl" />
        </div>
        <div class="doc" v-else-if="FILE_TYPE.DOC === item.type">
          <div class="selected-file-name">{{ item.name }}</div>
        </div>
      </div>
    </template>
  </FieldValueWrapper>

  <Teleport to="body">
    <Modal
      ref="modalAddFileRef"
      v-model="state.isAddFileModalVisible"
      :showModalTop="isMobile()"
      :width="isMobile() ? '100%' : '300px'"
      :height="isMobile() ? '100%' : 'auto'"
      :padding="'0'"
      :coords="addFileModalCoords"
      :customModalClass="'custom-modal-upload'"
      bgColor="transparent"
      zIndexModalWrapper="778"
      autoPositionMode
      translateX="-50%"
      translateY="0"
      @modal-close="addFileModalCloseHandler"
    >
      <div class="upload">
        <div class="upload-tabs">
          <div
            :class="[
              'upload-tabs-item',
              { active: state.activeAddFileModalOption === item.key },
            ]"
            v-for="(item, idx) of state.addFileModalOptions"
            :key="idx"
            @click="toggleActiveAddFileModalOption(item.key)"
          >
            {{ item.name }}
          </div>
        </div>
        <div class="upload-body">
          <form class="upload-form" @submit.prevent="submitAddFileModalForm">
            <template
              v-if="state.activeAddFileModalOption === ADD_FILE_KEYS.LOAD_FILE"
            >
              <label class="upload-form-btn">
                Выбрать файл
                <input
                  ref="inputFileRef"
                  class="upload-form-input-file"
                  type="file"
                  @change="handleFileUpload"
                />
              </label>
              <div class="upload-form-text">Максимальный размер файла 5 MB</div>
            </template>
            <template
              v-else-if="
                state.activeAddFileModalOption === ADD_FILE_KEYS.LOAD_LINK
              "
            >
              <input
                ref="fileLinkInputRef"
                type="text"
                class="upload-form-input"
                placeholder="Вставте ссылку https://..."
              />
              <button class="upload-form-btn">Вставить ссылку</button>
            </template>
          </form>
        </div>
      </div>
    </Modal>
  </Teleport>

  <Teleport to="body">
    <Modal
      ref="modalMenuFileRef"
      v-model="state.isMenuFileModalVisible"
      :showModalTop="isMobile()"
      :width="isMobile() ? '100%' : '227px'"
      :height="isMobile() ? '100%' : 'auto'"
      :padding="'10px'"
      :coords="menuFileModalCoords"
      bgColor="transparent"
      zIndexModalWrapper="778"
      autoPositionMode
      translateX="-50%"
    >
      <div class="menu-modal-content">
        <div class="menu-modal-item" @click="downloadFile">Скачать</div>
        <div class="menu-modal-item" @click="openFile">Открыть оригинал</div>
        <div class="menu-modal-item" @click="renameFile">Переименовать</div>
        <div class="menu-modal-item" @click="removeFile">Удалить</div>
      </div>
    </Modal>
  </Teleport>
</template>

<style lang="scss" scoped>
.menu-modal-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.menu-modal-item {
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  color: $color-dark-70;
  padding: 5px 10px;
  border-radius: 4px;
  transition: 0.3s ease;
  cursor: pointer;

  &:hover {
    background-color: $color-light-f;
  }
}
.selected-file {
  & .image {
    max-width: 22px;
    max-height: 22px;
    height: 100%;
    width: 100%;
    background: $color-avatar;
    border-radius: 2px;
    overflow: hidden;

    img {
      height: 100%;
      width: 100%;
      object-fit: cover;
    }
  }

  & .doc {
    background: $color-primary-10;
    border-radius: 4px;
    font-weight: 400;
    font-size: 14px;
    line-height: 16px;
    color: $color-dark-40;
    padding: 2px 5px;
  }
}
.upload-form {
  &-btn {
    @include button-primary-small;
    width: 100%;
    margin-bottom: 5px;
  }

  &-input {
    @include clear-input;
    height: 27px;
    width: 100%;
    font-weight: 400;
    font-size: 12px;
    line-height: 17px;
    padding: 5px 10px;
    border: 1px solid $color-primary;
    border-radius: 4px;
    margin-bottom: 5px;

    &::placeholder {
      color: $color-dark-20;
    }
  }

  &-input-file {
    opacity: 0;
    visibility: hidden;
    position: absolute;
  }

  &-text {
    font-weight: 400;
    font-size: 12px;
    line-height: 20px;
    color: $color-dark-20;
  }
}
:deep(.custom-modal-upload) {
  border: 1px solid $color-dark-10;
}
.upload-body {
  padding: 15px 10px 10px;
}
.upload-tabs {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 10px;
  padding: 12px 10px 0 10px;
  border-bottom: 1px solid $color-dark-10;

  &-item {
    position: relative;
    padding-bottom: 10px;
    font-weight: 400;
    font-size: 14px;
    line-height: 17px;
    cursor: pointer;

    &.active {
      &:before {
        content: "";
        display: block;
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 2px;
        width: 100%;
        background-color: $color-primary;
      }
    }
  }
}
.file-empty {
  box-shadow: 0px 0px 20px rgba(34, 34, 34, 0.1);
  border-radius: 4px;
  min-height: 34px;
  padding: 3px;
  display: flex;

  &-add {
    flex-grow: 1;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 5px;
    font-weight: 400;
    font-size: 14px;
    line-height: 24px;
    color: $color-dark-40;
    padding: 0 5px;
    cursor: pointer;
    border-radius: 4px;
    transition: 0.3s ease;

    &:hover {
      background-color: $color-primary-10;
    }

    &-icon {
      font-size: 18px;
      color: $color-dark-40;
    }
  }
}

.file-viewer {
  border: 1px solid $color-dark-10;
  border-radius: 8px;
  padding: 10px;
  max-height: 230px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 10px;

  &-content {
    border-bottom: 1px solid $color-dark-10;
    padding-bottom: 10px;
    min-height: 0;
  }

  &-item {
    padding: 5px 10px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 5px;
    border-radius: 4px;
    transition: 0.3s ease;
    cursor: pointer;

    &:hover {
      background-color: $color-primary-10;
    }

    &-img {
      max-width: 50px;
      max-height: 68px;
      background-color: $color-avatar;
      border-radius: 2px;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
    }

    &-icon {
      font-size: 17px;
      color: $color-dark-70;
    }

    &-name {
      font-weight: 400;
      font-size: 12px;
      line-height: 17px;
      color: $color-dark-70;
    }

    &-more {
      cursor: pointer;
      margin-left: auto;

      &-icon {
        font-size: 17px;
        color: $color-dark-70;
      }
    }
  }

  &-add {
    font-weight: 400;
    font-size: 12px;
    line-height: 17px;
    border-radius: 4px;
    color: $color-dark-70;
    transition: 0.3s ease;
    cursor: pointer;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: 5px 10px;
    gap: 10px;
    z-index: 1;

    &:hover {
      background-color: $color-primary-10;
    }

    &-icon {
      font-size: 17px;
      color: $color-dark-70;
    }
  }
}
</style>
