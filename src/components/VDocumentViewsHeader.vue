<script>
import { computed, reactive, ref } from "vue";
import { DocumentViewsKeys } from "@/enums/Document.ts";
import AddSquareIcon from "@/assets/icons/svg/add-square-3.svg";
import MoreIcon from "@/assets/icons/svg/more.svg";
import SearchIcon from "@/assets/icons/svg/search.svg";

export default {
  components: {
    AddSquareIcon,
    MoreIcon,
    SearchIcon,
  },
  emits: ["add-task"],
  props: {
    documentSearch: {
      type: String,
      default: "",
    },
    documentViews: {
      type: Array,
      default: () => [],
      validator(value) {
        return value.every((el) => {
          const names = Object.keys(el);
          const requiredNames = Object.values(DocumentViewsKeys);

          return names.every((r) => requiredNames.includes(r));
        });
      },
    },
  },
  setup(props, { emit }) {
    const searchInputRef = ref();

    const state = reactive({
      isSearchVisible: false,
    });

    const documentSearchComp = computed({
      get() {
        return props.documentSearch;
      },
      set(val) {
        emit("update:documentSearch", val);
      },
    });

    function showSearch() {
      state.isSearchVisible = true;
      searchInputRef.value.focus();
    }
    function onBlurSearchInput() {
      if (!documentSearchComp.value.length) {
        state.isSearchVisible = false;
      }
    }
    return {
      state,
      DocumentViewsKeys,
      documentSearchComp,
      showSearch,
      onBlurSearchInput,
      searchInputRef,
    };
  },
};
</script>

<template>
  <div class="document-header">
    <div class="document-views">
      <div
        class="document-view"
        v-for="(item, idx) of $props.documentViews"
        :key="idx"
      >
        <svg-icon class="document-icon" :name="item[DocumentViewsKeys.icon]" />
        {{ item[DocumentViewsKeys.title] }}
      </div>
    </div>
    <div class="document-actions">
      <div class="document-action-item">
        <div class="document-action search-action" @click="showSearch">
          <SearchIcon class="search-icon" />
        </div>
        <div :class="['document-search', { show: state.isSearchVisible }]">
          <form class="document-search-form">
            <input
              ref="searchInputRef"
              class="document-search-input"
              type="text"
              v-model="documentSearchComp"
              @blur="onBlurSearchInput"
              placeholder="Введите для поиска..."
            />
          </form>
        </div>
      </div>
      <div
        class="document-action-item document-action add-task-action"
        @click="$emit('add-task', $event)"
      >
        <AddSquareIcon class="add-icon" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.document-search {
  overflow: hidden;
  width: 0;
  transition: 0.3s ease;

  &.show {
    width: 160px;
    margin-left: 5px;
  }

  &-input {
    @include clear-input;

    width: 100%;
    height: 19px;
    font-weight: 400;
    font-size: 14px;
    line-height: 19px;

    &::placeholder {
      color: $color-dark-20;
    }
  }
}
.document-action-item {
  display: flex;
}
.document-action {
  font-size: 18px;
  color: $color-dark-40;
  cursor: pointer;
  display: block;
}
.document-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
}
.document-header {
  border-bottom: 1px solid $color-dark-10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}
.document-views {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 15px;
}
.document-view {
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 500;
  font-size: 14px;
  line-height: 17px;
  padding-bottom: 10px;
  cursor: pointer;
  border-bottom: 1px solid $color-dark;
  margin-bottom: -1px;
}
.document-icon {
  font-size: 18px;
  margin-right: 5px;
}
</style>