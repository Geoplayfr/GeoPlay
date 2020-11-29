<template>
  <div id="app">
    <v-list-item-content v-for="quizz in quizzes" :key="quizz.id">
      <quizz-item
        :quizz="quizz"
      />
    </v-list-item-content>
  </div>
</template>
<script>
import QuizzItem from "../components/QuizzItem.vue";
export default {
  layout: "default",
  components: {
    QuizzItem,
  },
  data() {
    return {
      errorMsg: "",
      snackbar: false,
      username: "",
      password: "",
      show1: false,
      valid: false,
      title: "Hello word!",
      quizzes: "",
      }
  },
}
</script>