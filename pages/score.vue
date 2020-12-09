<template>
  <v-container>
    <div>
      <h1>Quizz finished</h1>
      <v-card max-width="500px">
        <v-row  class="d-flex align-end mb-6">
          <v-col align="center" class="ma-2">
            <v-card height="100px" color="blue darken-3">
              a
            </v-card>
          </v-col>
          <v-col align="center" class="ma-2">
            <v-card height="160px" color="blue darken-1">
              a
            </v-card>
          </v-col>
          <v-col align="center" class="ma-2">
            <v-card height="70px" color="blue darken-4">
              a
            </v-card>
          </v-col>
        </v-row>
      </v-card>
      <ul id="example-1">
        <li v-for="player in players" :key="player.name">
          {{ player.name }} :
          <v-avatar color="indigo" size="36">
            <span class="white--text">{{ player.score }}</span>
          </v-avatar> 
        </li>
      </ul>
    </div>
  </v-container>
</template>
<script>
export default {
  middleware: "auth",
  data() {
    return {
      players: [
        { name: "Marc", score: 12 },
        { name: "François", score: 0 },
        { name: "Marine", score: 0.25 },
        { name: "Nicolas", score: 2044 },
      ],
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
    console.log(this.$route.params);
  },
};
</script>