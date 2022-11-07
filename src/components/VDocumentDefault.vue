<script>
import DocIcon from "@/assets/icons/svg/doc.svg";
import TabletIcon from "@/assets/icons/svg/tablet.svg";
import BoardIcon from "@/assets/icons/svg/board.svg";
import { Types as DocumentTypes } from "@/enums/Document.ts";
import { isMobile } from "@/assets/js/utils";

export default {
  emits: ["click"],
  components: {
    DocIcon,
    TabletIcon,
    BoardIcon,
  },
  setup(props, { emit }) {
    function handleDocTypeClick(type) {
      emit("click", type);
    }

    return {
      DocumentTypes,
      handleDocTypeClick,
      isMobile,
    };
  },
};
</script>

<template>
  <div class="document-default">
    <div class="document-types">
      <div
        v-if="!isMobile()"
        class="document-type"
        @click="handleDocTypeClick(DocumentTypes.document)"
      >
        <DocIcon class="document-type__icon" />
        Документ
      </div>
      <h3 v-if="!isMobile()" class="document-types__title">База данных</h3>
      <div
        class="document-type"
        @click="handleDocTypeClick(DocumentTypes.table)"
      >
        <TabletIcon class="document-type__icon" />
        Таблица
      </div>
      <div
        class="document-type"
        @click="handleDocTypeClick(DocumentTypes.desk)"
      >
        <BoardIcon class="document-type__icon" />
        Доска
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.document-types {
  &__title {
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;
    color: $color-dark-20;
    margin-bottom: 10px;
    margin-top: 30px;
  }
}
.document-type {
  font-weight: 400;
  font-size: 14px;
  line-height: 24px;
  color: $color-dark-70;
  height: 52px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  cursor: pointer;
  position: relative;
  transition: 0.3s ease;
  border-bottom: 1px solid $color-dark-10;
  padding: 0 24px;

  &:first-child {
    border-top: 1px solid $color-dark-10;
    margin-top: 24px;
  }

  &__icon {
    color: $color-dark-40;
    margin-right: 5px;
    font-size: 20px;
  }

  &:hover {
    background-color: $color-primary-10;
  }

  @media all and (min-width: $xl) {
    padding: 5px;
    margin: 0 -5px;
    border-radius: 4px;
    color: $color-dark-40;
    height: auto;
    border: none;

    &__icon {
      font-size: 18px;
      color: $color-dark-20;
    }
    &:first-child {
      border-top: none;
      margin-top: 0;
    }
  }
}
</style>