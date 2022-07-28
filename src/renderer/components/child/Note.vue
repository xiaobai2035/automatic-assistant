<template>
  <div class="note-wrapper">
    <template>
      <el-dialog
        title="Warning"
        :visible.sync="dialogVisible"
        width="30%"
        :before-close="handleClose"
      >
        <span>Are you sure you want to delete?</span>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">Cancel</el-button>
          <el-button type="danger" @click="deleteChoosedFn">Sure</el-button>
        </span>
      </el-dialog>

      <div class="block">
        <div class="main-btn-area">
          <span class="main-checkbox">
            <el-checkbox
              :indeterminate="isIndeterminate"
              v-model="checkAll"
              @change="handleCheckAllChange"
              >Choose All</el-checkbox
            ></span
          >

          <el-dropdown
            v-if="checkedIds.length != 0"
            trigger="click"
            @command="moveToFn"
          >
            <span class="el-dropdown-link">
              Move To<i class="el-icon-arrow-down el-icon--right"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item
                v-for="(item, index) in promptArr"
                :key="index"
                :command="item"
                >{{ item }}</el-dropdown-item
              >
            </el-dropdown-menu>
          </el-dropdown>
          <el-button
            v-if="checkedIds.length != 0"
            slot="reference"
            type="danger"
            size="mini"
            icon="el-icon-delete"
            @click="dialogVisible = true"
            >Delete</el-button
          >
        </div>
        <el-checkbox-group
          v-model="checkedIds"
          @change="handleCheckedCitiesChange"
        >
          <el-card
            class="article"
            v-for="(item, index) in getData"
            :key="index"
          >
            <div class="title">
              <el-checkbox :label="item.id" :key="item.id">
                {{ item.name }}</el-checkbox
              >
              <el-popconfirm
                confirm-button-text="Sure"
                cancel-button-text="Cancel"
                confirm-button-type="danger"
                title="Are you sure you want to delete it?"
                @confirm="confirmFn(item)"
              >
                <el-button size="mini" type="danger">Delete</el-button>
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
            </div>
            <div class="content">
              <div>
                <img
                  class="note-img"
                  v-if="item.content.includes('data:image/png;base64')"
                  :src="item.content"
                  alt=""
                />
                <div v-else class="paragraph">
                  <p
                    class="the-p"
                    v-for="(p, index1) in item.content.split('\n')"
                    :key="index1"
                  >
                    {{ p }}
                  </p>
                </div>
              </div>
            </div>
          </el-card>
        </el-checkbox-group>
        <el-empty :image-size="120" v-if="getData.length == 0"></el-empty>
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
      checkAll: false,
      checkedIds: [],
      isIndeterminate: false,
      dialogVisible: false,
    };
  },
  name: "notes",
  props: ["pathObj"],

  computed: {
    promptArr() {
      return this.$store.getters.getResult({ pathStr: "user/data/subjects" })[
        "notes"
      ];
    },
    targetPath() {
      return this.pathObj.pathStr;
    },
    getId() {
      return this.getData.map((item) => {
        return item.id;
      });
    },
    getData: {
      get: function () {
        let temp = JSON.parse(
          JSON.stringify(this.$store.getters.getResult(this.pathObj))
        );

        return temp;
      },
      set: function (newValue) {},
    },

    targetSubject() {
      return this.pathObj.subject;
    },
  },

  methods: {
    handleCheckAllChange(val) {
      this.checkedIds = val ? this.getId : [];
      this.isIndeterminate = false;
    },
    handleCheckedCitiesChange(value) {
      let checkedCount = value.length;
      this.checkAll = checkedCount === this.getId.length;
      this.isIndeterminate =
        checkedCount > 0 && checkedCount < this.getId.length;
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
      } > Note > ${upperCaseFn(this.targetSubject)}`;
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
    handleClose(done) {
      this.$confirm("Are you sure close?")
        .then((_) => {
          done();
        })
        .catch((_) => {});
    },
    deleteChoosedFn() {
      this.dialogVisible = false;
      this.$store
        .dispatch("batchDeleteAction", {
          idArr: this.checkedIds,
          targetPath: this.targetPath,
        })
        .then(() => {
          this.checkedIds = [];
          writeFile();
        });
    },
    moveToFn(item) {
      this.$store
        .dispatch("batchEditSubjectsAction", {
          idArr: this.checkedIds,
          subject: item,
          targetPath: this.targetPath,
        })
        .then(() => {
          this.checkedIds = [];
          writeFile();
        });
    },
  },
};
</script>

<style>
.note-wrapper {
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
  float: right;
  margin-top: 8px;
  margin-right: 5px;
  display: none;
}
.article:hover .el-button.is-circle {
  display: inline-block;
}

.paragraph {
  margin-top: 5px;
  min-height: 25px;
  font-size: 15px;
}

.main-btn-area {
  margin-bottom: 5px;
}
.main-btn-area button {
  margin-left: 15px;
}

.el-dropdown-link {
  cursor: pointer;
  color: #409eff;
}
.el-icon-arrow-down {
  font-size: 12px;
}
.main-checkbox {
  margin: 0 20px;
}
.el-card {
  margin-bottom: 10px;
}
.note-img {
  max-width: 800px;
}
.the-p {
  height: 25px;
}
</style>
