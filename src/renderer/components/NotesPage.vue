<template>
  <div class="wrapper">
    <div class="header">
      <h1>Note</h1>
    </div>
    <el-tabs tab-position="left" v-model="activeName" @tab-click="handleClick">
      <el-tab-pane
        v-for="(item, index) in promptArr"
        :key="index"
        :label="item"
        :name="item"
        ><Note :pathObj="pathObj"></Note
      ></el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import Note from "./child/Note";
export default {
  name: "notes-page",
  data() {
    return {
      activeName: "default",
      pathObj: {
        pathStr: "user/download/notes",
        subject: "default",
      },
    };
  },
  components: { Note },
  methods: {
    handleClick(tab, event) {
      this.pathObj.subject = this.activeName;
    },
  },
  computed: {
    promptArr() {
      return this.$store.getters.getResult({ pathStr: "user/data/subjects" })[
        "notes"
      ];
    },
  },
  mounted() {
    this.$message({
      message:
        "The default label project is automatically deleted after 5 days, please move to other place in time",
      type: "warning",
    });
  },
};
</script>

<style scoped>
.wrapper {
  padding: 25px 15px 2px 15px;
}
.el-tabs {
  height: calc(100% - 35px);
}
</style>
