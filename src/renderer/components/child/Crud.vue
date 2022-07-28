<template>
  <div class="crud-wrapper">
    <el-drawer
      :title="crudObj.crudTitle"
      :before-close="handleClose"
      :visible.sync="dialog"
      direction="ltr"
      size="75%"
      custom-class="demo-drawer"
      ref="drawer"
    >
      <div class="demo-drawer__content">
        <el-form :model="form">
          <el-form-item
            v-for="(item, index) in crudObj.formItemAttr"
            :key="index"
            :label="item.label"
            :label-width="formLabelWidth"
          >
            <el-select
              v-if="item.class == 'select'"
              v-model="form[item.label]"
              placeholder=""
            >
              <el-option
                v-for="(option, index1) in item.options"
                :key="index1"
                :label="option"
                :value="option"
              ></el-option>
            </el-select>
            <el-input-number
              v-else-if="item.class == 'number'"
              v-model="form[item.label]"
              :min="-1000000"
              :max="1000000"
              label="Description"
            ></el-input-number>
            <el-input
              v-else-if="item.class == 'input'"
              type="input"
              placeholder=""
              v-model="form[item.label]"
            >
            </el-input>

            <el-switch
              v-else-if="item.class == 'switch'"
              v-model="form[item.label]"
              active-color="#13ce66"
              inactive-color="#ff4949"
            >
            </el-switch>
            <el-date-picker
              v-else-if="item.class == 'timePicker'"
              value-format="yyyy-MM-dd HH:mm:ss"
              v-model="form[item.label]"
              type="datetime"
              placeholder="Select date time"
            >
            </el-date-picker>
            <el-input
              v-else
              type="textarea"
              :autosize="{ minRows: 3, maxRows: 15 }"
              placeholder=""
              v-model="form[item.label]"
            >
            </el-input>
          </el-form-item>
        </el-form>
        <div class="demo-drawer__footer">
          <el-button @click="cancelFn">Cancel</el-button>
          <el-button type="primary" @click="saveFn">Save</el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import dayjs from "dayjs";
import { writeFile } from "@/assets/js/common.js";

export default {
  name: "",
  data() {
    return {
      direction: "ltr",
      formLabelWidth: "80px",
      form: {},
    };
  },

  computed: {
    crudObj() {
      return JSON.parse(JSON.stringify(this.$store.state.System.crudObj));
    },
    dialog() {
      return this.$store.state.System.crudObj.crudDialog;
    },
  },
  watch: {
    "crudObj.time": function (val, oldVal) {
      this.form = JSON.parse(this.crudObj.form);
    },
  },

  methods: {
    handleClose(done) {
      this.$confirm("Are you sure to close it?")
        .then((_) => {
          this.cancelFn();
        })
        .catch((_) => {});
    },
    cantSaveFn() {
      this.$message.error("can't save,please check the form...");
    },
    saveFn() {
      let theTargetPath = this.crudObj.targetPath;
      if (
        theTargetPath == "user/data/record" ||
        theTargetPath == "user/download/notes"
      ) {
        if (this.form.name == "" && this.form.content == "") {
          this.cantSaveFn();
          return;
        }
      } else if (
        theTargetPath == "user/data/behavior" ||
        theTargetPath == "user/data/accounting"
      ) {
        if (
          this.form.name == "" ||
          this.form.number == 0 ||
          this.form.number == "" ||
          isNaN(this.form.number)
        ) {
          this.cantSaveFn();
          return;
        }
      } else if (theTargetPath == "user/data/shortcut") {
        if (this.form.shortcut == "" || this.form.content == "") {
          this.cantSaveFn();
          return;
        }
      } else if (theTargetPath == "user/data/todo") {
        if (this.form.name == "" || this.form.time == "") {
          this.cantSaveFn();
          return;
        }
      }
      if (this.crudObj.crudMode == "Add") {
        this.form.id = dayjs().valueOf();
        this.$store
          .dispatch("addDataAction", {
            targetPath: theTargetPath,
            obj: this.form,
          })
          .then(() => {
            let update = "";
            if (theTargetPath == "user/data/shortcut") {
              update = "updateMainShortCut";
            } else if (theTargetPath == "user/data/todo") {
              update = "updateMainTodo";
            }
            writeFile(null, update);
          });
      } else if (this.crudObj.crudMode == "Edit") {
        this.$store
          .dispatch("editDataAction", {
            id: this.form.id,
            targetPath: theTargetPath,
            obj: this.form,
          })
          .then(() => {
            let update = "";
            if (theTargetPath == "user/data/shortcut") {
              update = "updateMainShortCut";
            } else if (theTargetPath == "user/data/todo") {
              update = "updateMainTodo";
            }
            writeFile(null, update);
          });
      }
      this.cancelFn();
    },
    cancelFn() {
      this.$store.dispatch("setCrudDialogAction", false);
    },
  },
};
</script>

<style>
.el-input-number {
  width: 220px;
}
</style>
