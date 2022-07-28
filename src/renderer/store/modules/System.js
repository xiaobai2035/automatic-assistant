const state = {
  crudObj: {},
};

const mutations = {
  setCrudObj(state, payload) {
    state.crudObj = JSON.parse(JSON.stringify(payload));
  },
  setCrudDialog(state, payload) {
    state.crudObj.crudDialog = payload;
  },
};

const actions = {
  setCrudObjAction({ commit }, payload) {
    commit("setCrudObj", payload);
  },
  setCrudDialogAction({ commit }, payload) {
    commit("setCrudDialog", payload);
  },
};

export default {
  state,
  mutations,
  actions,
};
