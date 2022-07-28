<template>
  <div class="wrapper">
    <div class="header">
      <h1>Set</h1>
    </div>

    <div class="container">
      <div class="section">
        <div>
          <h2>Notify per hour:</h2>
          <span class="switch-wrap">
            <el-switch
              v-model="persenalSettings.isNotifyPerHour"
              active-color="#13ce66"
              inactive-color="#ff4949"
              @change="saveSettings"
            >
            </el-switch>
          </span>
        </div>
      </div>
      <el-divider></el-divider>

      <div class="section">
        <div>
          <h2>Timing shutdown:</h2>
          <span class="switch-wrap">
            <el-switch
              v-model="persenalSettings.appAutoQuit.isOpen"
              active-color="#13ce66"
              inactive-color="#ff4949"
              @change="saveSettings"
            >
            </el-switch>
          </span>
        </div>
        <div class="block">
          <span class="title">time:</span>
          <span class="content">
            <el-input
              v-model="persenalSettings.appAutoQuit.quitAppTime"
              placeholder=""
            ></el-input>
          </span>
          <el-button type="success" @click="saveSettings">confirm</el-button>
        </div>
      </div>
      <el-divider></el-divider>
      <div class="section">
        <div>
          <h2>Show Menu:</h2>
          <span class="switch-wrap">
            <el-switch
              v-model="persenalSettings.isShowMenu"
              active-color="#13ce66"
              inactive-color="#ff4949"
              @change="saveSettings"
            >
            </el-switch>
          </span>
        </div>
      </div>
      <el-divider></el-divider>

      <div class="section">
        <div>
          <h2>Edit Subjects:</h2>
          <el-button
            class="button-new-tag"
            size="small"
            @click="saveSubject"
            :disabled="subject == 'please choose'"
            >save</el-button
          >
        </div>
        <div class="block">
          <span class="title">
            <el-dropdown @command="handleCommand" trigger="click">
              <span class="el-dropdown-link">
                {{ subject }}<i class="el-icon-arrow-down el-icon--right"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="income"
                  >accounting-income</el-dropdown-item
                >
                <el-dropdown-item command="expenses"
                  >accounting-expenses</el-dropdown-item
                >
                <el-dropdown-item command="behavior">behavior</el-dropdown-item>
                <el-dropdown-item command="record">diary</el-dropdown-item>
                <el-dropdown-item command="notes">note</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </span>
          <span class="content">
            <div class="drag-wrap">
              <draggable v-model="dynamicTags" @end="onDragEnd">
                <el-tag
                  :key="tag"
                  v-for="tag in dynamicTags"
                  closable
                  :disable-transitions="false"
                  @close="handleClose(tag)"
                >
                  {{ tag }}
                </el-tag>
              </draggable>
            </div>
            <div>
              <el-input
                class="input-new-tag"
                v-if="inputVisible"
                v-model="inputValue"
                ref="saveTagInput"
                size="small"
                @keyup.enter.native="handleInputConfirm"
                @blur="handleInputConfirm"
              >
              </el-input>
              <el-button
                v-else
                class="button-new-tag"
                size="small"
                @click="showInput"
                :disabled="subject == 'please choose'"
                >+ New Tag</el-button
              >
            </div>
          </span>
        </div>

        <div class=""></div>
      </div>
      <el-divider></el-divider>
      <div class="section">
        <h2>System shortcut:</h2>
        <div
          class="block"
          v-for="(value, key, index) in persenalSettings.systemShortcut"
          :key="index"
        >
          <span class="title">{{ key }}:</span>
          <span class="content"
            ><el-input
              v-model="persenalSettings.systemShortcut[key]"
              placeholder=""
            ></el-input
          ></span>
          <el-button type="success" @click="saveSettings('system shortcut')"
            >confirm</el-button
          >
        </div>
      </div>
      <el-divider></el-divider>

      <div class="section">
        <div>
          <h2>Clock Ring:</h2>
        </div>
        <div class="block">
          <span class="title">ring:</span>
          <span class="content morewidth">
            <el-input
              v-model="persenalSettings.clockRing"
              placeholder=""
            ></el-input>
          </span>
          <el-button type="success" @click="openDialog('mp3')"
            >choose</el-button
          >
          <el-button type="success" @click="saveSettings">confirm</el-button>
        </div>
      </div>
      <el-divider></el-divider>

      <div class="section">
        <div>
          <h2>imgUrl:</h2>
        </div>
        <div class="block">
          <span class="title">img:</span>
          <span class="content morewidth">
            <el-input
              v-model="persenalSettings.imgUrl"
              placeholder=""
            ></el-input>
          </span>
          <el-button type="success" @click="openDialog('img')"
            >choose</el-button
          >
          <el-button type="success" @click="saveSettings('setImg')"
            >confirm</el-button
          >
        </div>
        <div class="block">
          <span class="title">mask opacity:</span>
          <span class="content">
            <el-slider
              class="my-slider"
              v-model="persenalSettings.maskOpacity"
              :max="100"
              @change="saveSettings('setImg')"
            ></el-slider>
          </span>
        </div>
      </div>
      <el-divider></el-divider>

      <div class="section">
        <h2>Open Dev:</h2>
        <span class="switch-wrap">
          <el-button type="success" @click="openDev">Open</el-button>
        </span>
      </div>
      <el-divider></el-divider>
      <div class="section">
        <h2>Main interface input instruction:</h2>
        <el-card class="box-card help-wrap">
          <div>
            <span class="left">+100 remark</span
            ><span class="right">Record bill</span>
          </div>
          <div>
            <span class="left">-100 remark</span
            ><span class="right">Record bill</span>
          </div>

          <div>
            <span class="left">*1 remark</span
            ><span class="right">Record behavior occurs</span>
          </div>
          <div></div>
          <div><span class="left">#title</span><span class="right"></span></div>
          <div>
            <span class="left">content</span
            ><span class="right">write a diary or an article</span>
          </div>
          <div></div>
          <div>
            <span class="left">c10</span
            ><span class="right">remind me after 10mins</span>
          </div>
          <div>
            <span class="left">c20:30</span
            ><span class="right">remind me at 20:30</span>
          </div>
          <div></div>
          <div>
            <span class="left">play</span
            ><span class="right">play a random song</span>
          </div>
          <div>
            <span class="left">songname</span
            ><span class="right">get playing song name</span>
          </div>

          <div>
            <span class="left">play believer</span
            ><span class="right">play this song named believer</span>
          </div>

          <div>
            <span class="left">play silence song</span
            ><span class="right">play a random silence song</span>
          </div>
          <div>
            <span class="left">play sad song</span
            ><span class="right">play a random sad song</span>
          </div>
          <div>
            <span class="left">play excting song</span
            ><span class="right">play a random excting song</span>
          </div>
          <div></div>
          <div>
            <span class="left">alt+v</span
            ><span class="right">Save the screenshot to the private diary</span>
          </div>
          <div>
            <span class="left">ArrowUp</span
            ><span class="right">Show the previous instruction</span>
          </div>
          <div></div>
          <div>
            <span class="left">quit</span
            ><span class="right">quit the program</span>
          </div>
        </el-card>
      </div>
      <el-divider></el-divider>
      <div class="section">
        <h2>Edit MainPsd:</h2>
        <div class="block">
          <span class="title">Old psd:</span>
          <span class="content"
            ><el-input
              v-model="editMainPsdForm.old"
              show-password
              placeholder=""
            ></el-input
          ></span>
        </div>
        <div class="block">
          <span class="title">New psd:</span>
          <span class="content"
            ><el-input
              v-model="editMainPsdForm.new"
              show-password
              placeholder=""
            ></el-input
          ></span>
        </div>
        <div class="block">
          <span class="title">Again:</span>
          <span class="content"
            ><el-input
              v-model="editMainPsdForm.again"
              show-password
              placeholder=""
            ></el-input
          ></span>
        </div>
        <div class="block">
          <span class="title"></span>
          <span class="content">
            <el-button
              type="warning"
              @click="changePsd('versionMain', editMainPsdForm)"
              >Edit MainPsd</el-button
            ></span
          >
        </div>
      </div>
      <el-divider></el-divider>

      <div class="section">
        <h2>Edit SubPsd:</h2>
        <div class="block">
          <span class="title">Old psd:</span>
          <span class="content"
            ><el-input
              v-model="editSubPsdForm.old"
              show-password
              placeholder=""
            ></el-input
          ></span>
        </div>
        <div class="block">
          <span class="title">New psd:</span>
          <span class="content"
            ><el-input
              v-model="editSubPsdForm.new"
              show-password
              placeholder=""
            ></el-input
          ></span>
        </div>
        <div class="block">
          <span class="title">Again:</span>
          <span class="content"
            ><el-input
              v-model="editSubPsdForm.again"
              show-password
              placeholder=""
            ></el-input
          ></span>
        </div>
        <div class="block">
          <span class="title"></span>
          <span class="content">
            <el-button
              type="warning"
              @click="changePsd('versionSub', editSubPsdForm)"
              >Edit SubPsd</el-button
            ></span
          >
        </div>
      </div>
      <el-divider></el-divider>

      <div class="section">
        <h2>Change Key&Key1:</h2>
        <el-form
          status-icon
          ref="ruleForm"
          class="ruleForm"
          label-position="left"
          label-width="123px"
        >
          <div v-if="!changeSuccessfully">
            <el-form-item label="Old Key:">
              <el-input
                v-model="changeKeyForm.oldKey"
                placeholder=""
              ></el-input>
            </el-form-item>
          </div>
          <div v-else>
            <el-form-item label="New Key:">
              <el-input v-model="changeKeyForm.key" placeholder=""></el-input>
            </el-form-item>
            <el-form-item label="New Key1:">
              <el-input v-model="changeKeyForm.key1" placeholder=""></el-input>
            </el-form-item>
          </div>
        </el-form>
        <div class="block">
          <span class="title"></span>
          <span class="content">
            <el-button
              :disabled="changeSuccessfully"
              type="danger"
              @click="changeKey"
              >Change key&Key1</el-button
            >
          </span>
        </div>
      </div>
      <el-divider></el-divider>

      <div class="section">
        <h2>Delete key&Key1</h2>
        <el-form
          status-icon
          ref="ruleForm1"
          class="ruleForm"
          label-position="left"
          label-width="123px"
        >
          <div>
            <el-form-item label="Old Key:">
              <el-input
                v-model="deleteKeyForm.oldKey"
                placeholder=""
              ></el-input>
            </el-form-item>
          </div>
        </el-form>
        <div class="block">
          <span class="title"></span>
          <span class="content">
            <el-tooltip
              content="When succeed,the app will close"
              placement="top"
            >
              <el-button type="danger" @click="deleteKey"
                >Delete key&Key1</el-button
              >
            </el-tooltip>
          </span>
        </div>
      </div>
      <el-divider></el-divider>
    </div>
  </div>
</template>

<script>
import { writeFile } from "@/assets/js/common.js";

import draggable from "vuedraggable";
export default {
  name: "set-page",
  data() {
    return {
      dynamicTags: [],
      inputVisible: false,
      inputValue: "",
      subject: "please choose",
      editMainPsdForm: {
        old: "",
        new: "",
        again: "",
      },

      editSubPsdForm: {
        old: "",
        new: "",
        again: "",
      },
      changeSuccessfully: false,
      changeKeyForm: {
        oldKey: "",
        key: "",
        key1: "",
      },
      deleteKeyForm: {
        oldKey: "",
      },

      persenalSettings: {
        systemShortcut: {
          HideShow: "",
          AppQuit: "",
          GetClipboardToNotes: "",
          SetZoom1: "",
          SetZoomIn: "",
          SetZoomOut: "",
          SetTop: "",
        },
        appAutoQuit: { isOpen: false, quitAppTime: "" },
        isShowMenu: false,
        isNotifyPerHour: false,
        clockRing: "",
        imgUrl: "",
        maskOpcity: 50,
      },
    };
  },
  components: { draggable },
  methods: {
    changeKey() {
      let ret = this.$electron.ipcRenderer.sendSync(
        "changeKey",
        this.changeKeyForm
      );
      this.changeKeyForm.oldKey = "";
      if (ret == 0) {
        this.$message.error("Wrong oldKey");
      } else {
        this.$message({
          message: "Succeed,please backup...",
          type: "success",
        });
        this.changeSuccessfully = true;
        this.changeKeyForm.key = ret.key;
        this.changeKeyForm.key1 = ret.key1;
      }
    },
    deleteKey() {
      let ret = this.$electron.ipcRenderer.sendSync(
        "deleteKey",
        this.deleteKeyForm
      );
      this.deleteKeyForm.oldKey = "";
      if (ret == 1) {
        this.$message({
          message:
            "The key deletes successfully,the program will close after  3s",
          type: "success",
        });
      } else {
        this.$message.error("Wrong key...");
      }
    },
    changePsd(name, form) {
      if (form.new != form.again) {
        this.$message({
          message: "Psd is not same",
          type: "warning",
        });
        return;
      }

      let ret = this.$electron.ipcRenderer.sendSync("changePsd", {
        name: name,
        arg: form,
      });

      if (!ret) {
        this.$message({
          message: "Old psd is wrong",
          type: "warning",
        });
      } else {
        this.$message({
          message: "Psd change successfully",
          type: "success",
        });

        form.old = "";
        form.new = "";
        form.again = "";
      }
    },

    onDragEnd() {},
    handleClose(tag) {
      this.dynamicTags.splice(this.dynamicTags.indexOf(tag), 1);
    },

    showInput() {
      this.inputVisible = true;
      this.$nextTick((_) => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },

    handleInputConfirm() {
      let inputValue = this.inputValue;
      if (inputValue) {
        this.dynamicTags.push(inputValue);
      }
      this.inputVisible = false;
      this.inputValue = "";
    },
    handleCommand(command) {
      this.subject = command;
      this.dynamicTags = JSON.parse(
        JSON.stringify(this.$store.state.Auth.user.data.subjects[command])
      );
    },
    saveSubject() {
      this.$store
        .dispatch("directAssignmentAction", {
          targetPath: "user/data/subjects",
          attr: this.subject,
          obj: this.dynamicTags,
        })
        .then(() => {
          writeFile();
        });
    },
    saveSettings(item) {
      this.$store
        .dispatch("directAssignmentAction", {
          targetPath: "user",
          attr: "persenalSettings",
          obj: JSON.parse(JSON.stringify(this.persenalSettings)),
        })
        .then(() => {
          if (item == "system shortcut") {
            writeFile({
              message: "Set successfully,please restart...",
              type: "warning",
            });
          } else {
            writeFile();
          }
        });
      if (item == "setImg") {
        this.$store.dispatch("directAssignmentAction", {
          targetPath: "",
          attr: "theme",
          obj: {
            img: this.persenalSettings.imgUrl,
            maskOpacity: this.persenalSettings.maskOpacity,
          },
        });
      }
    },
    openDev() {
      this.$electron.ipcRenderer.sendSync("opendev", {});
    },
    openDialog(item) {
      let ret = this.$electron.remote.dialog.showOpenDialog();
      if (ret) {
        if (item == "img") {
          this.persenalSettings.imgUrl = ret[0].replace(/\\/g, "\\\\");
        } else if (item == "mp3") {
          this.persenalSettings.clockRing = ret[0].replace(/\\/g, "\\\\");
        }
      }
    },
  },

  mounted() {
    this.persenalSettings = JSON.parse(
      JSON.stringify(this.$store.state.Auth.user.persenalSettings)
    );
  },
};
</script>

<style scoped>
h2 {
  display: inline-block;
  width: 120px;
  font-size: 15px;
  margin-bottom: 18px;
}

.block {
  margin-bottom: 10px;
}
.title {
  display: inline-block;
  width: 120px;
  color: rgb(97, 97, 97);
}
.content {
  display: inline-block;
  width: 150px;
}
.switch-wrap {
  margin-left: 5px;
}
.drag-wrap {
  width: 790px;
  line-height: 40px;
}
.drag-wrap span {
  margin-right: 5px;
  cursor: move;
}
.drag-wrap button {
  margin-right: 5px;
}

.input-new-tag {
  width: 90px;
}

.el-dropdown-link {
  cursor: pointer;
}

.left {
  width: 100px;
  display: inline-block;
}
.right {
  width: 200px;
  display: inline-block;
}
.help-wrap div {
  height: 20px;
  line-height: 20px;
}
.morewidth {
  width: 460px;
}
</style>
