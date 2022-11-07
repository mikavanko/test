import axios from "axios";

export const projectItemUpdate = (projectItemId, params) => {
  return axios.patch(`/api/project-items/${projectItemId}`, params);
};

export const projectItemClone = (projectItemId) => {
  return axios.patch(`/api/project-items/${projectItemId}/clone`);
};

export const projectItemDelete = (projectItemId) => {
  return axios.delete(`/api/project-items/${projectItemId}`);
};

export const ProjectItemMoveAfter = (projectItemId, params) => {
  return axios.patch(`/api/project-items/${projectItemId}`, params);
};

