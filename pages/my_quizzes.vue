<template>
  <div>
    <!-- Quiz Management -->
    <h2>Quiz editor</h2>
    <v-btn to="/create_quizz" class="ma-6" color="primary">
      <v-icon class="mr-2"> mdi-crosshairs-question </v-icon>
      Create quiz
    </v-btn>
    <v-list-item-content v-for="quizz in quizzes" :key="quizz.id">
      <quizz-profile-item
        @qpi-delete-action="showDeleteDialog"
        @qpi-rename-action="renameQuizItem"
        :quizz="quizz"
      />
    </v-list-item-content>
    <v-dialog v-model="dialogDelete" persistent max-width="320">
      <v-card>
        <v-card-title class="headline">Delete this quiz ?</v-card-title>
        <v-card-text>The quiz will be deleted forever</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="orange darken-1"
            text
            @click="deleteQuiz(selectedQuizId)"
          >
            Delete
          </v-btn>
          <v-btn color="grey" text @click="dialogDelete = false">
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-btn class="ma-5" to="/profile">
      <v-icon class="mr-2">mdi-arrow-left</v-icon>
      Go back</v-btn>
    <v-snackbar v-model="snackbar" bottom :color="snackBarColor">
      {{ snackbarMsg }}
      <v-btn color="white" text @click="snackbar = false"> Close </v-btn>
    </v-snackbar>
  </div>
</template>
<script>
import { mapGetters } from "vuex";
export default {
  middleware: "auth",
  data() {
    return {
      quizzes: [],
      snackbarMsg: "",
      snackbar: false,
      snackBarColor: "error",
      selectedQuizId: null,
      dialogDelete: false,
    };
  },
  computed: {
    ...mapGetters({
      us: "users/user",
    }),
  },
  methods: {
    showSnackbar(msg, color, show = true, timeout = 4000) {
      this.snackbarMsg = msg;
      this.snackBarColor = color;
      this.snackbar = show;

      if (show) {
        // Auto hide the snackbar after the given timeout
        setTimeout(() => {
          this.snackbar = false;
        }, timeout);
      }
    },
    showDeleteDialog(id) {
      this.selectedQuizId = id;
      this.dialogDelete = true;
    },
    cancelDeleteQuizItemDialog() {
      this.selectedQuizId = "";
      this.dialogDelete = false;
    },
    async renameQuizItem(renameTuple) {
      const quizToRename = this.quizzes.find(
        (x) => x.id_quiz === renameTuple.id_quiz
      );
      this.$axios
        .put("/api/quizzes/update/" + renameTuple.id_quiz, {
          newName: renameTuple.newText,
          newDescription: quizToRename.description,
          newMapId: quizToRename.mapid,
          newDifficulty: quizToRename.difficulty,
          newDuration: quizToRename.duration,
          newNbQuestion: quizToRename.nb_questions,
        })
        .then((response) => {
          this.showSnackbar(
            "Quiz renamed to : " + renameTuple.newText,
            "primary"
          );
        })
        .catch((error) => {
          this.showSnackbar("Error while renaming quiz", "error");
          console.log(error);
        });
    },
    async deleteQuiz(id) {
      await this.$axios
        .request({
          method: "delete",
          url: "/api/quizzes/delete/" + id,
        })
        .then(async (response) => {
          this.dialogDelete = false;
          this.selectedQuizId = "";
          try {
            const response = await this.$axios
              .get("/api/users/" + this.us.id + "/quizzes")
              .then((res) => {
                this.quizzes = res.data;
              });
          } catch (error) {
            this.showSnackbar(
              "Error while updating quizzes after deletion",
              "error"
            );
          }
          this.showSnackbar("Quiz deleted...", "primary");
        })
        .catch((error) => {
          this.showSnackbar("Error while deleting your quiz", "error");
          console.log(error);
        });
    },
  },
  async mounted() {
    // Load all quizzes
    await this.$axios
      .get("/api/users/" + this.us.id + "/quizzes")
      .then((res) => {
        this.quizzes = res.data;
      });
  },
};
</script>