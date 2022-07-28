import Vue from "vue";
import Router from "vue-router";
import store from "../store";
const ipcRenderer = require("electron").ipcRenderer;

Vue.use(Router);

const router = new Router({
  routes: [
    {
      path: "/",
      name: "landing-page",
      component: require("@/components/LandingPage").default,
    },
    {
      path: "/index",
      name: "index-page",
      component: require("@/components/IndexPage").default,
    },
    {
      path: "/rec",
      name: "record-page",
      component: require("@/components/RecordPage").default,
    },
    {
      path: "/acc",
      name: "accounting-page",
      component: require("@/components/AccountingPage").default,
    },
    {
      path: "/sho",
      name: "short-page",
      component: require("@/components/ShortPage").default,
    },
    {
      path: "/beh",
      name: "behavior-page",
      component: require("@/components/BehaviorPage").default,
    },
    {
      path: "/tod",
      name: "todo-page",
      component: require("@/components/TodoPage").default,
    },
    {
      path: "/set",
      name: "set-page",
      component: require("@/components/SetPage").default,
    },
    {
      path: "/not",
      name: "notes-page",
      component: require("@/components/NotesPage").default,
    },

    {
      path: "/copy",
      name: "copy-page",
      component: require("@/components/CopyPage").default,
    },
    {
      path: "/search",
      name: "search-page",
      component: require("@/components/SearchPage").default,
    },
    {
      path: "/log",
      name: "log-page",
      component: require("@/components/LogPage").default,
    },

    {
      path: "/middle",
      name: "middle-page",
      component: require("@/components/MiddlePage").default,
    },
    {
      path: "*",
      redirect: "/",
    },
  ],
});

router.beforeEach((to, from, next) => {
  let isLogin = ipcRenderer.sendSync(
    "checkLoginStatus",
    store.state.Auth.user.time
  );

  if (isLogin) {
    next();
  } else {
    store.dispatch("directAssignmentAction", {
      targetPath: "",
      attr: "user",
      obj: {},
    });
    if (to.path === "/") {
      next();
    } else {
      next("/");
    }
  }

  if (
    ["/rec", "/acc", "/beh", "/tod", "/sho", "/set", "/log"].includes(to.path)
  ) {
    let isTwoLevelLogin = ipcRenderer.sendSync("checkTwoLevelLogin", to.path);

    if (isTwoLevelLogin) {
      next();
    } else {
      next("/middle");
    }
  }
});
export default router;
