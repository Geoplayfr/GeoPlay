<template>
  <div>
    <v-card fluid>
      <v-row>
        <v-col cols="10">
          <v-text-field class="ma-4" v-model="title"></v-text-field>
          <v-card-text class="pt-0 pb-0"
            >Description: {{ quizz.description }}</v-card-text
          >
          <v-row>
            <v-col
              ><v-card-text class="pb-0"
                >Difficulty: {{ quizz.difficulty }}</v-card-text
              ></v-col
            >
            <v-col>
              <v-card-text class="pb-0">Duration : {{ quizz.duration }} sec</v-card-text>
            </v-col>

            <v-col>
              <v-card-text class="pb-0"
                >{{ quizz.nbQuestion }} questions</v-card-text
              ></v-col
            >
          </v-row>
        </v-col>
        <v-col class="d-flex align-end flex-column">
          <v-btn class="ma-2" color="primary" @click="renameAction"
            >Rename</v-btn
          >
          <v-btn class="ma-2" color="primary" @click="deleteAction"
            >Delete</v-btn
          >
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
      type: Object,
    },
  },
  data() {
    return {
      title: this.quizz.name,
    };
  },
  methods: {
    renameAction() {
      this.$emit("qpi-rename-action", {
        newText: this.title,
        id_quiz: this.quizz.id_quiz,
      });
    },
    deleteAction() {
      this.$emit("qpi-delete-action", this.quizz.id_quiz);
    },
  },
};
</script>