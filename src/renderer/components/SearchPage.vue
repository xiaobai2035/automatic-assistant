<template>
  <div class="wrapper">
    <div class="header">
      <h1>Search</h1>
    </div>
    <div class="container">
      <el-drawer :title="title" size="85%" :visible.sync="drawer">
        <textarea
          name=""
          id="code"
          cols="30"
          rows="10"
          :value="fileContent"
        ></textarea>
      </el-drawer>
      <el-form status-icon ref="ruleForm" label-width="130px">
        <el-form-item label="SearchReg">
          <el-input v-model="rules.checkReg" placeholder="SearchReg"></el-input>
        </el-form-item>
        <el-form-item label="Target Path">
          <el-autocomplete
            class="inline-input"
            v-model="rules.targetPath"
            :fetch-suggestions="querySearch"
            placeholder="Target Path"
            @select="handleSelect"
          ></el-autocomplete>
        </el-form-item>

        <el-form-item label="Exclude Folders">
          <el-input
            v-model="rules.excludeDir"
            placeholder="Exclude Folders"
          ></el-input>
        </el-form-item>
        <el-form-item label="Exclude Extension ">
          <el-input
            v-model="rules.extandReg"
            placeholder="Exclude Extension"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchFn">Search</el-button>
          <el-button type="success" @click="scanFn">Scan</el-button>
          <el-button type="warning" @click="clear">Reset</el-button>
          <el-button type="danger" @click="removeLocal"
            >Delete search record</el-button
          >
        </el-form-item>
      </el-form>
      <el-divider></el-divider>
      <div class="result-area">
        <h4>Result:</h4>
        <div class="err" v-if="checkWordResult.err.length != 0">
          <el-result
            icon="error"
            title="Error occurred"
            :subTitle="checkWordResult.err[0]"
          >
          </el-result>
        </div>
        <div v-else class="normal-result">
          <div class="search-wrap" v-if="initStatus == 'search'">
            <div>
              <h5>Search result</h5>
              <el-result
                icon="success"
                title="No data"
                v-if="checkWordResult.checkResultArr.length == 0"
              >
              </el-result>
              <el-card
                v-for="(item, i) in checkWordResult.checkResultArr"
                :key="i"
                class="box-card"
              >
                <div slot="header" class="clearfix">
                  <span>{{ item.path }}</span>
                  <el-button
                    style="float: right; padding: 3px 0"
                    type="text"
                    @click="watchDetail(item.path)"
                    >Detail
                  </el-button>
                </div>
                <div
                  v-for="(paragraph, index) in item.paragraphArr"
                  :key="index"
                  class="text item"
                >
                  <pre>{{ paragraph }}</pre>
                </div>
              </el-card>
            </div>
            <SearchResult
              :dataObj="{
                title: 'Exclude Extension files',
                dataArr: checkWordResult.excludeExtensionFiles,
              }"
            >
            </SearchResult>
          </div>
          <div class="scan-wrap" v-if="initStatus == 'scan'">
            <el-card class="box-card">
              <div class="preview">
                <p>
                  Number of expansion names:
                  {{ checkWordResult.extentionNames.length }}
                </p>
                <p>
                  Number of no extension:
                  {{ checkWordResult.changeToSpaceExtension.length }}
                </p>
                <p>Number of folders: {{ checkWordResult.folders.length }}</p>
                <p>Number of files: {{ checkWordResult.files.length }}</p>
              </div>
            </el-card>
            <SearchResult
              :dataObj="{
                title: 'Expansion names',
                dataArr: checkWordResult.extentionNames,
              }"
            ></SearchResult>
            <SearchResult
              :dataObj="{
                title: 'No extension files',
                dataArr: checkWordResult.changeToSpaceExtension,
              }"
            >
            </SearchResult>
            <SearchResult
              :dataObj="{
                title: 'All folders',
                dataArr: checkWordResult.folders,
              }"
            ></SearchResult>
            <SearchResult
              :dataObj="{ title: 'All files', dataArr: checkWordResult.files }"
            ></SearchResult>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SearchResult from "./child/SearchResult";

export default {
  name: "copy-page",
  data() {
    return {
      pathArr: [],
      initStatus: "",
      drawer: false,
      title: "",
      fileContent: "",
      rules: {
        isSearchWord: true,
        targetPath: "",
        checkReg: "orange apple",
        excludeDir: "TEST_EXAMPLE&&node_modules",
        extandReg:
          "mp3 et xls xlsx xlsm xlt csv jpeg png jpg ttf woff woff2 doc docx ppt pptx",
      },

      checkWordResult: {
        extentionNames: [],
        changeToSpaceExtension: [],
        files: [],
        folders: [],
        excludeExtensionFiles: [],
        checkResultArr: [],
        err: [],
      },
    };
  },
  components: { SearchResult },
  mounted() {
    this.pathArr = JSON.parse(localStorage.getItem("pathArr")) || [];
    if (this.pathArr[0]) {
      this.rules.targetPath = this.pathArr[0].value;
    }
  },
  methods: {
    querySearch(queryString, cb) {
      var pathArr = this.pathArr;
      var results = queryString
        ? pathArr.filter(this.createFilter(queryString))
        : pathArr;

      cb(results);
    },
    createFilter(queryString) {
      return (item) => {
        return (
          item.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
        );
      };
    },
    handleSelect(item) {
      this.rules.targetPath = item.value;
    },
    watchDetail(path) {
      this.fileContent = this.$electron.ipcRenderer.sendSync("watchFile", path);
      this.title = path;
      this.drawer = true;
    },
    scanFn() {
      this.rules.isSearchWord = false;
      this.initStatus = "scan";
      let obj = JSON.parse(JSON.stringify(this.rules));
      obj.checkReg = "/(a)/";
      obj.extandReg =
        "/^.*\\.(" +
        obj.extandReg
          .split(" ")
          .filter((a) => a != "")
          .join("|") +
        ")$/";
      obj.excludeDir = "";
      this.checkWordResult = this.$electron.ipcRenderer.sendSync(
        "searchWords",
        obj
      );
      this.setLocal();
    },

    searchFn() {
      this.rules.isSearchWord = true;
      this.initStatus = "search";
      let obj = JSON.parse(JSON.stringify(this.rules));
      obj.checkReg =
        "/(" +
        obj.checkReg
          .split(" ")
          .filter((a) => a != "")
          .join("|") +
        ")/i";

      obj.extandReg =
        "/^.*\\.(" +
        obj.extandReg
          .split(" ")
          .filter((a) => a != "")
          .join("|") +
        ")$/";
      obj.excludeDir = obj.excludeDir.split("&&");

      this.checkWordResult = this.$electron.ipcRenderer.sendSync(
        "searchWords",
        obj
      );
      this.setLocal();
    },
    clear() {
      this.initStatus = "";
      this.rules.isSearchWord = true;
      this.checkWordResult = {
        extentionNames: [],
        changeToSpaceExtension: [],
        files: [],
        folders: [],
        excludeExtensionFiles: [],
        checkResultArr: [],
        err: [],
      };
    },
    setLocal() {
      let judge = false;
      for (let i = 0; i < this.pathArr.length; i++) {
        if (this.pathArr[i].value == this.rules.targetPath) {
          judge = true;
          break;
        }
      }
      if (!judge) {
        this.pathArr.unshift({ value: this.rules.targetPath });
        localStorage.setItem("pathArr", JSON.stringify(this.pathArr));
      }
    },
    removeLocal() {
      localStorage.setItem("pathArr", JSON.stringify([]));
    },
  },
  computed: {},
};
</script>

<style scoped>
.search-wrapper {
  padding: 25px 15px 8px 15px;
}
.box-card {
  width: 880px;
}

.text {
  font-size: 14px;
}

.item {
  margin-bottom: 18px;
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}

.clearfix:after {
  clear: both;
}

.box-card {
  width: 880px;
}

pre {
  background: rgb(241, 241, 241);
  border-radius: 5px;
  padding: 10px;
  width: 100%;
  margin-bottom: 15px;
}

h5 {
  margin: 10px 0;
  color: #008c8c;
}

#code {
  width: 100%;
  height: 95%;
  background: rgb(250, 250, 250);
  padding: 5px;
}

.el-form-item {
  margin-bottom: 5px;
}

.el-autocomplete {
  width: 100%;
}
.result-area h4 {
  margin-bottom: 15px;
}
.preview {
  line-height: 20px;
}
</style>