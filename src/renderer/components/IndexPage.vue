<template>
  <div id="wrapper">
    <main>
      <div class="infomation-wrap">
        <div v-if="mode == ''">
          <p class="one-word" :style="onwWordStyle">{{ oneWord }}</p>
          <p>{{ lastLoginTime }}</p>
        </div>
        <div v-else>
          <tag :arr="promptArr" v-on:tagEvent="tagClick"></tag>
        </div>
      </div>

      <div class="textarea-wrap">
        <div class="main-input-wrap">
          <span>></span>
          <textarea
            ref="theInput"
            name=""
            id=""
            cols="30"
            rows="20"
            v-model="inputValue"
            @input="checkInput"
            @keydown.enter="keydownEnterFn($event)"
            @keydown="keydownFn($event)"
          ></textarea>
        </div>

        <div class="memorandum-wrap">
          <span class="memo-title">MEMO</span>
          <textarea
            name=""
            id=""
            cols="30"
            rows="10"
            v-model="memorandumContent"
            @keydown="memorandumKeydownFn($event)"
          ></textarea>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import Tag from "./child/Tag";
import dayjs from "dayjs";
import { writeFile, talkFn, random } from "@/assets/js/common.js";

const path = require("path");

export default {
  name: "landing-page",
  data() {
    return {
      memorandumContent: "",
      memorandumTimer: null,
      playingSongName: "",
      lastLoginTime: "",
      mode: "",
      oneWord: "",
      isTalking: false,
      recordSubject: "",
      formName: "",
      inputValue: "",

      digitalInputReg: /(^[\+\-\*][0-9]+[\.]?[0-9]*)(\s+)(.*)/,
      clockReg: /^c([0-9]{2})(:[0-9]{2})?$/,

      recordForm: {
        name: "",
        content: "",
        su: "",
        id: 0,
      },
      accountingForm: {
        name: "",
        number: 0,
        remark: "",
        id: 0,
      },
    };
  },

  computed: {
    onwWordStyle() {
      if (this.isTalking) {
        return {
          color: "orange",
        };
      }
    },

    promptArr() {
      return this.$store.getters.getResult({ pathStr: "user/data/subjects" })[
        this.mode
      ];
    },
    getOneWord() {
      let arr = this.$store.getters.getResult({
        pathStr: "user/data/record",
        subject: "oneWord",
      });

      return arr[random(0, arr.length)].content;
    },
    getMusic() {
      return this.$store.getters.getResult({ pathStr: "music" });
    },
  },
  components: {
    Tag,
  },
  mounted() {
    let arr = this.$store.state.Auth.user.data.log.filter((_) => {
      return _.name.includes("Login");
    });
    if (arr.length == 1) {
      this.lastLoginTime = "";
    } else {
      let temp = arr[arr.length - 2].id;
      this.lastLoginTime =
        "Last Login Time: " + dayjs(temp).format("YYYY-MM-DD HH:mm:ss");
      setTimeout(() => {
        this.lastLoginTime = "";
      }, 20000);
    }

    this.oneWord = this.getOneWord;
    this.$refs.theInput.focus();

    this.memorandumContent = this.$electron.ipcRenderer.sendSync(
      "readMemorandum",
      {}
    );
  },

  activated() {
    this.$refs.theInput.focus();
  },
  methods: {
    ellipsisFn(str) {
      if (str.length > 20) {
        return str.substring(0, 20) + "...";
      }
      return str;
    },
    tagClick(index) {
      this.submitEvent(index);
    },
    submitEvent(num) {
      if (this.mode == "record") {
        this.recordSubject = this.promptArr[num];
      } else {
        this.formName = this.promptArr[num];
      }
      this.submitData();
    },
    keydownFn(ev) {
      if (ev.ctrlKey && this.promptArr && this.promptArr[ev.key]) {
        this.submitEvent(ev.key);
      }
      if (ev.altKey && ev.key == "v") {
        let ret = this.$electron.ipcRenderer.sendSync("getClipboardImg", {});
        this.inputValue += ret;
      }

      if (ev.key == "ArrowUp") {
        if (this.inputValue == "" && this.saveInput != "") {
          this.inputValue = this.saveInput;
        }
      }
    },
    saveInputFn() {
      clearTimeout(this.saveInputTimer);
      this.saveInput = this.inputValue;
      this.saveInputTimer = setTimeout(() => {
        this.saveInput = "";
      }, 15000);
    },
    checkInput() {
      if (this.isTalking) {
        return;
      }
      let inputStr = this.inputValue;
      let firstChar = inputStr.substring(0, 1);

      if (inputStr.match(this.digitalInputReg)) {
        if (firstChar == "+") {
          this.mode = "income";
        } else if (firstChar == "-") {
          this.mode = "expenses";
        } else if (firstChar == "*") {
          this.mode = "behavior";
        }
      } else if (firstChar == "#") {
        this.mode = "record";
      } else {
        this.mode = "";
      }
    },
    submitData() {
      if (this.mode == "record") {
        this.submitRecord();
      } else {
        this.submitAccounting();
      }
    },
    submitRecord() {
      let tempArr = this.inputValue.split("\n");
      let name = tempArr.shift().replace("#", "").trim();
      let content = tempArr.join("\n").trim();

      if (!name && !content) {
        this.$message.error("Can't be empty value");
        return;
      }

      this.recordForm.name = name;
      this.recordForm.content = content;
      this.recordForm.su = this.recordSubject;
      this.recordForm.id = dayjs().valueOf();
      const h = this.$createElement;
      this.$store
        .dispatch("addDataAction", {
          targetPath: "user/data/record",
          obj: JSON.parse(JSON.stringify(this.recordForm)),
        })
        .then(() => {
          writeFile({
            message: h(
              "div",
              {
                style: "width:300px;line-height:20px",
              },
              [
                h("p", null, [
                  h(
                    "span",
                    {
                      style: "display:inline-block;width:70px",
                    },
                    "name:"
                  ),
                  h("span", null, this.recordForm.name),
                ]),
                h("p", null, [
                  h(
                    "span",
                    {
                      style: "display:inline-block;width:70px",
                    },
                    "content:"
                  ),
                  h("span", null, this.ellipsisFn(this.recordForm.content)),
                ]),
              ]
            ),
            type: "success",
          });
        });

      this.mode = "";
      this.saveInputFn();
      this.inputValue = "";
    },

    submitClock() {
      let tempArr = this.inputValue.match(this.clockReg);

      if (tempArr[2]) {
        let time = `${dayjs().format("YYYY-MM-DD")} ${tempArr[1]}${
          tempArr[2]
        }:00`;

        if (dayjs(time).valueOf() <= dayjs().valueOf()) {
          this.$message.error("The time has passed");
          return;
        }
        let clock = {
          name: "Temp Clock",
          remind: true,
          time,
        };

        this.$electron.ipcRenderer.sendSync("addNewClock", clock);
        this.$message({
          message: `Remind you at ${tempArr[1]}${tempArr[2]}`,
          type: "success",
        });
        this.inputValue = "";
      } else {
        let minutesNum = tempArr[1];
        let time = dayjs()
          .add(minutesNum, "minute")
          .format("YYYY-MM-DD HH:mm:ss");
        let clock = {
          name: "Countdown",
          remind: true,
          time,
        };

        this.$electron.ipcRenderer.sendSync("addNewClock", clock);
        this.$message({
          message: `Remind you ${minutesNum} minutes later`,
          type: "success",
        });
        this.inputValue = "";
      }
    },
    submitAccounting() {
      let tempArr = this.inputValue.match(this.digitalInputReg);
      this.formName = this.formName == "" ? this.promptArr[0] : this.formName;

      this.accountingForm.name = this.formName;
      this.accountingForm.number = tempArr[1].replace("*", "") * 1;
      this.accountingForm.remark = tempArr[3];
      this.accountingForm.id = dayjs().valueOf();

      let tempStr = this.mode;
      if (this.mode == "income" || this.mode == "expenses") {
        tempStr = "accounting";
      }
      const h = this.$createElement;
      this.$store
        .dispatch("addDataAction", {
          targetPath: "user/data/" + tempStr,
          obj: JSON.parse(JSON.stringify(this.accountingForm)),
        })
        .then(() => {
          writeFile({
            message: h(
              "div",
              {
                style: "line-height:20px",
              },
              [
                h("p", null, [
                  h(
                    "span",
                    {
                      style: "display:inline-block;width:70px",
                    },
                    "number:"
                  ),
                  h("span", null, this.accountingForm.number),
                ]),
                h("p", null, [
                  h(
                    "span",
                    {
                      style: "display:inline-block;width:70px",
                    },
                    "name:"
                  ),
                  h("span", null, this.accountingForm.name),
                ]),

                h("p", null, [
                  h(
                    "span",
                    {
                      style: "display:inline-block;width:70px",
                    },
                    "remark:"
                  ),
                  h("span", null, this.accountingForm.remark),
                ]),
              ]
            ),
            type: "success",
          });
        });

      this.mode = "";
      this.formName = "";
      this.saveInputFn();
      this.inputValue = "";
    },
    pauseMusic() {
      let temp = JSON.parse(JSON.stringify(this.getMusic));
      temp.musicDisplay = false;
      this.$store.dispatch("directAssignmentAction", {
        targetPath: "",
        attr: "music",
        obj: temp,
      });
    },
    keydownEnterFn(event) {
      let judge = true;
      let inputStr = this.inputValue;
      if (inputStr.substring(0, 8) == "songname") {
        let temp = this.oneWord;
        this.oneWord =
          this.playingSongName == ""
            ? "You do not play songs..."
            : "This song is —— " + this.playingSongName;
        if (!this.isTalking) {
          setTimeout(() => {
            this.oneWord = temp;
          }, 5000);
        }
        this.saveInput = this.inputValue;
        this.inputValue = "";
      } else if (inputStr.substring(0, 4) == "play") {
        if (this.getMusic.musicArr.length < 1) {
          this.$message.error("There is not any songs");
          return;
        }

        this.pauseMusic();
        let temp = JSON.parse(JSON.stringify(this.getMusic));
        let songIndex = -1;
        let songName = inputStr.replace("play ", "");

        if (songName != "") {
          let songSubjects = ["sad song", "exciting song", "silence song"];
          if (songSubjects.includes(songName)) {
            songName = talkFn(songName);
          }

          for (let i = 0; i < this.getMusic.musicArr.length; i++) {
            if (
              this.getMusic.musicArr[i].toLocaleLowerCase().includes(songName)
            ) {
              songIndex = i;
              break;
            }
          }
        }
        if (songIndex == -1) {
          songIndex = random(0, this.getMusic.musicArr.length);
        }

        setTimeout(() => {
          temp.musicDisplay = true;
          temp.musicIndex = songIndex;

          this.playingSongName = path.basename(
            temp.musicArr[songIndex],
            ".mp3"
          );
          this.$store.dispatch("directAssignmentAction", {
            targetPath: "",
            attr: "music",
            obj: temp,
          });

          this.$nextTick(() => {
            this.$root.$children[0].$refs.mp3.play();
          });
        }, 500);
        this.saveInput = this.inputValue;
        this.inputValue = "";
      } else if (inputStr == "stop") {
        this.pauseMusic();
        this.saveInput = this.inputValue;
        this.inputValue = "";
      } else if (inputStr == "robot") {
        this.oneWord = "...";
        setTimeout(() => {
          this.oneWord = talkFn(inputStr);
        }, random(300, 1000));
        this.isTalking = true;
        this.saveInputFn();
        this.inputValue = "";
      } else if (inputStr == "bye" || inputStr == "byebye") {
        this.oneWord = "Bye...";
        setTimeout(() => {
          this.oneWord = this.getOneWord;
        }, random(300, 1000));
        this.isTalking = false;
        this.inputValue = "";
      } else if (this.isTalking) {
        this.oneWord = "...";
        setTimeout(() => {
          this.oneWord = talkFn(inputStr);
        }, random(300, 1000));
        this.saveInputFn();
        this.inputValue = "";
      } else if (inputStr.match(this.digitalInputReg)) {
        this.submitData();
      } else if (inputStr.match(this.clockReg)) {
        this.saveInput = this.inputValue;
        this.submitClock();
      } else if (inputStr == "quit") {
        this.$store.dispatch("directAssignmentAction", {
          targetPath: "",
          attr: "user",
          obj: {},
        });
        this.$electron.ipcRenderer.sendSync("quitApp", {});
      } else {
        judge = false;
      }
      if (judge) {
        event.preventDefault();
        return false;
      }
    },

    memorandumKeydownFn(ev) {
      clearTimeout(this.memorandumTimer);
      this.memorandumTimer = setTimeout(() => {
        this.saveFn();
      }, 8000);
      if (ev.ctrlKey && (ev.key == "s" || ev.key == "S")) {
        this.saveFn();
      }
    },
    saveFn() {
      clearTimeout(this.memorandumTimer);
      this.$electron.ipcRenderer.sendSync(
        "writeMemorandum",
        this.memorandumContent
      );
      this.$message({
        message: "Save Memorandum Successfully",
        type: "success",
      });
    },
  },
};
</script>

<style>
.infomation-wrap {
  max-height: 90px;
  overflow: auto;
  line-height: 25px;
  margin: 10px 0;
  position: relative;
  z-index: 99;
}

textarea {
  width: 100%;
  background: none;
  border: none;
  outline: none;
  caret-color: #fa0560;
  font-weight: bolder;
}

.one-word {
  color: rgb(7, 178, 172);
  padding-top: 15px;
  font-size: 15px;
  font-weight: bold;
  font-family: "Lucida Sans", "Lucida Sans Regular", "Lucida Grande",
    "Lucida Sans Unicode", Geneva, Verdana, sans-serif;
}
.textarea-wrap {
  min-width: 840px;
  height: 330px;
}
.main-input-wrap {
  float: left;
  position: relative;
  width: 550px;
}
.main-input-wrap span {
  position: absolute;
  top: 4px;
  left: -10px;
}
.memorandum-wrap {
  float: right;
  position: relative;
  border-left: 1px dashed rgba(0, 0, 0, 0.244);
}
.memorandum-wrap textarea {
  height: 310px;
  padding: 5px;
  padding-left: 15px;
  background: none;
  color: rgb(96, 96, 96);
  caret-color: blue;
  font-weight: normal;
}
.memo-title {
  position: absolute;
  display: inline-block;
  width: 5px;
  left: 1px;
  top: 5px;
  color: #b3b3b3;
  word-wrap: break-word;
  line-height: 10px;
  font-family: monospace;
}
</style>
