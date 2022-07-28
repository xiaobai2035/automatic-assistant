<template>
  <div class="record-wrapper">
    <template>
      <div class="block">
        <el-empty :image-size="120" v-if="getData.length == 0"></el-empty>
        <el-timeline>
          <el-timeline-item
            :timestamp="handleDate(item.id)"
            placement="top"
            v-for="(item, index) in getData"
            v-bind:key="index"
          >
            <el-card class="article">
              <div class="title">
                <h4>{{ item.name }}</h4>
              </div>
              <div class="content">
                <span class="btn-wrap">
                  <el-popconfirm
                    confirm-button-text="Sure"
                    cancel-button-text="Cancel"
                    confirm-button-type="danger"
                    title="Are you sure you want to delete it?"
                    @confirm="confirmFn(item)"
                  >
                    <el-button
                      slot="reference"
                      type="danger"
                      icon="el-icon-delete"
                      circle
                    ></el-button>
                  </el-popconfirm>
                  <el-button
                    type="primary"
                    icon="el-icon-edit"
                    circle
                    @click="handleEdit(item)"
                  ></el-button>
                </span>
                <div v-if="item.content.includes('data:image/png;base64')">
                  <img class="note-img" :src="item.content" alt="" />
                </div>
                <div v-else-if="item.content.split('\n').length > 2">
                  <div v-if="item.moreDisplay">
                    <p
                      class="paragraph"
                      v-for="(p, index1) in item.content.split('\n')"
                      :key="index1"
                    >
                      {{ p }}
                    </p>
                  </div>
                  <div v-else>
                    <p
                      class="paragraph"
                      v-for="(p, index1) in item.content
                        .split('\n')
                        .slice(0, 2)"
                      :key="index1"
                    >
                      {{ p }}
                    </p>
                  </div>
                  <div class="more-display-wrap">
                    <span class="more-display-btn" @click="moreDisplayFn(index)"
                      ><i
                        :class="{
                          'el-icon-arrow-down': !item.moreDisplay,
                          'el-icon-arrow-up': item.moreDisplay,
                        }"
                      ></i
                    ></span>
                  </div>
                </div>
                <div v-else>
                  <p
                    class="paragraph"
                    v-for="(p, index1) in item.content.split('\n')"
                    :key="index1"
                  >
                    {{ p }}
                  </p>
                </div>
              </div>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </div>
    </template>
    <div class="foot">
      <el-button round @click="addFn">New</el-button>
    </div>
  </div>
</template>

<script>
import dayjs from "dayjs";
import { upperCaseFn, writeFile } from "@/assets/js/common.js";
export default {
  data() {
    return {
      crudObj: {
        time: 0,
        crudTitle: "",
        crudDialog: false,
        form: "",
        crudMode: "",
        targetPath: "",
        formItemAttr: [],
      },
      template: {
        name: "",
        content: "",
        su: "",
      },
      recordIndex: 0,
      recordMoreDisply: false,
    };
  },
  name: "record",
  props: ["pathObj"],

  computed: {
    targetPath() {
      return this.pathObj.pathStr;
    },
    getData: {
      get: function () {
        let temp = JSON.parse(
          JSON.stringify(this.$store.getters.getResult(this.pathObj))
        );
        if (this.recordMoreDisply == "1" && temp[this.recordIndex]) {
          temp[this.recordIndex]["moreDisplay"] = true;
        }
        return temp;
      },
      set: function (newValue) {
        let arr = newValue.split("-");
        this.recordIndex = arr[0];
        this.recordMoreDisply = arr[1];
      },
    },

    targetSubject() {
      return this.pathObj.subject;
    },
  },

  methods: {
    handleDate(date) {
      return dayjs(date).format("YYYY-MM-DD HH:mm:ss");
    },
    confirmFn(item) {
      this.$store
        .dispatch("deleteDataAction", {
          id: item.id,
          targetPath: this.targetPath,
        })
        .then(() => {
          writeFile();
        });
    },
    crudFn() {
      this.crudObj.crudTitle = `${
        this.crudObj.crudMode == "Edit" ? "Edit" : "Add"
      } > Diary > ${upperCaseFn(this.targetSubject)}`;
      this.crudObj.formItemAttr = [
        {
          label: "name",
          class: "input",
        },
        {
          label: "content",
          class: "textarea",
        },
      ];
      this.crudObj.targetPath = this.targetPath;
      this.crudObj.crudDialog = true;
      this.crudObj.time = dayjs().valueOf();
      this.$store.dispatch("setCrudObjAction", this.crudObj);
    },
    handleEdit(item) {
      this.crudObj.crudMode = "Edit";
      if (item.moreDisplay) {
        delete item.moreDisplay;
      }
      this.crudObj.form = JSON.stringify(item);

      this.crudFn();
    },

    addFn() {
      this.crudObj.crudMode = "Add";
      this.template.su = this.targetSubject;
      this.crudObj.form = JSON.stringify(this.template);
      this.crudFn();
    },
    moreDisplayFn(index) {
      let tem = JSON.parse(JSON.stringify(this.getData));
      let iswantMoreDisplay = "0";
      if (!tem[index].moreDisplay) {
        iswantMoreDisplay = "1";
      } else {
        iswantMoreDisplay = "0";
      }
      this.getData = index + "-" + iswantMoreDisplay;
    },
  },
};
</script>

<style scoped>
.record-wrapper {
  height: 90%;
  overflow: auto;
  padding: 10px;
}
.content {
  line-height: 25px;
}

.article .el-button.is-circle {
  padding: 4px;
  font-size: 11px;
  margin-right: 5px;
}
.article .btn-wrap {
  display: none;
  float: right;
  margin-top: -6px;
}

.article:hover .btn-wrap {
  display: inline-block;
}

.paragraph {
  min-height: 25px;
}
.more-display-wrap {
  text-align: left;
  width: 100%;
}
.more-display-btn {
  display: inline-block;
  width: 100%;
  cursor: pointer;
  text-align: center;
  margin-right: 15px;
  background: rgb(236, 236, 236);
  border-radius: 5px;
}
.more-display-btn:hover {
  background: rgb(231, 231, 231);
  color: #1989fa;
}
h4 {
  color: red;
  font-size: 18px;
}
</style>
