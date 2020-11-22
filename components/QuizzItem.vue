<template>
  <div>
    <v-card :loading="loading" fluid>
      <v-card-title>{{ quizz.name }}</v-card-title>
      <v-card-text
        >Diffculty: {{ quizz.difficulty }} <br />Duration: {{ quizz.duration }}
        <br />Number of questions: {{ quizz.nbQuestion }}<br />Creator:
        {{ quizz.creator }}
      </v-card-text>
      <v-card-actions v>
        <v-btn color="primary">Start</v-btn>
      </v-card-actions>
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