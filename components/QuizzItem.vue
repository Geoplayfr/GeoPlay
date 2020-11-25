<template>
  <div>
    <v-card :loading="loading" fluid>
      <v-row>
        <v-col cols="10">
          <v-card-title>{{ quizz.name }}</v-card-title>
          <v-card-text
            >Diffculty: {{ quizz.difficulty }} <br />Duration:
            {{ quizz.duration }} <br />Number of questions: {{ quizz.nbQuestion
            }}<br />Creator:
            {{ quizz.creator }}
          </v-card-text>
        </v-col>
        <v-col align-self="center">
          <v-card-actions>
            <v-btn color="primary">Start</v-btn>
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
      type: String,
    },
  },
  data() {
    return {};
  },
};
</script>