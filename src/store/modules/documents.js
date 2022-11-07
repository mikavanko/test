import {
  getDocumentsSearch,
  deleteDocument,
  getDocument,
  updateDocumentBlocks,
  updateDocumentTitle,
} from "@/api/documents.js";
import { 
  deskGet,
  deskColumnCreate, 
  deskColumnDelete, 
  deskColumnMove, 
  deskColumnTaskCreate, 
  deskColumnTaskMove, 
  deskColumnTaskUpdate, 
  deskColumnTaskDelete, 
  deskColumnSetColor, 
  deskFieldCreate, 
  deskFieldUpdate,
  deskFieldDelete,
  getColors,
  getTimeZones,
  getTimeFormats,
} from "@/api/desk.js";
import DocumentAdapter from "@/adapters/Document.js";
import DeskAdapter from "@/adapters/Desk.js";
import { map } from "lodash";
import { Types as DocumentTypes } from "@/enums/Document.ts";
import ProjectItemAdapter from "@/adapters/ProjectItem";
import ColumnAdapter from "@/adapters/Column"
import TaskAdapter from "@/adapters/Task"
import FieldAdapter from "@/adapters/Field"
import ErrorAdapter from "@/adapters/Error";
import ColorAdapter from "@/adapters/Color";
import TimeFormatAdapter from "@/adapters/TimeFormat";
import TimeZoneAdapter from "@/adapters/TimeZone";
import { useToast } from 'vue-toastification';
const toast = useToast();

import auth from "@/store/modules/auth";
const user = auth.state.user;

export default {
  namespaced: true,
  state: {
    recentDocuments: JSON.parse(localStorage.getItem("recentDocuments")) || [],
    documents: [],
    currentDocument: null,
    documentType: DocumentTypes.unset,
    colors: [],
    timeZones: [],
    timeFormats: [],
    editMode: false,
  },
  mutations: {
    setRecentDocuments(state, val) {
      localStorage.setItem("recentDocuments", JSON.stringify(val));
      state.recentDocuments = val
    },
    setDocuments(state, docs) {
      state.documents = docs
    },
    pushDocument(state, doc) {
      state.documents.push(doc)
    },
    deleteDocument(state, docId) {
      const idx = state.documents.findIndex(el => el.id === docId)
      state.documents.splice(idx, 1)
    },
    setCurrentDocument(state, doc) {
      state.currentDocument = doc
    },
    setProjectItemToCurrentDocument(state, projectItem) {
      state.currentDocument.projectItem = projectItem
    },
    setDocumentType(state, type) {
      state.documentType = type
    },
    addColumnToDocument(state, column) {
      state.currentDocument.columns.push(column)
    },
    deleteColumnFromDocument(state, id) {
      const idx = state.currentDocument.columns.findIndex(el => el.id === id)
      state.currentDocument.columns.splice(idx, 1)
    },
    addTaskToColumn(state, { column, task }) {
      const idx = state.currentDocument.columns.findIndex(el => el.id === column)
      state.currentDocument.columns[idx].tasks.push(task)
    },
    updateTaskToColumn(state, { task, columnIndex, taskIndex }) {
      state.currentDocument.columns[columnIndex].tasks[taskIndex] = task
    },
    deleteTask(state, { columnIdx, taskIdx }) {
      state.currentDocument.columns[columnIdx].tasks.splice(taskIdx, 1);
    },
    updateDeskColumnColor(state, { columnIdx, color }) {
      state.currentDocument.columns[columnIdx].color = color;
    },
    pushField(state, field){
      state.currentDocument.fields.push(field);
    },
    updateField(state, field){
      const idx = state.currentDocument.fields.findIndex(el => el.id === field.id)
      state.currentDocument.fields[idx] = field
    },
    deleteField(state, id){
      const idx = state.currentDocument.fields.findIndex(el => el.id === id)
      if(idx !== -1){
        state.currentDocument.fields.splice(idx, 1)
      }
    },
    setColors(state, colors){
      state.colors = colors
    },
    setTimeZones(state, timeZones){
      state.timeZones = timeZones
    },
    setTimeFormats(state, timeFormats){
      state.timeFormats = timeFormats
    },
    setEditMode(state, editMode){
      state.editMode = editMode
    },
  },
  actions: {
    setDocumentToRecents({ commit, state }, { currentProjectId, document }) {
      const recentDocs = [...state.recentDocuments]
      const projectIdx = recentDocs.findIndex(el => el.projectId === currentProjectId)
      if (projectIdx !== -1) {
        const docIdx = recentDocs[projectIdx].documents.findIndex(el => el.id === document.id)

        if (docIdx !== -1) {
          recentDocs[projectIdx].documents.splice(docIdx, 1)
        }
        recentDocs[projectIdx].documents.unshift(document)
      } else {
        recentDocs.push({
          projectId: currentProjectId,
          documents: [document]
        })
      }

      commit("setRecentDocuments", recentDocs);
    },
    clearRecentDocuments({ commit, state }, projectId) {
      const recentDocs = [...state.recentDocuments]
      const idx = recentDocs.findIndex(el => el.projectId === projectId)

      if (idx !== -1) {
        recentDocs.splice(idx, 1)
      }

      commit("setRecentDocuments", recentDocs);
    },
    async getDocuments({ commit }, { params, projectId }) {
      const docsRaw = await getDocumentsSearch(projectId, params);
      const projectItems = map(docsRaw.data.data.items, ProjectItemAdapter);
      commit("setDocuments", projectItems)
      return projectItems
    },
    setDocuments({ commit }, documents) {
      commit("setDocuments", documents)
    },
    pushDocument({ commit }, document) {
      commit("pushDocument", document)
    },
    async deleteDocument({ commit }, documentId) {
      const res = await deleteDocument(documentId).then(() => {
        commit("deleteDocument", documentId)
      })
      return res
    },
    async getCurrentDocument({ dispatch, rootState }, { id, documentType }) {
      let res;
      let adaptedData;
      if (documentType === DocumentTypes.document) {
        res = await getDocument(id)
        adaptedData = DocumentAdapter(res.data.data)
      } else if (documentType === DocumentTypes.desk) {
        res = await deskGet(id)
        adaptedData = DeskAdapter(res.data.data)
      }
      dispatch("setCurrentDocument", adaptedData)
      dispatch("setEditMode")

      return adaptedData
    },
    setEditMode({ commit, rootState, state }) {
      const userId = rootState.auth.user?.id ?? null;
      const editorId = state.currentDocument.projectItem?.editor?.id ?? null;

      commit('setEditMode', userId !== null && editorId !== null && userId === editorId);
    },
    async updateDocumentBlocks({ dispatch }, { documentId, text }) {
      const res = await updateDocumentBlocks(documentId, text)
      const doc = DocumentAdapter(res.data.data)

      dispatch("updateDocument", doc)
      dispatch("setCurrentDocument", doc)
    },
    async updateDocumentTitle({ dispatch }, { projectItemId, title }) {
      const res = await updateDocumentTitle(projectItemId, title)
      const projectItem = ProjectItemAdapter(res.data.data)

      dispatch("updateDocument", projectItem)
      dispatch("setProjectItemToCurrentDocument", projectItem)
    },
    setCurrentDocument({ commit }, doc) {
      commit("setCurrentDocument", doc)
    },
    setProjectItemToCurrentDocument({ commit }, projectItem) {
      commit("setProjectItemToCurrentDocument", projectItem)
    },
    updateDocument({ commit, state }, doc) {
      const docs = [...state.documents]
      const curDocIdx = docs.findIndex(d => d.id === doc.id)

      if (curDocIdx !== -1) {
        docs[curDocIdx] = doc
      }

      commit("setDocuments", docs)
    },
    setDocumentType({ commit }, type) {
      commit("setDocumentType", DocumentTypes[type]);
    },
    async deskColumnCreate({ commit, state }, { name }) {
      const curDocId = state.currentDocument.id;
      return await deskColumnCreate(curDocId, { name }).then(res => {
        const column = ColumnAdapter(res.data.data);

        commit("addColumnToDocument", column);

        return column
      })
        .catch(err => {
          const error = ErrorAdapter(err);

          toast.error(error.message)
        });
    },
    async deskColumnDelete({ commit }, id) {
      return await deskColumnDelete(id).then(() => {
        commit("deleteColumnFromDocument", id);

        return null
      })
        .catch(err => {
          const error = ErrorAdapter(err);

          toast.error(error.message)
        });
    },
    async deskColumnMove({ commit }, { columnId, targetColumnId }) {
      return await deskColumnMove(columnId, { targetColumnId }).then(() => {
        return null
      })
        .catch(err => {
          const error = ErrorAdapter(err);

          toast.error(error.message)
        });
    },
    async deskColumnTaskCreate({ commit, state }, { column, name }) {
      return await deskColumnTaskCreate(column, { name }).then(res => {
        const task = TaskAdapter(res.data.data);
        commit("addTaskToColumn", { column, task });

        return task
      })
        .catch(err => {
          const error = ErrorAdapter(err);

          toast.error(error.message)
        });
    },
    async deskColumnTaskMove({ commit }, { task, targetTaskId, columnId }) {
      return await deskColumnTaskMove(task, { targetTaskId, columnId }).then(() => {
        return null
      })
        .catch(err => {
          const error = ErrorAdapter(err);

          toast.error(error.message)
        });
    },
    async deskColumnTaskUpdate({ commit }, { taskId, name, columnIndex, taskIndex }) {
      return await deskColumnTaskUpdate(taskId, { name }).then((res) => {
        const task = TaskAdapter(res.data.data);
        commit("updateTaskToColumn", { task, columnIndex, taskIndex });
        return task
      })
        .catch(err => {
          const error = ErrorAdapter(err);

          toast.error(error.message)
        });
    },
    async deskColumnTaskDelete({ commit }, { task, columnIdx, taskIdx }) {
      return await deskColumnTaskDelete(task.id).then(() => {
        commit("deleteTask", { columnIdx, taskIdx });
        return null
      })
        .catch(err => {
          const error = ErrorAdapter(err);

          toast.error(error.message)
        });
    },
    async deskColumnSetColor({ commit }, { column, columnIdx, color }) {
      return await deskColumnSetColor(column, { colorId: color.id }).then(() => {
        commit("updateDeskColumnColor", { columnIdx, color });
        return null
      })
        .catch(err => {
          const error = ErrorAdapter(err);

          toast.error(error.message)
        });
    },

    async fieldCreate({ commit }, { desk, name, type }) {
      return await deskFieldCreate(desk, { name, type }).then((res) => {
        const field = FieldAdapter(res.data.data);
        commit("pushField", field);
        return field
      })
        .catch(err => {
          const error = ErrorAdapter(err);

          toast.error(error.message)
          throw error; 
        });
    },
    async fieldUpdate({ commit }, { deskField, name, type, additionalParams }) {
      const params = {
        name,
        type,
        ...additionalParams,
      }
      return await deskFieldUpdate(deskField, params).then((res) => {
        const field = FieldAdapter(res.data.data);
        commit("updateField", field);
        return field
      })
        .catch(err => {
          const error = ErrorAdapter(err);

          toast.error(error.message)
          throw error; 
        });
    },
    async fieldDelete({ commit }, { deskField }) {
      return await deskFieldDelete(deskField).then((res) => {
        const field = FieldAdapter(res.data.data);
        commit("deleteField", deskField);
        return null
      })
        .catch(err => {
          const error = ErrorAdapter(err);

          toast.error(error.message)
          throw error; 
        });
    },
    async loadColors({ commit }) {
      return await getColors().then((res) => {
        const colors = map(res.data.data, ColorAdapter);
        commit("setColors", colors);
        return colors
      })
        .catch(err => {
          const error = ErrorAdapter(err);

          toast.error(error.message)
          throw error; 
        });
    },
    async loadTimeZones({ commit }) {
      return await getTimeZones().then((res) => {
        const timeZones = map(res.data.data, TimeZoneAdapter);
        commit("setTimeZones", timeZones);
        return timeZones
      })
        .catch(err => {
          const error = ErrorAdapter(err);

          toast.error(error.message)
          throw error; 
        });
    },
    async loadTimeFormats({ commit }) {
      return await getTimeFormats().then((res) => {
        const timeFormats = map(res.data.data, TimeFormatAdapter);
        commit("setTimeFormats", timeFormats);
        return timeFormats
      })
        .catch(err => {
          const error = ErrorAdapter(err);

          toast.error(error.message)
          throw error; 
        });
    },
    
  },
  getters: {
    getRecentDocuments: (state) => (id) => state.recentDocuments.find(el => el.projectId === id)?.documents,
    getDocuments: (state) => state.documents,
    getCurrentDocument: (state) => state.currentDocument,
    getDocumentType: (state) => state.documentType,
    isCurrentDocumentEditable: (state) => state.currentDocument?.projectItem?.editor?.id === user?.id,
    getColors: (state) => state.colors,
    getTimeFormats: (state) => state.timeFormats,
    getEditMode: (state) => state.editMode,
  },
};