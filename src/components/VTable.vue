<script>
import { reactive, onMounted, ref, computed, nextTick, watch } from "vue";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";

import Draggable from "vuedraggable";

import { boardData } from "@/mocks/document.js";

import { isMobile } from "@/assets/js/utils";
import { cloneDeep, debounce } from "lodash";

import ErrorAdapter from "@/adapters/Error";
import { useToast } from 'vue-toastification';

export default {
  components: {
    Draggable,
  },
  props: {
    filter: {
      type: String,
      default: "",
    },
    colors: {
      type: Array,
      default: () => [],
    }
  },
  setup(props) {
    const store = useStore();
    const route = useRoute();
    const router = useRouter();
    const toast = useToast();

    const isSidebarMenuVisible = computed(
      () => store.getters["menu/isVisible"]
    );
    const currentDocument = computed(
      () => store.getters["documents/getCurrentDocument"]
    );
    const isCurrentDocumentEditable = computed(() => store.getters["documents/isCurrentDocumentEditable"])

    const state = reactive({
      tableData: [
        {
          title: 'Название',
          icon: 'smallcaps',
          columns: 10,
        },
        {
          title: 'Свойство 1',
          icon: 'text',
          columns: 10,
        },
        {
          title: 'Свойство 2',
          icon: 'text',
          columns: 10,
        },
        {
          title: 'Свойство 3',
          icon: 'text',
          columns: 10,
        },
        {
          title: 'Свойство 4',
          icon: 'text',
          columns: 10,
        },
      ],
    });

    onMounted(() => {
    });



    return {
      state,
      isSidebarMenuVisible
    };
  },
};
</script>
  
<template>
  <div class="table">
    <div :class="[
      'table-horizontal-scroll',
      { 'full-width': !isSidebarMenuVisible },
    ]" data-simplebar>
      <div class="table-horizontal-scroll-inner">
        <div class="table-grid">
          <div :class="['table-grid-column', {'first': idx===0}]" v-for="(item, idx) of state.tableData" :key="idx">
            <div class="table-grid-column-title table-grid-column-td">
              <svg-icon class="table-grid-column-title-icon" :name="item.icon" />
              {{item.title}}
            </div>
            <div class="table-grid-column-td" v-for="(col, idx) in item.columns" :key="idx">
              {{col}}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
  
<style lang="scss" scoped>
.add-group {
  &-form {
    display: flex;
    gap: 10px;
  }

  &-input {
    @include clear-input;
  }

  &-submit {
    @include button-primary-small;
  }
}

// desktop vars START
$outer-width: calc(100vw - $menuWidthDesktop);
$dynamic-content-padding: calc(($outer-width - 100%) / 2);
// desktop vars END

.table-horizontal-scroll {
  width: 100vw;
  // min-height: calc(100vh - 237px);
  transform: translateX(-50%);
  left: 50%;
  // padding: 0 $dynamic-content-padding;

  &.full-width {
    width: 100vw;
  }

  &-inner {
    display: flex;
    max-width: 900px;
    margin: 0 auto;
    padding: 0 24px 36px 24px;
    min-height: 100vh;
  }

  :deep(.simplebar-track.simplebar-horizontal) {
    position: sticky;
    left: -24px;
    right: -24px;
    bottom: 0;
  }

  @media all and (min-width: $xl) {
    width: $outer-width;
  }
}

.table-grid {
  display: flex;
  flex-direction: row;
  padding-right: $dynamic-content-padding;

  &-column {

    $p: &;

    &.first {
      min-width: 274px;

      #{$p}-td {
        border-width: 0 1px 1px 1px;

        &:first-child {
          border-width: 1px;
        }
      }
    }

    &-td {
      min-width: 200px;
      min-height: 42px;
      padding: 12px 10px;
      font-weight: 400;
      font-size: 14px;
      line-height: 17px;
      border-color: $color-dark-10;
      border-style: solid;
      border-width: 0 1px 1px 0;

      &:first-child {
        border-width: 1px 1px 1px 0;
      }
    }

    &-title {
      font-weight: 500;
      font-size: 14px;
      line-height: 17px;
      color: $color-dark-40;
      background-color: $table-title-bg;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      gap: 5px;

      &-icon{
        font-size: 18px;
      }
    }
  }
}
</style>
  