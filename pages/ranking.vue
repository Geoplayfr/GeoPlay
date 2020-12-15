<template>
  <v-container>
    <div>
      <v-row
        align="center"
        class="text-center"
      >
        <v-col class="text-center">
          <h1>{{ $route.params.quiz_name }} Podium</h1>
        </v-col>
      </v-row>
      <v-row
        class="mb-12"
        justify="center"
        no-gutters
      >
        <v-col
          class="text-center"
          lg="9"
        >
          <template v-if="scores.length > 0">
            <template v-if="scores.length > 2">
              <v-card>
                <v-row
                  justify="center"
                  class="d-flex align-end mb-6"
                >
                  <v-col
                    align="center"
                    class="ma-2"
                  >
                    {{ scores[1].username }}
                    <v-container
                      class="rounded-lg"
                      fill-height
                      fluid
                      style="height: 115px; background-color: #1565c0"
                    >
                      <v-row
                        align="center"
                        justify="center"
                      >
                        <div class="text-h2 font-weight-bold">
                          2
                        </div>
                      </v-row>
                    </v-container>
                  </v-col>
                  <v-col
                    align="center"
                    class="ma-2"
                  >
                    {{ scores[0].username }}
                    <v-container
                      class="rounded-lg"
                      fill-height
                      fluid
                      style="height: 160px; background-color: #1e88e5"
                    >
                      <v-row
                        align="center"
                        justify="center"
                      >
                        <div class="text-h2 font-weight-bold">
                          1
                        </div>
                      </v-row>
                    </v-container>
                  </v-col>
                  <v-col
                    align="center"
                    class="ma-2"
                  >
                    {{ scores[2].username }}
                    <v-container
                      class="rounded-lg"
                      fill-height
                      fluid
                      style="height: 70px; background-color: #0d47a1"
                    >
                      <v-row
                        align="center"
                        justify="center"
                      >
                        <div class="text-h2 font-weight-bold">
                          3
                        </div>
                      </v-row>
                    </v-container>
                  </v-col>
                </v-row>
              </v-card>
            </template>
            <h2>Ranking</h2>
            <v-card>
              <v-data-table
                :headers="headers"
                :items="scores"
                :items-per-page="5"
                class="elevation-1"
              />
            </v-card>
          </template>
          <template v-else>
            <h2>No scores for this quiz</h2>
          </template>
        </v-col>
      </v-row>
      <v-btn to="/homepage">
        Go back
      </v-btn>
    </div>
  </v-container>
</template>
<script>
export default {
  name: 'Ranking',
  middleware: 'auth',
  data () {
    return {
      scores: [],
      headers: [
        {
          text: 'Name',
          align: 'center',
          value: 'username'
        },
        {
          text: 'Score (' + this.$route.params.nb_questions + ' questions)',
          align: 'center',
          value: 'score_value'
        },
        {
          text: '%',
          align: 'center',
          value: 'percent'
        }
      ]
    }
  },
  async mounted () {
    await this.$axios
      .get('/api/quizzes/' + this.$route.params.id_quiz + '/scores')
      .then((res) => {
        this.scores = res.data
        this.scores.forEach((element) => {
          element.percent =
            (element.score_value / this.$route.params.nb_questions) * 100
        })
        this.scores.sort((a, b) => b.score_value - a.score_value)
      })
      .catch((error) => {
        console.log(error)
      })
  }
}
</script>
