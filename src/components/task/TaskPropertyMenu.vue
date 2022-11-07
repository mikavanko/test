<script>
import { reactive, computed, ref, onUpdated, watch } from "vue";
import { isMobile } from "@/assets/js/utils";
import Modal from "@/components/VModal.vue";
import ColorSquare from "@/components/ColorSquare.vue";
import { cloneDeep } from "lodash";

export default {
  components: {
    Modal,
    ColorSquare,
  },
  // as vue 3 doesn't support dynamic event names, so I will emit all actions in this way: emit("action:***"). Where *** - action name
  // https://github.com/vuejs/rfcs/issues/204
  // https://github.com/laravel-enso/enso/issues/414#issuecomment-1059934368
  emits: ["update:modelValue", "update:menuItems"],
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    menuItems: {
      type: Array,
      default: () => [],
    },
    useFilter: {
      type: Boolean,
      default: false,
    },
    translateX: {
      type: String,
      default: "0%",
    },
    translateY: {
      type: String,
      default: "0%",
    },
    coords: {
      type: Object,
      default: () => null,
    },
  },
  setup(props, { emit }) {
    const filterInputRef = ref();

    const isModalVisible = computed({
      get() {
        return props.modelValue;
      },
      set(val) {
        emit("update:modelValue", val);
      },
    });

    const menuItemsComp = computed({
      get: () => cloneDeep(props.menuItems),
      set: (val) => {
        emit("update:menuItems", val);
      },
    });

    const state = reactive({
      isContextMenuVisible: false,
      filterInput: "",
    });

    const filteredMenuActions = computed(() => {
      if (!state.filterInput) {
        return menuItemsComp.value;
      } else {
        const fMenu = [...menuItemsComp.value]
          .map((el) => {
            const actions = el.actions.filter((f) => {
              return (
                f.name
                  .toLowerCase()
                  .indexOf(state.filterInput.toLowerCase()) !== -1
              );
            });
            return { actions };
          })
          .filter((el) => el.actions.length);

        return fMenu;
      }
    });

    onUpdated((val) => {
      if (props.useFilter && isModalVisible.value) {
        filterInputRef.value.focus();
      }
    });

    function handleParamsFunc(funcs, args) {
      const newFuncs = {};

      for (let key in funcs) {
        newFuncs[key] = funcs[key].bind(null, args, emit);
      }

      return newFuncs;
    }

    return {
      state,
      emit,
      isModalVisible,
      isMobile,
      filteredMenuActions,
      filterInputRef,
      handleParamsFunc,
    };
  },
};
</script>

<template>
  <Teleport to="body">
    <Modal
      v-model="isModalVisible"
      :showModalTop="isMobile()"
      :width="isMobile() ? '100%' : '227px'"
      :height="isMobile() ? '100%' : 'auto'"
      :bgColor="'transparent'"
      :padding="'8px 10px 10px 10px'"
      :translateX="$props.translateX"
      :translateY="$props.translateY"
      :coords="!isMobile() && $props.coords"
    >
      <form class="context-menu-form" v-if="$props.useFilter">
        <input
          class="context-menu-input"
          ref="filterInputRef"
          type="text"
          placeholder="Найти событие"
          v-model="state.filterInput"
        />
      </form>
      <div class="context-menu-actions">
        <div
          class="context-menu-action-group"
          v-for="(group, i) of filteredMenuActions"
          :key="i"
        >
          <div class="context-menu-action-group-title" v-if="group.title">
            {{ group.title }}
          </div>
          <div
            class="context-menu-action"
            v-for="(item, j) of group.actions"
            :key="j"
            v-on="
              (item.on &&
                handleParamsFunc(item.on, {
                  groups: filteredMenuActions,
                  group,
                  item,
                  i,
                  j,
                })) ||
              (group.actionsOn &&
                handleParamsFunc(group.actionsOn, {
                  groups: filteredMenuActions,
                  group,
                  item,
                  i,
                  j,
                }))
            "
          >
            <component
              :is="item.componentLeft?.tag"
              v-bind="item.componentLeft?.props"
              class="context-menu-action-left"
            />
            <div class="context-menu-action-name">
              {{ item.name }}
            </div>
            <component
              :is="item.componentRight?.tag"
              v-bind="item.componentRight?.props"
              class="context-menu-action-right"
            />
          </div>
        </div>
      </div>
    </Modal>
  </Teleport>
</template>

<style lang="scss" scoped>
.context-menu-action-group {
  gap: 4px;
  display: flex;
  flex-direction: column;
  padding: 5px 0;

  &:not(:last-child) {
    border-bottom: 1px solid $color-dark-10;
  }
}
.context-menu-action-group-title {
  font-weight: 400;
  font-size: 12px;
  line-height: 15px;
  color: $color-dark-40;
  padding: 5px 10px;
}
.context-menu-action {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  cursor: pointer;
  gap: 10px;
  padding: 5px 10px;
  border-radius: 4px;
  transition: 0.3s ease;

  &:hover {
    background-color: $color-light-f;
  }
}
.context-menu-action-name {
  font-weight: 400;
  font-size: 12px;
  line-height: 17px;
  color: $color-dark-70;
  flex: 1;
  min-width: 0;
}
.context-menu-action-left {
  font-size: 17px;
  color: $color-dark-70;
}
.context-menu-action-right {
  font-size: 17px;
  color: $color-dark-70;
}
.context-menu {
  &-form {
    padding-bottom: 10px;
    border-bottom: 1px solid $color-dark-10;
  }
  &-input {
    @include clear-input;
    padding: 5px 5px 5px 10px;
    font-weight: 400;
    font-size: 12px;
    line-height: 17px;
    border: 1px solid transparent;
    border-radius: 4px;
    transition: 0.3s ease;

    &:focus {
      border: 1px solid $color-primary;
    }

    &::placeholder {
      color: $color-dark-20;
    }
  }
}
</style>
