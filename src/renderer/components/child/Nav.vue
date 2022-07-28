<template>
  <div class="nav">
    <div>
      <div class="left">
        <div class="log"><router-link to="/index">Control</router-link></div>
        <ul v-show="isShowMenu">
          <li>
            <router-link to="/copy">Copy</router-link>
          </li>
          <li>
            <router-link to="/not">Note</router-link>
          </li>
          <li>
            <router-link to="/search">Search</router-link>
          </li>

          <li>
            <router-link to="/rec">Diary</router-link>
          </li>
          <li>
            <router-link to="/acc">Accounting</router-link>
          </li>
          <li>
            <router-link to="/beh">Behavior</router-link>
          </li>

          <li>
            <router-link to="/tod">Todo</router-link>
          </li>
          <li>
            <router-link to="/sho">Shortcut</router-link>
          </li>
          <li>
            <router-link to="/set">Set</router-link>
          </li>
          <li>
            <router-link to="/log">Log</router-link>
          </li>
        </ul>
      </div>
      <div class="right">
        <li>
          <a href="javascript:;" @click="setScreen('window-min')"
            ><span class="el-icon-minus"></span
          ></a>
        </li>
        <li>
          <a href="javascript:;" @click="setScreen('window-full')"
            ><span class="el-icon-full-screen"></span
          ></a>
        </li>
        <li class="window-close-btn">
          <a href="javascript:;" @click="setScreen('window-close')"
            ><span class="el-icon-close"></span
          ></a>
        </li>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Nav",
  props: ["showMenu"],
  data() {
    return {};
  },

  computed: {
    isShowMenu() {
      let ret = false;
      if (this.$store.state.Auth.user.persenalSettings) {
        ret = this.$store.state.Auth.user.persenalSettings.isShowMenu;
      }
      return this.showMenu || ret;
    },
  },

  methods: {
    setScreen(content) {
      this.$electron.ipcRenderer.sendSync("setWindow", { content });
    },
  },
};
</script>

<style scoped>
.nav {
  width: 100%;
  min-width: 900px;
  height: 25px;
  line-height: 25px;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1999;
  padding-left: 10px;
  background: rgba(236, 236, 236, 0.722);

  -webkit-app-region: drag;
  -moz-user-select: none;
  -webkit-user-select: none;
  user-select: none;
}

.nav .left {
  float: left;
  width: 600px;
}

.nav .right {
  float: right;
}
.nav .log {
  float: left;
  margin-right: 15px;
  font-size: 14px;
}

.nav li {
  float: left;
  font-family: Verdana, Geneva, Tahoma, sans-serif;
  text-align: center;
  list-style: none;
}

.nav .left li {
  margin-right: 15px;
}

.nav .right li {
  width: 33px;
}

.nav .right li:hover {
  background: rgba(124, 124, 124, 0.4);
}

.nav li a {
  width: 100%;
  display: inline-block;
  -webkit-app-region: no-drag;
}
.nav .log a {
  -webkit-app-region: no-drag;
  font-weight: bold;
}

.nav li.window-close-btn:hover {
  background: rgb(255, 41, 41);
}

.nav li.window-close-btn:hover > a {
  color: #fff;
}
</style>
