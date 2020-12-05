<template>
  <div id="app">
    <v-list-item-content v-for="quizz in quizzes" :key="quizz.id">
      <quizz-item v-if="quizz.questions.length >= 5" :quizz="quizz" />
    </v-list-item-content>
    <v-card v-if="quizzes.length === 0">
      <v-row>
        <v-col cols="6">
          <v-card-title>Didn't find any quizzes yet</v-card-title>
          <v-card-text
            >You can access your profile to create new quizzes, or wait for some
            to be created by other players</v-card-text
          >
        </v-col>
        <v-col cols="6" class="text-right">
          <v-btn to="/profile"
           height="100%"
           class="mr-5"
           color="primary">Go to Profile</v-btn>
        </v-col>
      </v-row>
    </v-card>
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
      quizzes: [],
    };
  },
  async created() {
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
  },
};
</script>