<template>
  <div class="wrapper todo-wrapper">
    <div class="header">
      <h1>Todo</h1>
    </div>
    <div class="container">
      <Todo :pathObj="pathObj"></Todo>
    </div>
  </div>
</template>

<script>
import Todo from "./child/Todo";
export default {
  name: "todo-page",
  data() {
    return {
      pathObj: {
        pathStr: "user/data/todo",
        tabName: "todo",
      },
    };
  },
  components: { Todo },
  methods: {},
  computed: {},
};
</script>

<style scoped>
.todo-wrapper {
  padding-bottom: 45px;
}
</style>
