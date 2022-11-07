import axios from "axios";
import ParamsSnakeAdapter from "@/adapters/ParamsSnake";

export const createProject = (data) => {
  return axios.post("/api/projects", data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
  });
};
export const appendUsersToProject = (projectId, data) => {
  return axios.post(`/api/projects/${projectId}/users`, data);
};
export const getProjectUsers = (projectId, paramsCamel) => {
  const paramsSnake = ParamsSnakeAdapter(paramsCamel)
  return axios.get(`/api/projects/${projectId}/users`, {
    params: paramsSnake
  });
};
export const getProject = (projectId) => {
  return axios.get(`/api/projects/${projectId}`);
};
export const leaveProject = (projectId) => {
  return axios.post(`/api/projects/${projectId}/leave`);
};
export const getProjects = (paramsCamel) => {
  const paramsSnake = ParamsSnakeAdapter(paramsCamel)
  return axios.get(`/api/projects`, {
    params: paramsSnake
  });
};
export const getUsers = (paramsCamel) => {
  const paramsSnake = ParamsSnakeAdapter(paramsCamel)
  return axios.get(`/api/user/search`, {
    params: paramsSnake,
  });
};
export const regenerateLink = (projectId) => {
  return axios.patch(`/api/projects/${projectId}/regenerate-link`);
};
export const toggleLink = (projectId) => {
  return axios.patch(`/api/projects/${projectId}/toggle-link`);
};

export const getProjectByCode = (code) => {
  return axios.post(`/api/projects/code`, {
    code,
  });
};

export const changeUserRole = (projectId, { userId, role }) => {
  return axios.patch(`/api/projects/${projectId}/role`, {
    user_id: userId,
    role,
  });
};