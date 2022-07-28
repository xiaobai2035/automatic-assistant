<template>
  <div class="wrapper">
    <h1>
      Behavior
      <span class="time-wrap">
        <el-date-picker
          v-model="value2"
          type="monthrange"
          align="right"
          unlink-panels
          range-separator="to"
          start-placeholder="start"
          end-placeholder="end"
          @change="timePickerChange"
          :picker-options="pickerOptions"
        >
        </el-date-picker>
      </span>
    </h1>
    <Table :pathObj="pathObj"></Table>
  </div>
</template>

<script>
import Table from "./child/Table";
import dayjs from "dayjs";

export default {
  name: "behavior-page",
  data() {
    return {
      pathObj: {
        pathStr: "user/data/behavior",
        tabName: "behavior",
        startTime: 0,
        endTime: 0,
      },
      pickerOptions: {
        shortcuts: [
          {
            text: "This month",
            onClick(picker) {
              picker.$emit("pick", [new Date(), new Date()]);
            },
          },
          {
            text: "Last month",
            onClick(picker) {
              const start = new Date();
              start.setMonth(start.getMonth() - 1);
              picker.$emit("pick", [start, start]);
            },
          },
          {
            text: "This year",
            onClick(picker) {
              const end = new Date();
              const start = new Date(new Date().getFullYear(), 0);
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "Last six months",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setMonth(start.getMonth() - 6);
              picker.$emit("pick", [start, end]);
            },
          },
        ],
      },
      value2: "",
    };
  },
  components: { Table },
  methods: {
    timePickerChange() {
      if (!this.value2) {
        this.pathObj.startTime = this.pathObj.endTime = 0;
        return;
      }
      this.pathObj.startTime = dayjs(
        dayjs(this.value2[0]).startOf("month").$d
      ).valueOf();
      this.pathObj.endTime = dayjs(
        dayjs(this.value2[1]).endOf("month").$d
      ).valueOf();
    },
  },
};
</script>

<style scoped>
h1 {
  color: #15c06d;
}
.time-wrap {
  float: right;
  margin-right: 5px;
}
</style>
