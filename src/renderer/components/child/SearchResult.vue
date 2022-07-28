<template>
  <div>
    <h5>{{ dataObj.title }}:</h5>
    <el-result
      icon="success"
      title="No data"
      v-if="dataObj.dataArr.length == 0"
    >
    </el-result>

    <div class="content" v-else>
      <el-card class="box-card">
        <pre v-for="(item, index) in dataObj.dataArr" :key="index">{{ index }}.  {{ item }}</pre>
      </el-card>
    </div>
  </div>
</template>

<script>
export default {
  name: "search-result",

  data() {
    return {};
  },

  props: ["dataObj"],
};
</script>

<style scoped>
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
</style>
