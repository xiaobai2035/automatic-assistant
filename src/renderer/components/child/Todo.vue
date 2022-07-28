<template>
  <div class="todo_wrapper">
    <template>
      <div class="block now">
        <h5>Now</h5>
        <el-empty
          :image-size="60"
          description="No data"
          v-if="nowData.length == 0"
        ></el-empty>
        <el-timeline>
          <el-timeline-item
            v-for="(activity, index) in nowData"
            :key="index"
            placement="top"
            :timestamp="activity.time"
          >
            <el-card class="todo-wrapper">
              <div class="todo-thead">
                <span class="todo-name">Name</span>
                <span class="todo-remind">Remind</span>
                <span class="todo-repeat">Everyday</span>
                <span class="todo-excute">Execute</span>
                <span class="todo-duration">Duration</span>
                <span class="todo-operate">Operate</span>
              </div>
              <div class="todo-tbody">
                <span class="todo-name">{{ activity.name }}</span>

                <span class="todo-remind"
                  ><i v-show="activity.remind" class="el-icon-bell"></i
                ></span>
                <span class="todo-repeat"
                  ><i v-show="activity.repeat" class="el-icon-check"></i
                ></span>
                <span class="todo-excute">{{
                  activity.excute | handleStr
                }}</span>
                <span class="todo-duration">{{ diffDay(activity.time) }}</span>
                <span class="todo-operate">
                  <el-button
                    type="primary"
                    icon="el-icon-edit"
                    circle
                    @click="handleEdit(activity)"
                  ></el-button>

                  <el-popconfirm
                    confirm-button-text="yes"
                    cancel-button-text="cancel"
                    confirm-button-type="danger"
                    title="Are you sure to delete this item?"
                    @confirm="confirmDeleteFn(activity)"
                  >
                    <el-button
                      class="del-btn"
                      slot="reference"
                      type="danger"
                      icon="el-icon-delete"
                      circle
                    ></el-button>
                  </el-popconfirm>
                </span>
              </div>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </div>

      <div class="block passed">
        <h5>Passed</h5>
        <el-empty
          :image-size="60"
          description="No data"
          v-if="passedData.length == 0"
        ></el-empty>
        <el-timeline>
          <el-timeline-item
            v-for="(activity, index) in passedData"
            :key="index"
            placement="top"
            :timestamp="activity.time"
          >
            <el-card class="todo-wrapper">
              <div class="todo-thead">
                <span class="todo-name">Name</span>
                <span class="todo-remind">Remind</span>
                <span class="todo-repeat">Everyday</span>
                <span class="todo-excute">Execute</span>
                <span class="todo-duration">Duration</span>
                <span class="todo-operate">Operate</span>
              </div>
              <div class="todo-tbody">
                <span class="todo-name">{{ activity.name }}</span>

                <span class="todo-remind"
                  ><i v-show="activity.remind" class="el-icon-bell"></i
                ></span>
                <span class="todo-repeat"
                  ><i v-show="activity.repeat" class="el-icon-check"></i
                ></span>
                <span class="todo-excute">{{
                  activity.excute | handleStr
                }}</span>
                <span class="todo-duration">{{ diffDay(activity.time) }}</span>
                <span class="todo-operate">
                  <el-button
                    type="primary"
                    icon="el-icon-edit"
                    circle
                    @click="handleEdit(activity)"
                  ></el-button>

                  <el-popconfirm
                    confirm-button-text="yes"
                    cancel-button-text="cancel"
                    confirm-button-type="danger"
                    title="Are you sure to delete this item?"
                    @confirm="confirmDeleteFn(activity)"
                  >
                    <el-button
                      class="del-btn"
                      slot="reference"
                      type="danger"
                      icon="el-icon-delete"
                      circle
                    ></el-button>
                  </el-popconfirm>
                </span>
              </div>
            </el-card>
          </el-timeline-item>
        </el-timeline>
        <div class="foot">
          <el-tooltip
            content="When name includes 'clock',will ring"
            placement="top"
          >
            <el-button round @click="addFn">New</el-button>
          </el-tooltip>
        </div>
      </div>
    </template>
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
        time: "",
        repeat: false,
        remind: true,
        excute: "",
      },
    };
  },
  props: ["pathObj"],
  mounted() {},
  computed: {
    targetPath() {
      return this.pathObj.pathStr;
    },
    passedData() {
      let arr = JSON.parse(
        JSON.stringify(this.$store.getters.getResult(this.pathObj))
      );

      let completed = arr.filter((item) => {
        let orign = dayjs(item.time);
        let ret = orign.diff(dayjs(), "day");
        return ret < 0;
      });

      completed.sort((a, b) => {
        return dayjs(b.time).valueOf() - dayjs(a.time).valueOf();
      });

      return completed;
    },

    nowData() {
      let arr = JSON.parse(
        JSON.stringify(this.$store.getters.getResult(this.pathObj))
      );

      let unComplete = arr.filter((item) => {
        let orign = dayjs(item.time);
        let ret = orign.diff(dayjs(), "day");
        return ret >= 0;
      });

      unComplete.sort((a, b) => {
        return dayjs(a.time).valueOf() - dayjs(b.time).valueOf();
      });

      return unComplete;
    },
  },
  components: {},
  methods: {
    diffDay(time) {
      let orign = dayjs(time);
      let ret = orign.diff(dayjs(), "day") + " day";
      if (ret == "0 day") {
        ret = "";
      }
      return ret;
    },
    crudFn() {
      this.crudObj.crudTitle = `${this.crudObj.crudMode} > Todo`;
      this.crudObj.formItemAttr = [
        {
          label: "name",
          class: "input",
        },
        {
          label: "time",
          class: "timePicker",
        },
        {
          label: "repeat",
          class: "switch",
        },
        {
          label: "remind",
          class: "switch",
        },
        {
          label: "excute",
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
      this.crudObj.form = JSON.stringify(item);
      this.crudFn();
    },
    confirmDeleteFn(item) {
      this.$store
        .dispatch("deleteDataAction", {
          id: item.id,
          targetPath: this.targetPath,
        })
        .then(() => {
          let update = null;
          if (this.targetPath == "user/data/todo") {
            update = "updateMainTodo";
          }
          writeFile(null, update);
        });
    },

    addFn() {
      this.crudObj.crudMode = "Add";
      this.crudObj.form = JSON.stringify(this.template);

      this.crudFn();
    },
  },
};
</script>

<style scoped>
.el-button.is-circle {
  padding: 4px;
  font-size: 11px;
  margin-top: 8px;
  margin-right: 0;
}
.block {
  min-width: 910px;
}
.todo-wrapper span {
  display: inline-block;
  width: 120px;
}
.todo-name {
  width: 120px;
}
.todo-thead span {
  color: rgb(178, 190, 143);
}
.todo-tbody .todo-repeat {
  padding-left: 18px;
}
.todo-tbody .todo-remind {
  padding-left: 15px;
}
.todo-wrapper .todo-name {
  width: 150px;
}
.todo-wrapper .todo-excute {
  width: 150px;
  word-break: break-all;
}
.todo-wrapper .todo-operate {
  width: 150px;
}

.el-icon-bell {
  color: orange;
}
.el-icon-check {
  font-weight: bold;
  color: rgb(113, 188, 0);
}

.del-btn {
  margin-left: 5px;
}

h5 {
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 5px;
}
.now h5 {
  background: rgb(235, 255, 192);
}
.passed {
  margin-top: 15px;
}
.passed h5 {
  background: rgb(255, 208, 192);
}
</style>
