<template>
  <v-row>
    <v-col cols="12" sm="10" md="10">
      <v-row class="d-flex align-start flex-column">
          <v-btn to="/homepage">Main menu</v-btn>
      </v-row>
      <br />
      <v-row justify="center" align="center">
      <div justify="center" align="center">
        <h3>
        Quizz finished !
        </h3>
        <br/>
        <div v-if="loaded">
          <div justify="center" align="center">Final score {{ score }} / {{ maxScore }}</div>
          <br />
          <v-progress-circular :value="percent" :size="150" ma-3>
            <strong>{{ Math.ceil(percent) }}%</strong>
          </v-progress-circular>
        </div>
      </div>
      <v-snackbar v-model="snackbar" bottom :color="snackBarColor">
        {{ snackbarMsg }}
        <v-btn color="white" text @click="snackbar = false"> Close </v-btn>
      </v-snackbar>
    </v-col>
  </v-row>
</template>
<script>
export default {
  middleware: "game",
  data() {
    return {
      score: "",
      maxScore: "",
      percent: "",
      snackbarMsg: "",
      snackbar: false,
      snackBarColor: "error",
      loaded: false,
    };
  },
  methods: {
    showSnackbar(msg, color, show = true, timeout = 4000) {
      this.snackbarMsg = msg;
      this.snackBarColor = color;
      this.snackbar = show;

      if (show) {
        // Auto hide the snackbar after the given timeout
        setTimeout(() => {
          this.snackbar = false;
        }, timeout);
      }
    },
  },
  async mounted() {
    if (
      this.$route.params.hasOwnProperty("score") &&
      this.$route.params.hasOwnProperty("maxScore") &&
      this.$route.params.hasOwnProperty("quizId")
    ) {
      this.score = this.$route.params.score;
      this.maxScore = this.$route.params.maxScore;
      this.loaded = true;
      this.percent = (this.$route.params.score / this.$route.params.maxScore) * 100;
      await this.$axios
        .post("/api/scores/add", {
          quizId:this.$route.params.quizId,
          userId: parseInt(this.$store.getters["users/user"].id),
          score_value: parseInt(this.score),
        })
        .catch((error) => {
          this.showSnackbar("Error while submitting your score", "error");
          console.log(error);
        });
    }
  },
};
</script>
