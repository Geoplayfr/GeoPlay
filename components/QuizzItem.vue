<template>
  <div>
    <v-card fluid>
      <v-row>
        <v-col>
          <v-card-title style="padding: 0px 15px">
            {{ quizz.name }}
            <v-col class="text-right">
              <v-btn
                color="primary"
                nuxt
                icon
                :to="{ name: 'ranking', params: { id_quiz: quizz.id_quiz, nb_questions: quizz.nb_questions, quiz_name: quizz.name} }"
              >
                <v-icon>mdi-trophy</v-icon>
              </v-btn>
            </v-col>
          </v-card-title>
          <v-card-text
            v-if="!!quizz.description"
            class="pt-0 pb-0"
          >
            Description: {{ quizz.description }}
          </v-card-text>
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
              <v-btn
                color="primary"
                nuxt
                :to="{ name: 'game', params: { id_quiz: quizz.id_quiz} }"
              >
                Start
              </v-btn>
            </v-col>
          </v-row>
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
  data () {
    return {}
  }
}
</script>
