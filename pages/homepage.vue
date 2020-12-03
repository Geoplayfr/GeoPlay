<template>
  <div id="app">
    <v-list-item-content v-for="quizz in quizzes" :key="quizz.id">
      <quizz-item
        v-if="quizz.questions.length >= 5"
        :quizz="quizz"
      />
    </v-list-item-content>
  </div>
</template>
<script>
import QuizzItem from "../components/QuizzItem.vue";
export default {
  layout: "default",
  middleware: "auth",
  components: {
    QuizzItem,
  },
  data() {
    return {
      quizzes: []
      }
  },
  async created () {
    await this.$axios
        .request({
          method: "get",
          url: "/api/quizzes/all",
        })
        .then((response) => {
          this.quizzes = response.data
        })
        .catch((error) => {
          this.showSnackbar("Error while downloading quizzes", "error");
          console.log(error);
        });
  }
}
</script>