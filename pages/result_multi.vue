<template>
  <v-row>
    <v-col
      cols="12"
      sm="10"
      md="10"
    >
      <v-row class="d-flex align-start flex-column">
        <v-btn to="/homepage">
          Main menu
        </v-btn>
      </v-row>
      <br>
      <v-row
        justify="center"
        align="center"
      >
        <div
          justify="center"
          align="center"
        >
          <h3>Quizz finished !</h3>
          <br>
          <div
            v-for="player in sortedPlayers"
            :key="player.id"
            class="ma-5"
          >
            <div
              justify="center"
              align="center"
            >
              Score for {{ player.username }} : {{ player.score }} /
              {{ maxScore }}
            </div>
            <br>
            <v-progress-circular
              :value="getPercentPlayer(player)"
              :size="150"
              ma-3
            >
              <strong>{{ Math.ceil(getPercentPlayer(player)) }}%</strong>
            </v-progress-circular>
          </div>
        </div>
      </v-row>
      <v-snackbar
        v-model="snackbar"
        bottom
        :color="snackBarColor"
      >
        {{ snackbarMsg }}
        <v-btn
          color="white"
          text
          @click="snackbar = false"
        >
          Close
        </v-btn>
      </v-snackbar>
    </v-col>
  </v-row>
</template>
<script>
export default {
  middleware: 'game',
  data () {
    return {
      score: '',
      maxScore: '',
      percent: '',
      snackbarMsg: '',
      snackbar: false,
      snackBarColor: 'error',
      playerList: []
    }
  },
  computed: {
    sortedPlayers () {
      if (this.playerList.length > 0) {
        return this.playerList.sort((a, b) => b.score - a.score)
      }
      return this.playerList
    }
  },
  async mounted () {
    const game = this.$route.params.game
    this.maxScore = game.quizz.nb_questions - 1
    this.playerList = game.playerList
    const userId = parseInt(this.$store.getters['users/user'].id)
    await this.$axios
      .post('/api/scores/add', {
        quizId: game.quizz.id_quiz,
        userId: userId,
        score_value: parseInt(
          game.playerList.find((p) => p.id === userId).score
        )
      })
      .catch((error) => {
        this.showSnackbar('Error while submitting your score', 'error')
        console.log(error)
      })
  },
  methods: {
    getPercentPlayer (player) {
      return player.score / this.maxScore * 100
    },
    showSnackbar (msg, color, show = true, timeout = 4000) {
      this.snackbarMsg = msg
      this.snackBarColor = color
      this.snackbar = show

      if (show) {
        // Auto hide the snackbar after the given timeout
        setTimeout(() => {
          this.snackbar = false
        }, timeout)
      }
    }
  }
}
</script>
