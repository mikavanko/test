import axios from "axios";
import { loginByPassword, loginByPhone, verifyCode } from "@/api/auth";
import { getUser } from "@/api/userPersonal";
import UserAdapter from "@/adapters/User"

export default {
  namespaced: true,
  state: {
    status: "",
    token: localStorage.getItem("token") || null,
    factorsCount: parseInt(localStorage.getItem("factorsCount")) || 0,
    user: JSON.parse(localStorage.getItem("user")) || null,
  },
  mutations: {
    authStep(state, { token, user, factorsCount, status }) {
      state.status = status ?? "";
      state.factorsCount = factorsCount ?? 0;
      state.token = token ?? null;
      state.user = user ?? null;
    },
    authError(state) {
      state.status = "error";
    },
    logout(state) {
      state.status = "";
      state.token = null;
      state.factorsCount = 0;
      state.user = null;
    },
    setUser(state, user) {
      state.user = user;
    },
  },
  actions: {
    async getUser({ commit }) {
      return await getUser()
        .then(({ data }) => {
          const user = UserAdapter(data.data)
          localStorage.setItem("user", JSON.stringify(user));
          commit('setUser', user)
          return user
        })
    },
    async loginByPassword({ commit }, d) {
      return await loginByPassword(d)
        .then(({ data }) => {
          const factorsCount = data.data.factorsCount;
          // const phone = d.phone;
          const user = {
            ...data.data.user,
            // phone,
          };

          localStorage.setItem("user", JSON.stringify(user));
          localStorage.setItem("factorsCount", factorsCount);

          commit("authStep", { user, factorsCount });

          return data.data;
        })
        .catch((error) => {
          commit("authError");

          return {
            error,
          };
        });
    },
    async loginByPhone({ commit }, data) {
      return await loginByPhone(data)
        .then(({ data }) => {
          const factorsCount = data.data.factorsCount;
          const user = data.data.user;
          const token = data.data.token?.token;

          localStorage.setItem("user", JSON.stringify(user));
          localStorage.setItem("token", token);
          localStorage.setItem("factorsCount", factorsCount);

          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          commit("authStep", { token, user, factorsCount, status: "success" });

          return data.data;
        })
        .catch((error) => {
          commit("authError");

          return {
            error,
          };
        });
    },
    logout({ commit }) {
      return new Promise((res) => {
        commit("logout");

        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("factorsCount");
        delete axios.defaults.headers.common["Authorization"];

        res();
      });
    },
    async verifyCode({ commit }, data) {
      return await verifyCode(data).then(({ data }) => {
        const user = {
          phone: data.data.phone,
          id: data.data.id,
        };

        localStorage.setItem("user", JSON.stringify(user));

        commit("setUser", user);

        return data.data;
      });
    },
  },
  getters: {
    isLoggedIn: (state) => !!state.token,
    authStatus: (state) => state.status,
    getUser: (state) => state.user,
  },
};
