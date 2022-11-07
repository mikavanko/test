import axios from "axios";

export const loginByPassword = (data) => {
  return axios.post("/api/auth/loginByPassword", data);
};
export const loginByPhone = (data) => {
  return axios.post("/api/auth/loginByPhone", data);
};
export const saveData = (data) => {
  return axios.post("/api/auth/saveData", data);
};
export const confirmPhone = (data) => {
  return axios.patch("/api/auth/confirmPhone", data);
};
export const sendCode = (data) => {
  return axios.post("/api/auth/sendCode", data);
};
export const verifyCode = (data) => {
  return axios.post("/api/auth/verifyCode", data);
};
export const updatePassword = (data) => {
  return axios.patch("/api/auth/updatePassword", data);
};
export const validateUserData = (params) => {
  return axios.get("/api/auth/validateUserData", { params });
};
export const validatePassword = (params) => {
  return axios.get("/api/auth/validatePassword", { params });
};
export const registration = (data) => {
  return axios.post("/api/auth/registration", data);
};
export const telegramBindUser = ({ code, phone }) => {
  return axios.post("/api/telegram/bind-user", {
    code,
    phone,
  });
};
