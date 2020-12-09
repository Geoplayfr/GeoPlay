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
      </v-row>
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
      loaded: false,
    };
  },
  mounted() {
    if (this.$route.params.hasOwnProperty('score') && this.$route.params.hasOwnProperty('maxScore')) {
      this.score = this.$route.params.score;
      this.maxScore = this.$route.params.maxScore;
      this.loaded = true;
      this.percent =
        (this.$route.params.score / this.$route.params.maxScore) * 100;
    }
  },
};
</script>