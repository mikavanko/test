import axios from "axios";
import ParamsSnakeAdapter from "@/adapters/ParamsSnake";

//projects
export const getDocumentsSearch = (project, paramsCamel) => {
  const paramsSnake = ParamsSnakeAdapter(paramsCamel)
  return axios.get(`/api/projects/${project}`, {
    params: paramsSnake,
  });
};


//documents
export const createDocument = (project, { name }) => {
  return axios.post(`/api/documents/project/${project}`, {
    name,
  });
};

export const getDocument = (documentId) => {
  return axios.get(`/api/documents/${documentId}`);
};
export const updateDocumentBlocks = (documentId, text) => {
  return axios.patch(`/api/documents/${documentId}/blocks`, {
    text,
  });
};

//projectItems
export const updateDocumentTitle = (projectItemId, name) => {
  return axios.patch(`/api/project-items/${projectItemId}`, {
    name,
  });
};

export const deleteDocument = (documentId) => {
  return axios.delete(`/api/project-items/${documentId}`);
};


export const moveDocument = (projectItemId, { targetProjectItemId }) => {
  return axios.patch(`/api/project-items/${projectItemId}/move-after`, {
    target_project_item_id: targetProjectItemId,
  });
};

export const toggleLinkDocument = (documentId) => {
  return axios.patch(`/api/project-items/${documentId}/toggle/link`);
};

export const toggleEditDocument = (documentId) => {
  return axios.patch(`/api/project-items/${documentId}/toggle/edit`);
};

export const blockDocument = (documentId) => {
  return axios.patch(`/api/project-items/${documentId}/toggle/block`);
};

export const regenerateLinkDocument = (documentId) => {
  return axios.patch(`/api/project-items/${documentId}/regenerate-link`);
};

export const getDocumentByCode = (code) => {
  return axios.get(`/api/project-items/code`, {
    params: {
      code,
    }
  });
};