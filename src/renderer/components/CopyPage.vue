<template>
  <div class="wrapper">
    <div class="header">
      <h1>Copy</h1>
    </div>
    <div class="copy-container">
      <div class="section">
        <div v-if="mode == 'edit'">
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
            >+ Add</el-button
          >
        </div>

        <div class="normal-wrap" v-else>
          <div class="float-div">
            <span
              v-for="(tag, index) in dynamicTags.slice(0, 10)"
              :key="index"
              @click="tagClickFn(tag)"
            >
              {{ tag | handleStr(18) }}</span
            >
          </div>
          <div class="copy-middle float-div">
            <span
              v-for="(tag, index) in dynamicTags.slice(10, 20)"
              :key="index"
              @click="tagClickFn(tag)"
            >
              {{ tag | handleStr(18) }}</span
            >
          </div>
          <div class="copy-right float-div">
            <span
              v-for="(tag, index) in dynamicTags.slice(20, dynamicTags.length)"
              :key="index"
              @click="tagClickFn(tag)"
            >
              {{ tag | handleStr(18) }}</span
            >
          </div>
        </div>
      </div>
      <div class="btn-area">
        <el-button class="button-new-tag" size="small" @click="editFn">{{
          mode == "edit" ? "Esc" : "Edit"
        }}</el-button>
        <el-button
          v-if="mode == 'edit'"
          class="button-new-tag"
          size="small"
          @click="saveSubject"
          >Save</el-button
        >
      </div>
    </div>
  </div>
</template>

<script>
import { upperCaseFn, writeFile } from "@/assets/js/common.js";

import draggable from "vuedraggable";
export default {
  name: "copy-page",
  data() {
    return {
      mode: "normal",
      dynamicTags: [],
      inputVisible: false,
      inputValue: "",
    };
  },
  components: { draggable },
  mounted() {
    this.dynamicTags = JSON.parse(
      JSON.stringify(this.$store.state.Auth.user.data.copyWords)
    );
  },
  methods: {
    tagClickFn(tag) {
      this.$electron.clipboard.writeText(tag);
      this.$electron.ipcRenderer.sendSync("setWindow", {
        content: "window-min",
      });
    },
    editFn() {
      this.mode = this.mode == "edit" ? "normal" : "edit";
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

    saveSubject() {
      this.$store
        .dispatch("directAssignmentAction", {
          targetPath: "user/data",
          attr: "copyWords",
          obj: this.dynamicTags,
        })
        .then(() => {
          this.mode = "normal";
          writeFile();
        });
    },
  },
};
</script>

<style scoped>
.wrapper {
  padding: 25px 15px 8px 15px;
}
.copy-container {
  padding: 10px;
  width: 970px;
}

.drag-wrap {
  width: 900px;
  line-height: 40px;
}
.drag-wrap span {
  margin-right: 5px;
  margin-top: 5px;
  cursor: pointer;
}
.normal-wrap span {
  margin-right: 5px;
  margin-top: 5px;
  cursor: pointer;
}
.drag-wrap button {
  margin-right: 5px;
}

.input-new-tag {
  width: 90px;
}

.btn-area {
  position: absolute;
  bottom: 15px;
}

.float-div span {
  display: inline-block;
  font-weight: bold;
  width: 100%;
  height: 30px;
  line-height: 30px;
  padding: 0 3px;
  font-size: 14px;
  cursor: pointer;
  margin-bottom: 5px;
  background: rgb(214, 255, 209);
  letter-spacing: 0px;

  border-radius: 10px;
}
.float-div {
  float: left;
  width: 300px;
  height: 100%;
  margin-right: 10px;
}
.copy-middle span {
  background: rgb(255, 226, 211);
}
.copy-right span {
  background: rgb(209, 221, 255);
}
</style>
