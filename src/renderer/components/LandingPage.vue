<template>
  <div id="wrapper">
    <main>
      <h2>Hi</h2>
      <div v-if="checkFileRet == 1">
        <div class="input-wrap">
          <el-input
            ref="loginInput"
            placeholder="Please enter your password"
            v-model="inputValue"
            show-password
            @keyup.enter.native="keydownEnterFn"
          ></el-input>
        </div>
      </div>
      <div v-else-if="checkFileRet == 0">
        <p class="prompt">User file exits,but keys are empty,please fill</p>
        <div class="form-wrap">
          <el-form status-icon ref="ruleForm" label-width="130px">
            <el-form-item label="Key">
              <el-input v-model="rules.key" placeholder=""></el-input>
            </el-form-item>
            <el-form-item label="Key1">
              <el-input v-model="rules.key1" placeholder=""></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitFn">Submit</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <div v-else-if="checkFileRet == -1">
        <div v-if="initSuceess">
          <p class="prompt">
            Initialization is successful, please save Key and Key1 to the place
            you know, and then restart the program.
          </p>
          <p class="prompt login-prompt">
            Login password is empty, the second -level password is empty, please change them later in "Settings".
          </p>             
        </div>
        
        <p class="prompt" v-else>
          The user file does not exist, please import or
          <span>
            <el-button type="text" size="small" @click="initFn"
              >initialize</el-button
            >
          </span>
        </p>
        <el-form
          status-icon
          ref="ruleForm1"
          class="ruleForm1"
          label-width="50px"
        >
          <div v-if="initSuceess">
            <el-form-item label="Key:">
              <el-input v-model="rules.key" placeholder=""></el-input>
            </el-form-item>
            <el-form-item label="Key1:">
              <el-input v-model="rules.key1" placeholder=""></el-input>
            </el-form-item>
          </div>
        </el-form>
      </div>
      <div v-else>Please check the file...</div>
    </main>
  </div>
</template>

<script>
const ipcRenderer = require("electron").ipcRenderer;

export default {
  name: "landing-page",
  data() {
    return {
      initSuceess: false,
      rules: {
        key: "",
        key1: "",
      },
      checkFileRet: -2,
      inputValue: "",
    };
  },

  mounted() {
    let obj = this.$electron.ipcRenderer.sendSync("checkFile", {});
    this.checkFileRet = obj.ret;
    if (this.checkFileRet == 1) {
      this.$nextTick(() => {
        this.$refs.loginInput.focus();
        if (obj.img != "") {
          this.$store.dispatch("directAssignmentAction", {
            targetPath: "",
            attr: "theme",
            obj: { img: obj.img, maskOpacity: obj.maskOpacity },
          });
        }
      });
    }
  },
  methods: {
    initFn() {
      let ret = this.$electron.ipcRenderer.sendSync("initFile", {});
      if (ret.key) {
        this.rules.key = ret.key;
        this.rules.key1 = ret.key1;
        this.initSuceess = true;
      }
    },
    submitFn() {
      if (this.rules.key.length < 25 || this.rules.key1.length < 25) {
        this.$message.error("Please retry...");
        return;
      }
      let ret = this.$electron.ipcRenderer.sendSync("fillKey", this.rules);
      if (ret == 0) {
        this.$message.error("Wrong key...");
      } else {
        this.$message({
          message: "Success,please login",
          type: "success",
        });
        this.checkFileRet = 1;
      }
      this.rules.key = "";
      this.rules.key1 = "";
    },
    keydownEnterFn() {
      let res = ipcRenderer.sendSync("checkPsd", {
        name: "versionMain",
        value: this.inputValue,
      });

      if (res.isAuth) {
        this.$store.dispatch("directAssignmentAction", {
          targetPath: "",
          attr: "user",
          obj: res,
        });
        this.$router.push("/index");
      } else {
        this.$message({
          message: "An error occur, please try again",
          type: "warning",
        });
      }
    },
  },
};
</script>

<style>
#wrapper {
  padding: 60px 80px;
}
main input {
  width: 100%;
  outline: none;
  border: none;
  padding: 10px 0px;
  font-weight: bold;
  background: none;
  caret-color: #fa0560;
}
h2 {
  font-size: 18px;
  margin-bottom: 15px;
}
.form-wrap {
  margin-top: 80px;
}
.ruleForm1 {
  margin-top: 100px;
}

.input-wrap {
  margin-top: 100px;
  width: 500px;
}
.prompt {
  font-size: 16px;
}
.login-prompt{
  margin-top: 25px;
}
</style>
