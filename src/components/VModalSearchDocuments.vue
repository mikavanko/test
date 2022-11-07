<script>
import { computed, reactive, ref, getCurrentInstance } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import Modal from "@/components/VModal.vue";
import InputSearch from "@/components/VInputSearch.vue";

import { isMobile } from "@/assets/js/utils";

import SearchIcon from "@/assets/icons/svg/search.svg";
import CloseCircleIcon from "@/assets/icons/svg/close-circle-fill.svg";
import DocIcon from "@/assets/icons/svg/doc.svg";

import DocumentAdapter from "@/adapters/Document.js";
import { getDocumentsSearch } from "@/api/documents.js";
import { map } from "lodash";

export default {
  emits: ["update:isVisible", "continue", "cancel"],
  props: {
    isVisible: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    const inst = getCurrentInstance();
    const bus = inst.appContext.config.globalProperties.$bus;

    const store = useStore();
    const router = useRouter();
    const isModalVisible = computed({
      get() {
        return props.isVisible;
      },
      set(val) {
        emit("update:isVisible", val);
      },
    });
    const currentProject = computed(
      () => store.getters["projects/getCurrentProject"]
    );
    const recentDocuments = computed(() =>
      store.getters[`documents/getRecentDocuments`](currentProject.value.id)
    );

    const searchPlaceholder = computed(
      () => `Искать в «${currentProject.value?.name}»...`
    );

    const state = reactive({
      searchInput: {
        name: "project",
        placeholder: searchPlaceholder,
        value: "",
        dropdownData: [],
      },
      isFocused: false,
      noResult: false,
    });

    const debounceCallback = (val) => {
      const params = {
        fields: ["title"],
        query: val,
      };

      getDocumentsSearch(currentProject?.value.id, params).then((res) => {
        const docs = map(res.data.data, DocumentAdapter);
        state.searchInput.dropdownData = docs.map((el) => ({
          ...el,
          value: el.title,
        }));

        state.noResult = !docs.length;
      });
    };

    const inputSearchRef = ref();

    const clear = () => {
      inputSearchRef.value?.clickOutside();
    };

    const select = (val) => {
      store.dispatch("documents/setDocumentToRecents", {
        currentProjectId: currentProject.value?.id,
        document: val,
      });
      clear();
    };

    const clearRecent = () => {
      store.dispatch(
        "documents/clearRecentDocuments",
        currentProject.value?.id
      );
    };

    const onSearchInput = (val) => {
      // state.keepSearching = !!val.length;

      !val.length && (state.noResult = false);
    };

    const goToDoc = (item) => {
      router.push(
        `/projects/${currentProject.value?.id}/documents/${item?.id}`
      );
      bus.$emit(`modal-close:modal-search-documents`)
    };

    return {
      isMobile,
      isModalVisible,
      state,
      debounceCallback,
      inputSearchRef,
      clear,
      select,
      currentProject,
      clearRecent,
      recentDocuments,
      onSearchInput,
      goToDoc,
    };
  },
  components: {
    Modal,
    InputSearch,
    SearchIcon,
    CloseCircleIcon,
    DocIcon,
  },
};
</script>

<template>
  <Modal
    id="modal-search-documents"
    v-model="isModalVisible"
    :showModalTop="isMobile() ? true : false"
    :width="isMobile() ? '100%' : '600px'"
    :height="isMobile() ? '100%' : 'auto'"
    :customBodyClass="'custom-body-class'"
  >
    <InputSearch
      ref="inputSearchRef"
      class="search-input"
      v-bind="state.searchInput"
      v-model:value="state.searchInput.value"
      :callback="debounceCallback"
      :customDropdownClass="'custom-dropdown-class'"
      :customInputWrapperClass="'custom-input-wrapper-class'"
      @focus="state.isFocused = true"
      @blur="state.isFocused = false"
      @update:value="onSearchInput"
      @select="select"
    >
      <template #dropdown-item="item">
        <div class="custom-dropdown-item" @click="goToDoc(item)">
          <DocIcon class="custom-dropdown-item__icon" />
          <div class="custom-dropdown-item__content">
            <div class="custom-dropdown-item__title">
              {{ item.title }}
            </div>
            <div class="custom-dropdown-item__project">
              {{ currentProject?.name }}
            </div>
          </div>
        </div>
      </template>
      <template #prefixIcon>
        <SearchIcon class="search-input__search-icon" />
      </template>
      <template #suffixIcon>
        <CloseCircleIcon class="search-input__clear-icon" @click="clear" />
      </template>
    </InputSearch>

    <div class="no-result" v-if="state.noResult">
      <h3 class="no-result-title">Нет результата</h3>
      <p class="no-result-text">Попробуйте другие запросы</p>
    </div>

    <div
      class="recent"
      v-if="
        recentDocuments &&
        recentDocuments.length &&
        !state.isFocused &&
        !inputSearchRef?.state.showDropdown
      "
    >
      <div class="recent-header">
        <h3 class="recent-header-title">Недавние документы</h3>
        <div class="recent-clear" @click="clearRecent">Очистить</div>
      </div>
      <div class="recent-body">
        <div
          class="recent-item"
          v-for="(item, idx) of recentDocuments"
          :key="idx"
          @click="goToDoc(item)"
        >
          <DocIcon class="recent-item__icon" />
          <div class="recent-item__content">
            <div class="recent-item__title">
              {{ item.title }}
            </div>
            <!-- <div class="recent-item__project">
              {{ currentProject?.name }}
            </div> -->
          </div>
        </div>
      </div>
    </div>
  </Modal>
</template>

<style lang="scss" scoped>
:deep(.modal) {
  @media all and (min-width: $xl) {
    top: 100px;
    transform: translateX(-50%);
    max-height: 80vh;
  }
}
:deep(.custom-body-class) {
  min-height: 0;
  @media all and (min-width: $xl) {
    padding: 0;
    display: flex;
    flex-direction: column;
    // min-height: 162px;
  }
}
:deep(.custom-input-wrapper-class) {
  .input-wrapper {
    height: 40px;
  }
  @media all and (min-width: $xl) {
    .input {
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
      border: none;
      border-bottom: 1px solid $color-avatar;
    }
  }
}
:deep(.custom-dropdown-class) {
  background-color: $color-light;
  border-radius: 8px;
  top: 0;
  position: relative;
  max-height: none;
  min-height: 0;

  .ps {
    padding-top: 15px;
  }

  @media all and (min-width: $xl) {
    .dropdown-item-wrapper {
      padding: 0 8px;
    }
  }
}
.no-result {
  text-align: center;
  padding: 24px 0;

  &-title {
    font-weight: 400;
    font-size: 14px;
    line-height: 19px;
  }
  &-text {
    font-weight: 400;
    font-size: 14px;
    line-height: 19px;
    color: $color-dark-40;
  }
}
.recent {
  padding: 24px 0;

  @media all and (min-width: $xl) {
    padding: 15px 10px;
  }
  &-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 5px;

    &-title {
      font-weight: 400;
      font-size: 14px;
      line-height: 19px;
      padding: 0 5px;
      color: $color-dark-40;
    }
  }

  &-clear {
    font-weight: 400;
    font-size: 12px;
    line-height: 19px;
    color: $color-primary;
    cursor: pointer;
  }
}
.recent-item,
.custom-dropdown-item {
  display: flex;
  padding: 8px 0 0 16px;
  position: relative;
  display: flex;
  justify-content: flex-start;
  align-items: stretch;
  // height: 50px;
  cursor: pointer;

  @media all and (min-width: $xl) {
    border-radius: 8px;
  }

  &:hover {
    background-color: $color-light-f;
  }

  &__icon {
    font-size: 18px;
    color: $color-dark-40;
    margin-right: 10px;
    min-width: 18px;
  }

  &__content {
    padding-bottom: 8px;
    border-bottom: 1px solid $color-light-f;
    flex-grow: 1;
    padding-right: 16px;
    min-width: 0;
  }
  &__title {
    font-weight: 700;
    font-size: 14px;
    line-height: 20px;
    color: $color-dark-70;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  &__project {
    font-weight: 400;
    font-size: 12px;
    line-height: 14px;
    color: $color-dark-40;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
.search-input {
  display: flex;
  flex-direction: column;
  max-height: 100%;
  min-height: 0;
}
.search-input__search-icon {
  font-size: 18px;
  color: $color-dark-40;
}
.search-input__clear-icon {
  font-size: 18px;
  color: $color-dark-20;
}
</style>