<template>
  <div class="table-wrapper">
    <template>
      <el-table
        :data="
          getData.filter(
            (data) =>
              !search || data.name.toLowerCase().includes(search.toLowerCase())
          )
        "
        :summary-method="getSummaries"
        :show-summary="
          specialArr.includes(pathObj.tabName) && pathObj.tabName != 'log'
        "
        border
        height="390"
        :row-class-name="tableRowClassName"
        style="width: 100%"
      >
        <el-table-column v-if="specialArr.includes(pathObj.tabName)">
          <template slot="header"> date </template>
          <template slot-scope="scope">
            <i class="el-icon-time"></i>
            {{ scope.row.id | dateFormat(pathObj.tabName) }}
          </template>
        </el-table-column>
        <el-table-column>
          <template slot="header"> name </template>
          <template slot-scope="scope">
            <el-tag size="medium">{{ scope.row.name }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column v-if="hasContent">
          <template slot="header"> content </template>
          <template slot-scope="scope">
            <span v-if="pathObj.tabName != 'log'">
              {{ scope.row.content | handleStr }}
            </span>
            <span v-else> {{ scope.row.content }}</span>
          </template>
        </el-table-column>

        <el-table-column
          v-for="(item, index) in objKeys"
          :key="index"
          :label="item"
          :prop="item"
        >
        </el-table-column>
        <el-table-column>
          <template slot="header" slot-scope="scope">
            <div class="add-wrap">
              <el-input
                v-model="search"
                size="mini"
                placeholder="search name"
              />
              <el-button
                size="mini"
                type="primary"
                @click="addFn"
                :disabled="pathObj.tabName == 'log'"
                >Add</el-button
              >
            </div>
          </template>
          <template slot-scope="scope">
            <el-button
              size="mini"
              :disabled="pathObj.tabName == 'log'"
              @click="handleEdit(scope.$index, scope.row)"
              >Edit</el-button
            >
            <el-popconfirm
              confirm-button-text="yes"
              cancel-button-text="cancel"
              confirm-button-type="danger"
              title="Are you sure to delete this item?"
              @confirm="confirmDeleteFn(scope.row)"
            >
              <el-button slot="reference" size="mini" type="danger"
                >Delete</el-button
              >
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </template>
  </div>
</template>

<script>
import dayjs from "dayjs";
import { upperCaseFn, writeFile } from "@/assets/js/common.js";

export default {
  data() {
    return {
      search: "",
      crudObj: {
        time: 0,
        crudTitle: "",
        crudDialog: false,
        form: "",
        crudMode: "",
        targetPath: "",
        formItemAttr: [],
      },
      attrObj: {
        file: {
          name: "",
          content: "",
          shortcut: "",
          js: "",
          su: "file",
        },
        url: {
          name: "",
          content: "",
          shortcut: "",
          js: "",
          su: "url",
        },
        cmd: {
          name: "",
          content: "",
          shortcut: "",
          su: "cmd",
        },
        extraJs: {
          name: "",
          content: "",
          shortcut: "",
          su: "extraJs",
        },
        copy: {
          name: "",
          content: "",
          shortcut: "",
          su: "copy",
        },
        route: {
          name: "",
          content: "",
          shortcut: "",
          su: "route",
        },
        accounting: {
          name: "",
          number: 0,
          remark: "",
        },
        behavior: {
          name: "",
          number: 0,
          remark: "",
        },
        log: {
          name: "",
          content: "",
        },
      },
      specialArr: ["accounting", "behavior", "log"],
    };
  },
  props: ["pathObj"],

  computed: {
    hasContent() {
      return this.attrObj[this.targetSubject].hasOwnProperty("content");
    },
    getData() {
      return this.$store.getters.getResult(this.pathObj);
    },

    targetPath() {
      return this.pathObj.pathStr;
    },
    targetSubject() {
      if (this.specialArr.includes(this.pathObj.tabName)) {
        return this.pathObj.tabName;
      }
      return this.pathObj.subject;
    },
    objKeys() {
      return Object.keys(this.attrObj[this.targetSubject]).filter((item) => {
        return !["id", "su", "name", "content"].includes(item);
      });
    },

    promptArr() {
      let res = [];
      let tabName = this.pathObj.tabName;
      if (tabName == "accounting") {
        res = this.$store.getters
          .getResult({ pathStr: "user/data/subjects" })
          ["income"].concat(
            this.$store.getters.getResult({ pathStr: "user/data/subjects" })[
              "expenses"
            ]
          );
      } else {
        res = this.$store.getters.getResult({ pathStr: "user/data/subjects" })[
          tabName
        ];
      }
      return res;
    },
  },

  filters: {
    dateFormat: function (value, tabName) {
      if (!value) return "";
      if (tabName == "log") {
        return dayjs(value).format("YYYY-MM-DD HH:mm:ss");
      }
      return dayjs(value).format("YYYY-MM-DD");
    },
  },
  methods: {
    confirmDeleteFn(row) {
      this.$store
        .dispatch("deleteDataAction", {
          id: row.id,
          targetPath: this.targetPath,
        })
        .then(() => {
          let update = null;
          if (this.targetPath == "user/data/shortcut") {
            update = "updateMainShortCut";
          }
          writeFile(null, update);
        });
    },
    crudFn() {
      if (this.specialArr.includes(this.pathObj.tabName)) {
        this.crudObj.crudTitle =
          this.crudObj.crudMode + " > " + upperCaseFn(this.pathObj.tabName);
        this.crudObj.formItemAttr = [
          {
            label: "name",
            class: "select",
            options: this.promptArr,
          },
          {
            label: "number",
            class: "number",
          },
          {
            label: "remark",
            class: "textarea",
          },
        ];
      } else {
        this.crudObj.crudTitle = `${
          this.crudObj.crudMode
        } > Shortcut > ${upperCaseFn(this.targetSubject)}`;
        this.crudObj.formItemAttr = [
          {
            label: "name",
            class: "input",
          },
          {
            label: "content",
            class: "textarea",
          },
          {
            label: "shortcut",
            class: "input",
          },
        ];
        if (["file", "url"].includes(this.targetSubject)) {
          this.crudObj.formItemAttr.push({
            label: "js",
            class: "textarea",
          });
        }
      }

      this.crudObj.targetPath = this.targetPath;
      this.crudObj.crudDialog = true;
      this.crudObj.time = dayjs().valueOf();
      this.$store.dispatch("setCrudObjAction", this.crudObj);
    },
    addFn() {
      this.crudObj.crudMode = "Add";
      this.crudObj.form = JSON.stringify(this.attrObj[this.targetSubject]);

      this.crudFn();
    },
    handleEdit(index, row) {
      this.crudObj.crudMode = "Edit";
      this.crudObj.form = JSON.stringify(row);
      this.crudFn();
    },

    tableRowClassName({ row, rowIndex }) {
      if (rowIndex % 2 === 1) {
        return "success-row";
      } else if (rowIndex % 2 === 0) {
        return "";
      }
    },

    getSummaries(param) {
      const { columns, data } = param;
      const sums = [];
      sums[0] = "Total";
      sums[2] = data.reduce((prev, curr) => {
        return prev + curr.number;
      }, 0);
      return sums;
    },
  },
};
</script>

<style>
.table-wrapper {
  height: calc(100% - 35px);
}
.table-wrapper .success-row {
  background: #f0f9eb;
}

.table-wrapper .el-table {
  height: 100% !important;
}
.demo-drawer__content {
  padding: 0 50px;
}

.add-wrap .el-input {
  width: 55%;
}
</style>
