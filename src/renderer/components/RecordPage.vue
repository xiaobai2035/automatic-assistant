<template>
  <div class="wrapper">
    <div class="header">
      <h1>Diary</h1>
    </div>
    <el-tabs tab-position="left" v-model="activeName" @tab-click="handleClick">
      <el-tab-pane
        v-for="(item, index) in promptArr"
        :key="index"
        :label="item"
        :name="item"
        ><Record :pathObj="pathObj"></Record
      ></el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import Record from "./child/Record";
export default {
  name: "record-page",
  data() {
    return {
      activeName: "whatever",
      pathObj: {
        pathStr: "user/data/record",
        subject: "whatever",
      },
    };
  },
  components: { Record },
  methods: {
    handleClick(tab, event) {
      this.pathObj.subject = this.activeName;
    },
  },
  computed: {
    promptArr() {
      return this.$store.getters.getResult({ pathStr: "user/data/subjects" })[
        "record"
      ];
    },
  },
};
</script>

<style scoped>
.wrapper {
  padding: 25px 15px 2px 15px;
}
</style>
