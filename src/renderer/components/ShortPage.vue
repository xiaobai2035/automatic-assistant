<template>
  <div class="wrapper">
    <h1>Shortcut</h1>
    <el-tabs tab-position="left" v-model="activeName" @tab-click="handleClick">
      <el-tab-pane
        v-for="(item, index) in promptArr"
        :label="item"
        :key="index"
        :name="item"
        ><Table :pathObj="pathObj"></Table
      ></el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import Table from "./child/Table";
export default {
  name: "short-page",
  data() {
    return {
      activeName: "file",

      pathObj: {
        pathStr: "user/data/shortcut",
        subject: "file",
        tabName: "shortcut",
      },
    };
  },
  components: { Table },
  methods: {
    handleClick(tab, event) {
      this.pathObj.subject = this.activeName;
    },
  },
  computed: {
    promptArr() {
      return this.$store.getters.getResult({ pathStr: "user/data/subjects" })[
        "shortcut"
      ];
    },
  },
};
</script>

<style scoped>
h1 {
  color: rgb(88, 10, 244);
}
.table-wrapper {
  height: 100%;
}
</style>
