import axios from "axios";

export const updateUserEmail = (data) => {
  return axios.patch("/api/user/personal/email", data);
};
export const updateUserPassword = (data) => {
  return axios.patch("/api/user/personal/password", data);
};
export const updateUserPhone = (data) => {
  return axios.patch("/api/user/personal/phone", data);
};
export const getUser = (data) => {
  return axios.get("/api/user/personal/me", data);
};
export const getCurrentUser = (data) => {
  return axios.get("/api/user/personal/me", data);
};
export const saveUserAvatar = (data) => {
  return axios.post("/api/user/personal/avatar", data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};
export const updateUserInfo = (data) => {
  return axios.patch("/api/user/personal/update", data);
};
