<template>
  <div id="app" :style="styleObject">
    <div class="mask" :style="maskObject">
      <Nav :showMenu="showMenu"></Nav>
      <div v-if="musicDisplay" class="music-wrap">
        <audio id="mp3" ref="mp3" controls loop>
          <source :src="musicUrl" type="audio/mpeg" />
        </audio>
      </div>

      <Crud></Crud>

      <keep-alive exclude="middle-page,set-page">
        <router-view></router-view>
      </keep-alive>
    </div>
  </div>
</template>

<script>
import fs from "fs";
import { writeFile } from "@/assets/js/common.js";

import Crud from "./components/child/Crud";
import Nav from "./components/child/Nav";

export default {
  name: "control",
  components: { Nav, Crud },
  data() {
    return {
      showMenu: false,
      showMenuTimer: null,
    };
  },
  computed: {
    picUrl() {
      return this.$store.state.Auth.theme.img;
    },

    styleObject: function () {
      if (this.picUrl != "") {
        return {
          background:
            "url(" + this.picUrl + ") center center / cover no-repeat",
        };
      } else {
        return {
          background: "url(static/bg.jpg) center center / cover no-repeat",
        };
      }
    },
    maskObject() {
      let opacity = this.$store.state.Auth.theme.maskOpacity;
      return {
        background: "rgba(255, 255, 255, " + opacity / 100 + ")",
      };
    },
    musicDisplay() {
      return this.$store.state.Auth.music.musicDisplay;
    },
    musicUrl() {
      let ret = "";
      let temp = this.$store.state.Auth.music;
      let songPath = temp.musicArr[temp.musicIndex];

      const buf = fs.readFileSync(songPath);
      const uint8Buffer = Uint8Array.from(buf);
      const bolb = new Blob([uint8Buffer]);
      ret = window.URL.createObjectURL(bolb);
      return ret;
    },
  },

  mounted() {
    let temp = {
      musicDisplay: false,
      musicIndex: -1,
      musicArr: this.$electron.ipcRenderer.sendSync("getMusic", {}),
    };
    this.$store.dispatch("directAssignmentAction", {
      targetPath: "",
      attr: "music",
      obj: temp,
    });

    this.$electron.ipcRenderer.on("jumpToRoute", (e, args) => {
      if (this.$route.path !== args) {
        this.$router.push(args);
      }
    });

    this.$electron.ipcRenderer.on("wantToClose", (e, args) => {
      this.$alert(
        "Are you sure you want to close the program? Please enter 'quit' in the main interface input box.",
        "Task",
        {
          confirmButtonText: "sure",
          callback: (action) => {
            if (this.$route.path !== "/index") {
              this.$router.push("/index");
            }
          },
        }
      );
    });

    this.$electron.ipcRenderer.on("pauseMusic", (e, args) => {
      if (this.$refs.mp3) {
        this.$refs.mp3.pause();
      }
    });

    this.$electron.ipcRenderer.on("updateData", (e, args) => {
      this.$store.dispatch("directAssignmentAction", {
        targetPath: "",
        attr: "user",
        obj: args,
      });
    });
    this.$electron.ipcRenderer.on("sendSingleData", (e, args) => {
      this.$store.dispatch("addDataAction", args).then(() => {
        writeFile("no message");
      });
    });
    let _this = this;
    document.onkeydown = function (ev) {
      if (ev.ctrlKey && ev.key == "g") {
        clearTimeout(_this.showMenuTimer);
        _this.showMenu = true;
        _this.showMenuTimer = setTimeout(() => {
          _this.showMenu = false;
        }, 30000);
      }
    };
  },
};

const { remote, ipcRenderer } = require("electron");
const { FindInPage } = require("electron-find");
let findInPage = new FindInPage(remote.getCurrentWebContents(), {
  offsetTop: 25,
  offsetRight: 0,
});
ipcRenderer.on("on-find", (e, args) => {
  findInPage.openFindWindow();
});
</script>

<style>
body {
  font-size: 12px;
}
html,
body,
#app {
  height: 100%;
}
* {
  box-sizing: border-box;
}
h1 {
  padding: 10px;
  font-size: 15px;
  padding-left: 27px;
  color: #c07115;
  border-bottom: 1px dashed grey;
}

#app .mask {
  background: radial-gradient(
    ellipse at top left,
    rgba(255, 255, 255, 1) 40%,
    rgba(229, 229, 229, 0.9) 100%
  );
  height: 100vh;
  width: 100vw;
  min-width: 900px;
}
.wrapper {
  padding: 25px 15px;
  height: 100%;
  box-sizing: border-box;
  min-width: 900px;
}

.wrapper .time-wrap .el-date-editor .el-range__icon {
  line-height: 13px;
}
/* time-picker */
.wrapper .time-wrap .el-input__inner {
  height: 20px;
}

.wrapper .time-wrap .el-range-input {
  font-size: 12px;
}

.el-date-editor .el-range__close-icon {
  line-height: 13px;
  font-size: 14px;
}
.el-date-editor .el-range-separator {
  line-height: 15px;
  font-size: 9px;
}
.el-date-editor--monthrange.el-input,
.el-date-editor--monthrange.el-input__inner {
  width: 275px;
}

.el-date-range-picker.has-sidebar {
  width: 660px;
}
.music-wrap {
  position: fixed;
  right: 5px;
  bottom: 5px;
  z-index: 9999;
  font-size: 10px;
}

.el-button.is-round {
  border-radius: 20px;
  padding: 9px 23px;
}
.el-tabs {
  height: calc(100% - 35px);
}

.el-tab-pane {
  height: 100%;
}
.el-tabs__content {
  height: 100%;
}

.container {
  height: calc(100% - 35px);
  padding: 30px;
  overflow: auto;
}

.header::after {
  display: table;
  content: "";
  clear: both;
}
.header button {
  float: right;
}

.header button {
  padding: 4px;
  font-size: 11px;
  float: right;
  margin-top: 8px;
  margin-right: 35px;
}

.foot {
  height: 45px;
  position: absolute;
  bottom: 0;
  left: 0;
  text-align: center;

  width: 100%;
  border-top: 1px solid #e5e5e5;
  padding-top: 5px;
  z-index: 199;
}
.el-empty {
  background: #fff;
}
.el-result {
  background: #fff;
  border-radius: 5px;
  margin-top: 15px;
  width: 880px;
}
.input-new-tag input {
  width: 300px;
}
</style>
