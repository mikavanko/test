import { isMobile } from "@/assets/js/utils";

export default {
  namespaced: true,
  state: {
    isVisible: !isMobile(),
    visibleInHiddenMod: false,
  },
  mutations: {
    setMenuVisibility(state, val) {
      state.isVisible = val
    },
    setVisibilityInHiddenMod(state, val) {
      state.visibleInHiddenMod = val
    },
  },
  actions: {
    setMenuVisibility({ commit }, data) {
      commit("setMenuVisibility", data);
    },
    setVisibilityInHiddenMod({ commit }, data) {
      commit("setVisibilityInHiddenMod", data);
    },
  },
  getters: {
    isVisible: (state) => state.isVisible,
    isVisibleInHiddenMod: (state) => state.visibleInHiddenMod,
  },
};
