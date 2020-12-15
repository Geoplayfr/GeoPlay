<template>
  <div>
    <v-card fluid>
      <v-row no-gutters style="padding: 0px">
        <v-col>
          <v-card-title>
            {{ quizz.name }}
            <v-col class="text-right">
              <v-btn
                color="primary"
                nuxt
                icon
                :to="{
                  name: 'ranking',
                  params: {
                    id_quiz: quizz.id_quiz,
                    nb_questions: quizz.nb_questions,
                    quiz_name: quizz.name,
                  },
                }"
              >
                <v-icon>mdi-trophy</v-icon>
              </v-btn>
            </v-col>
          </v-card-title>
          <v-card-text
            v-if="!!quizz.description"
            class="pt-0 pb-0"
          >
          <v-row>
            <v-col>
              <v-card-text
                class="pb-0"
              >
                Difficulty: {{ quizz.difficulty }}
              </v-card-text>
            </v-col>
            <v-col>
              <v-card-text
                class="pb-0"
              >
                Duration: {{ quizz.duration }} sec
              </v-card-text>
            </v-col>
            <v-col>
              <v-card-text
                class="pb-0"
              >
                {{ quizz.nb_questions }} questions
              </v-card-text>
            </v-col>
            <v-col>
              <v-card-text
                class="pb-0"
              >
                Creator: {{ quizz.creator }}
              </v-card-text>
            </v-col>
            <v-col
              class="text-right"
              style="margin:10px"
            >
            <v-col class="text-right">
              <v-dialog v-model="dialog" width="600">
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    style="margin: 0 0 10px 10px"
                    color="primary"
                    v-bind="attrs" 
                    v-on="on"
                  >
                    Multiplayer
                  </v-btn>
                </template>

                <v-card>
                  <v-card-title>
                    Room Settings
                  </v-card-title>
                  <br />
                  <v-card-text>
                    <v-slider
                    v-model="playersNumber"
                    label="Number of player"
                    max="10"
                    min="2"
                    step="1"
                    class="align-center"
                    thumb-label="always"
                    >
                  </v-slider>
                  </v-card-text>
                  <v-divider></v-divider>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn 
                      color="primary"
                      text @click="multiplayerSettings = false"
                      :to="{ name: 'lobby', query: {room: username + Date.now() + '-' + quizz.id_quiz +  '-' + playersNumber}, params: { id_quiz: quizz.id_quiz, nbPlayers: playersNumber} }"
                    >
                      Create
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-col>
              <v-btn
                style="margin: 12px 20px 10px 10px"
                color="primary"
                nuxt
                :to="{ name: 'game', params: { id_quiz: quizz.id_quiz } }"
              >
                Solo
              </v-btn>
            </v-col>
          </v-row>
          </v-card-text>
        </v-col>
      </v-row>
    </v-card>
  </div>
</template>
<script>
export default {
  props: {
    quizz: {
      required: true
    }
  },
  data() {
    return {
      multiplayerSettings: false,
      playersNumber: 2,
      username: this.$store.getters["users/user"].username
    }
  }
}
</script>
