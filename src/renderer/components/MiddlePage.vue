<template>
  <div class="wrapper">
    <div class="middle-wrapper">
      <div class="input-wrap">
        <el-input
          ref="input"
          placeholder="Please enter secondary password"
          v-model="input"
          show-password
          @keydown.enter.native="submit"
        ></el-input>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "middle-page",

  data() {
    return {
      input: "",
    };
  },

  mounted() {
    this.$refs.input.focus();
  },

  methods: {
    submit() {
      let res = this.$electron.ipcRenderer.sendSync("checkPsd", {
        name: "versionSub",
        value: this.input,
      });
      if (res.isAuth) {
        this.$router.push(res.route);
      }
      this.input = "";
    },
  },
};
</script>

<style scoped>
.wrapper {
  padding: 15px 15px;
}
.middle-wrapper {
  width: 500px;
  margin: 200px auto;
}
.input-wrap {
  margin-top: 20px;
  width: 500px;
}
</style>
