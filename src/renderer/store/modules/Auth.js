function getObj(state, targetPath) {
  var tem = state;
  if (targetPath == "") {
    return tem;
  }
  let arr = targetPath.split("/");
  arr.forEach((item) => {
    tem = tem[item];
  });
  return tem;
}
function getIndex(arr, id) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].id == id) {
      return i;
    }
  }
  return -1;
}
const state = {
  user: {},
  music: {
    musicDisplay: false,
    musicIndex: -1,
    musicArr: [],
  },
  theme:{
    img:"",
    maskOpacity:70
  },
};

const getters = {
  getResult:
    (state) =>
    ({ pathStr, subject, startTime, endTime }) => {
      let temp = getObj(state, pathStr);
      if (subject) {
        temp = temp.filter((item) => {
          return item.su == subject;
        });
      }
      if (startTime && endTime) {
        temp = temp.filter((item) => {
          return item.id >= startTime && item.id <= endTime;
        });
      }
      return temp;
    },
};

const mutations = {
  addData(state, { targetPath, obj }) {
    let tem = getObj(state, targetPath);
    tem.push(obj);
  },
  editData(state, { id, targetPath, obj }) {
    let tem = getObj(state, targetPath);
    let index = getIndex(tem, id);
    if (index == -1) {
      console.log("err");
      return;
    }
    tem.splice(index, 1, obj);
  },
  deleteData(state, { id, targetPath }) {
    let tem = getObj(state, targetPath);
    let index = getIndex(tem, id);
    if (index == -1) {
      console.log("err");
      return;
    }
    tem.splice(index, 1);
  },
  batchDelete(state, { idArr, targetPath }) {
    let tem = getObj(state, targetPath);
    idArr.forEach((_) => {
      let index = getIndex(tem, _);
      tem.splice(index, 1);
    });
  },
  batchEditSubjects(state, { idArr, subject, targetPath }) {
    let tem = getObj(state, targetPath);
    idArr.forEach((_) => {
      let index = getIndex(tem, _);
      tem[index].su = subject;
    });
  },

  directAssignment(state, { targetPath, attr, obj }) {
 
    let tem = getObj(state, targetPath);
    tem[attr] = JSON.parse(JSON.stringify(obj));
  },
};

const actions = {
  directAssignmentAction({ commit }, payload) {
    commit("directAssignment", payload);
  },

  addDataAction({ commit }, payload) {
    commit("addData", payload);
  },
  editDataAction({ commit }, payload) {
    commit("editData", payload);
  },
  deleteDataAction(context, payload) {
    context.commit("deleteData", payload);
  },

  batchDeleteAction(context, payload) {
    context.commit("batchDelete", payload);
  },
  batchEditSubjectsAction(context, payload) {
    context.commit("batchEditSubjects", payload);
  },
};

export default {
  state,
  mutations,
  actions,
  getters,
};
