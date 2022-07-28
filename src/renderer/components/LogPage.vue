<template>
  <div class="wrapper">
    <h1>Log</h1>
    <Table :pathObj="pathObj"></Table>
  </div>
</template>

<script>
import Table from "./child/Table";

export default {
  name: "log-page",
  data() {
    return {
      pathObj: {
        pathStr: "user/data/log",
        tabName: "log",
      },
    };
  },
  components: { Table },

};
</script>

<style scoped>
h1 {
  color: #15c06d;
}
</style>
