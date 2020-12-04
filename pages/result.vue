<template>
  <v-row justify="center" align="center">
    <v-col cols="12" sm="10" md="10">
      <div>
        Quizz finished
        <div v-if="loaded">
          <div>Final score {{ score }} / {{ maxScore }}</div>
          <br />
          <v-progress-linear v-model="percent" height="25" ma-3>
            <strong>{{ Math.ceil(percent) }}%</strong>
          </v-progress-linear>
          <br />
          <v-btn to="/homepage">Main menu</v-btn>
        </div>
      </div>
    </v-col>
  </v-row>
</template>
<script>
export default {
  middleware: "auth",
  data() {
    return {
      score: "",
      maxScore: "",
      percent: "",
      loaded: false,
    };
  },
  mounted() {
    if (this.$route.params) {
      this.score = this.$route.params.score;
      this.maxScore = this.$route.params.maxScore;
      this.loaded = true;
      this.percent =
        (this.$route.params.score / this.$route.params.maxScore) * 100;
    } else {
      alert("route error");
    }
  },
};
</script>