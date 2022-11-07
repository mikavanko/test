<script setup>
import { computed, reactive } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router"
import { isMobile } from "@/assets/js/utils";

import ModalDocumentActions from "@/components/VModalDocumentActions.vue";
import ModalDocumentShare from "@/components/VModalDocumentShare.vue";

import EditIcon from "@/assets/icons/svg/edit.svg";
import StopEditIcon from "@/assets/icons/svg/stop-edit.svg";
import SendSquareIcon from "@/assets/icons/svg/send-square.svg";
import MoreIcon from "@/assets/icons/svg/more.svg";

import ProjectItemAdapter from "@/adapters/ProjectItem.js";
import { toggleEditDocument, blockDocument } from "@/api/documents.js";

const state = reactive({
  isModalDocumentActionsVisible: false,
  isModalDocumentShareVisible: false,
});

const store = useStore();
const router = useRouter();

const user = computed(() => store.getters["auth/getUser"]);
const currentDocument = computed(() => store.getters["documents/getCurrentDocument"]);
const currentProject = computed(() => store.getters["projects/getCurrentProject"]);

const toggleEdit = async () => {
  const res = await toggleEditDocument(currentDocument.value?.projectItem?.id);
  const projectItem = ProjectItemAdapter(res.data.data);
  store.dispatch("documents/setProjectItemToCurrentDocument", projectItem);
  
  store.dispatch("documents/setEditMode");
};

const deleteDocument = () => {
  store.dispatch("documents/deleteDocument", currentDocument.value.id);
  store.dispatch("documents/setCurrentDocument", null);
  router.push(`/projects/${currentProject.value.id}`)
}

const lockDocument = async () => {
  const res = await blockDocument(currentDocument.value?.projectItem.id);
  const projectItem = ProjectItemAdapter(res.data.data);
  store.dispatch("documents/setProjectItemToCurrentDocument", projectItem);
}

</script>

<template>
  <div class="navbar-top">
    <!-- <div class="navbar-top-title">{{ currentDocument?.title }}</div> -->
    <div class="navbar-top-actions">
      <div
        class="navbar-top-action action-edit navbar-top-action_text"
        v-if="!currentDocument?.projectItem?.editor"
        @click="toggleEdit"
        data-text="Редактировать"
      >
        <EditIcon class="navbar-top-action__icon edit-icon" />
      </div>
      <div
        class="navbar-top-action action-user"
        v-else-if="currentDocument?.projectItem?.editor.id !== user?.id"
      >
        <div class="user-avatar">
          <img
            class="user-avatar-img"
            :src="user?.avatar.originalUrl"
            :alt="`${user?.nickname}-avatar`"
            v-if="user?.avatar"
          />
          <div class="user-avatar-letter" v-else>{{ user?.nickname[0] }}</div>
        </div>
      </div>
      <div
        class="navbar-top-action action-stop-edit navbar-top-action_text"
        v-else
        @click="toggleEdit"
        data-text="Завершить"
      >
        <StopEditIcon class="navbar-top-action__icon stop-edit-icon" />
      </div>

      <div
        class="navbar-top-action action-share navbar-top-action_text"
        @click="state.isModalDocumentShareVisible = true"
        data-text="Поделиться"
      >
        <SendSquareIcon class="navbar-top-action__icon send-square-icon" />
      </div>
      <div
        class="navbar-top-action action-more"
        @click="state.isModalDocumentActionsVisible = true"
      >
        <MoreIcon class="navbar-top-action__icon more-icon" />
      </div>
    </div>
  </div>
  <Teleport to="body">
    <ModalDocumentActions
      v-model:isVisible="state.isModalDocumentActionsVisible"
      @delete="deleteDocument"
      @lock="lockDocument"
    />
    
    <ModalDocumentShare
      v-model:isVisible="state.isModalDocumentShareVisible"
    />
  </Teleport>
</template>

<style lang="scss" scoped>
.navbar-top {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
}
.navbar-top-actions {
  margin-left: auto;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}
.navbar-top-action {
  font-size: 24px;
  line-height: 24px;
  cursor: pointer;
  color: $color-dark-40;

  &__icon {
    display: flex;
  }

  &:not(:last-child) {
    margin-right: 8px;
  }

  &.action-edit {
    color: $color-success;
  }
  &.action-stop-edit {
    color: $color-error;
  }

  .user-avatar {
    width: 24px;
    height: 24px;
    border-radius: 100%;
    overflow: hidden;

    &-img {
      object-fit: cover;
      height: 100%;
      width: 100%;
    }
  }
}
.navbar-top-title {
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
}

@media all and (min-width: $xl) {
  .navbar-top-action {
    $p: &;

    &:not(:last-child) {
      margin-right: 15px;
    }

    &_text {
      font-weight: 400;
      font-size: 14px;
      line-height: 17px;
      color: $color-dark-70;

      &:before {
        content: attr(data-text);
      }

      #{$p}__icon {
        display: none;
      }
    }

    &.action-edit {
      padding: 2px 5px;
      color: $color-light;
      background-color: $color-primary;
      border-radius: 4px;
      line-height: 20px;
      order: 2;
    }

    &.action-stop-edit {
      padding: 2px 5px;
      color: $color-light;
      background-color: $color-error;
      border-radius: 4px;
      line-height: 20px;
      order: 2;
    }

    &.action-share{
      order: 1;
    }

    &.action-more{
      order: 3;
    }
  }
}
</style>