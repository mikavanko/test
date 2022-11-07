<script>
// import VueTree from "@tinywisp/vue-tree";
import VueTree from "@/components/VueTree.vue";

import DocIcon from "@/assets/icons/svg/doc.svg";
import MoreIcon from "@/assets/icons/svg/more.svg";
import AddIcon from "@/assets/icons/svg/add.svg";
import AddSquareIcon from "@/assets/icons/svg/add-square.svg";

import { colorDark10 } from "@/assets/scss/exportedColors.module.scss"
import { isMobile } from "@/assets/js/utils";

export default {
  components: {
    VueTree,
    DocIcon,
    MoreIcon,
    AddIcon,
    AddSquareIcon,
  },
  props: {
    tree: {
      type: Object,
      default: () => {},
    }
  },
  mounted() {
  },
  data() {
    return {
      isMobile,
      defaultAttrs: {
        style: {
          iconMarginRight: '5px',
          height: '30px',
          hoverBgColor: 'transparent',
          dragOverBgColor: 'transparent',
          selectedBgColor: colorDark10,
          extraAlwaysVisible: true,
        }
      }
    };
  },
  methods: {
    dragend(dnd, event, node) {
      const t = this.$refs.tree;
      this.$emit('ondragend', t, event, node)
    },
    isDroppable(dragAndDrop) {
      // cannot be parent
      if (dragAndDrop.overArea === 'self') {
        return false
      }

      return true
    },
    openContextMenu(e, item){
      this.$emit('open-context-menu', e, item)
    }
  },
};
</script>

<template>
  <vue-tree
    :tree="tree"
    ref="tree"
    class="tree"
    :useDragImage="false"
    :defaultAttrs="defaultAttrs"
    :fnIsDroppable="isDroppable"
    @dragend="dragend"
  >
    <template #drag-arrow>
      <span />
    </template>
    <template #icon>
      <DocIcon class="doc-icon" />
    </template>
    <template #extra="{node}">
      <div class="tree-actions">
        <div class="tree-action" @click.stop="$emit('open-context-menu', $event, node)">
          <MoreIcon class="more-icon" />
        </div>
        <div class="tree-action" @click.stop="$emit('add-node',node)" style="display: none">
          <AddIcon class="add-icon" v-if="isMobile()" />
          <AddSquareIcon class="add-icon add-square-icon" v-else />
        </div>
      </div>
    </template>
  </vue-tree>
</template>

<style lang="scss" scoped>
:export {
  colorDark10: $color-dark-10;
}

$items-height: 100%;
$items-lineheight: 1;

.tree{
  padding: 0;

  :deep(.vue-tree){
    padding: 0;
  }
}

.tree-actions{
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: $items-height;
  position: absolute;
  top: 0;
  right: 16px;
  bottom: 0;
  z-index: 1;
}

.tree-action{
  width: 24px;
  height: 24px;
  color: $color-dark-40;
  font-size: 24px;
  display: flex;

  &:not(:last-child){
    margin-right: 5px;
  }

  @media all and (min-width: $xl){
    width: 20px;
    height: 20px;
    font-size: 20px;
  }
}
.add-square-icon{
  opacity: 0.6;
  color: transparent;

  &:hover{
    opacity: 1;
    color: $color-dark-20;
  }
}

.doc-icon {
  font-size: 18px;
  height: $items-height;
  line-height: $items-lineheight;
  color: $color-dark-40;
}

:deep(.vue-tree-node){
  height: 40px;
  box-shadow: 0px 1px 0px $color-dark-10;
  padding: 0 16px 0 24px;
  vertical-align: middle;

  &:hover{
    background-color: $color-dark-10;
  }


  @media all and (min-width: $xl){
    box-shadow: none;
    height: 30px;

    .tree-actions{
      opacity: 0;
    }

    &:hover{
      .tree-actions{
        opacity: 1;
      }
    }
  }

  &.isDragging{
    opacity: .3;
  }

  &.vue-tree-node-drag-over-prev {
    .vue-tree-drag-arrow-wrapper {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      background-color: $color-primary-30;
      height: 2px;
      width: 100%;
    }
  }
  &.vue-tree-node-drag-over-next {
    .vue-tree-drag-arrow-wrapper {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background-color: $color-primary-30;
      height: 2px;
      width: 100%;
    }
  }
  &.vue-tree-node-drag-over-self {
    .vue-tree-switcher-wrapper,
    .vue-tree-icon-and-title{
      position: relative;
      z-index: 1;
    }

    .vue-tree-drag-arrow-wrapper {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      background-color: $color-primary-30;
      height: 100%;
      width: 100%;
      z-index: 0;
    }
  }

  .vue-tree-icon-and-title{
    height: $items-height;
    line-height: $items-lineheight;
    vertical-align: middle;
    padding-left: 0;
  }
  
  .vue-tree-icon-wrapper{
    display: inline-block;
    vertical-align: middle;
    height: $items-height;
    line-height: $items-lineheight;
  }

  .vue-tree-switcher-wrapper{
    font-size: 16px;
    width: 24px;
    height: $items-height;
    line-height: $items-lineheight;
    color: $color-dark-40;
    margin-left: -24px;
    margin-right: 0;
    text-align: center;

    .vue-tree-switcher-icon{
      height: $items-height;
    }
  }

  .vue-tree-title-wrapper{
    display: inline-block;
    vertical-align: middle;
    height: $items-height;
    line-height: $items-lineheight;
  }

  .vue-tree-title{
    font-family: $Lato;
    font-weight: 400;
    font-size: 14px;
    height: $items-height;
    line-height: 40px;
    color: $color-dark-70;
    display: block;

    @media all and (min-width: $xl){
      line-height: 30px;
    }
  }

  &.vue-tree-node-selected{
    .vue-tree-title{
      font-weight: 600;
    }
  }
}
</style>