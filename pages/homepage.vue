<template>
  <div id="app">
    <v-list-item-content
      v-for="quizz in filteredQuizzes"
      :key="quizz.id"
    >
      <quizz-item :quizz="quizz" />
    </v-list-item-content>
    <v-card v-if="!quizzAvailable">
      <v-row
        align="center"
        justify="center"
      >
        <v-col cols="6">
          <v-card-title>Didn't find any quizzes yet</v-card-title>
          <v-card-text>
            You can access your profile to create new quizzes, or wait for some
            to be created by other players
          </v-card-text>
        </v-col>
        <v-col
          cols="6"
          class="text-right"
        >
          <v-btn
            to="/profile"
            class="mr-5"
            color="primary"
          >
            Go to Profile
          </v-btn>
        </v-col>
      </v-row>
    </v-card>
    <v-btn to="/game_multi">
      Multi Test
    </v-btn>
  </div>
</template>
<script>
import QuizzItem from '../components/QuizzItem.vue'
export default {
  components: {
    QuizzItem
  },
  layout: 'default',
  middleware: 'auth',
  data () {
    return {
      quizzes: [],
      quizzAvailable: false
    }
  },
  computed: {
    filteredQuizzes () {
      return this.quizzes.filter((q) => q.questions.length >= 5)
    }
  },
  async created () {
    await this.$axios
      .request({
        method: 'get',
        url: '/api/quizzes/all'
      })
      .then((response) => {
        this.quizzes = response.data
        if (this.quizzes.length > 0) {
          this.quizzAvailable = true
        }
      })
      .catch((error) => {
        this.showSnackbar('Error while downloading quizzes', 'error')
        console.log(error)
      })
  }
}
</script>
