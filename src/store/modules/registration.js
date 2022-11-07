import axios from "axios";
import { registration, telegramBindUser } from "@/api/auth";

export default {
  namespaced: true,
  state: {
    params: JSON.parse(localStorage.getItem("regParams")) || {},
    registrationToken: localStorage.getItem("registrationToken") || null,
  },
  mutations: {
    setParams(state, val) {
      const params = Object.assign(state.params, val, {});
      localStorage.setItem("regParams", JSON.stringify(params));
      state.params = params;
    },
    clearRegistration(state) {
      localStorage.removeItem("regParams");
      state.params = {};
    },
    setRegistrationToken(state, token) {
      localStorage.setItem("registrationToken", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      state.registrationToken = token
    }
  },
  actions: {
    setParams({ commit }, data) {
      commit("setParams", data);
    },
    async registration({ commit }, data) {
      return await registration(data).then(({ data }) => {
        commit("setRegistrationToken", data.data.token.token);

        return data.data;
      });
    },
    async telegramBindUser({ state, commit }, { code, phone }) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${state.registrationToken}`;
      return await telegramBindUser({ code, phone }).then(({ data }) => {
        commit("clearRegistration");

        return data;
      });
    },
    
  },
  getters: {
    getParams: (state) => state.params,
  },
};
