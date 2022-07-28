<template>
  <div class="tag-wrapper">
    <el-tag
      v-for="(item, index) in arr"
      :key="index"
      type="primary"
      @click="handleClick(index)"
    >
      {{ index }} {{ item }}</el-tag
    >
  </div>
</template>

<script>
export default {
  props: ["arr"],
  data() {
    return {};
  },
  methods: {
    handleClick(index) {
      this.$emit("tagEvent", index);
    },
  },
};
</script>

<style>
.tag-wrapper span {
  cursor: pointer;
  margin-right: 10px;
  margin-top: 10px;
}
</style>
