<template>
  <div>
    <v-card fluid>
      <v-row>
        <v-col cols="10">
          <v-card-title>{{ quizz.name }}</v-card-title>
          <v-card-text class="pt-0 pb-0"
            >Description: {{ quizz.description }}</v-card-text
          >
          <v-row> 
            <v-col
              ><v-card-text class="pb-0"
                >Difficulty: {{ quizz.difficulty }}</v-card-text
              ></v-col
            >
            <v-col
              ><v-card-text class="pb-0" 
                >Duration: {{ quizz.duration }} sec</v-card-text
              ></v-col
            >
            <v-col>
              <v-card-text class="pb-0"
                >{{ quizz.nb_questions }} questions</v-card-text
              ></v-col
            >
            <v-col
              ><v-card-text class="pb-0"
                >Creator: {{ quizz.creator }}</v-card-text
              ></v-col
            >
          </v-row>
        </v-col>
        <v-col class="d-flex align-end flex-column mt-auto">
          <v-card-actions>
            <v-btn 
              color="primary"
              nuxt
              :to="{ name: 'game', params: { id_quiz: quizz.id_quiz} }">
                Start
            </v-btn>
          </v-card-actions>
        </v-col>
      </v-row>
    </v-card>
  </div>
</template>
<script>
export default {
  props: {
    quizz: {
      required: true,
    },
  },
  data() {
    return {};
  }
};
</script>