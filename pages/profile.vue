<template>
  <div>
    <!-- User card (profile info) -->
    <v-card v-if="us">
      <v-card-title> Profile settings | {{ us.username }} </v-card-title>
    </v-card>

    <div class="ma-5">
      <!-- User profile edition -->
      <!--    Username edition-->
      <v-form ref="changeUsernameForm" v-model="validUsername">
        <h2>Change your username</h2>
        <v-text-field
          v-model="newUsername"
          :rules="pseudoRules"
          label="New username"
          required
        ></v-text-field>
        <v-text-field
          label="Enter your password"
          v-model="password"
          :rules="passwordRulesUsername"
          @keyup.enter="changeUsername(password)"
          :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          :type="showPassword ? 'text' : 'password'"
          @click:append="showPassword = !showPassword"
          required
        />
        <v-btn
          @click="changeUsername(password)"
          :disabled="!validUsername"
          color="primary"
          >Change username</v-btn
        >
        <v-divider class="my-5"></v-divider>
      </v-form>
      <!--    Password edition-->
      <v-form ref="changePasswordForm" v-model="validPassword">
        <h2>Change your password</h2>
        <v-text-field
          label="Enter your password"
          v-model="password2"
          :rules="passwordRules"
          @keyup.enter="changePassword(password2, newPassword)"
          :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          :type="showPassword ? 'text' : 'password'"
          @click:append="showPassword = !showPassword"
          required
        />
        <v-text-field
          label="Enter your new password"
          v-model="newPassword"
          :rules="newPasswordRules"
          @keyup.enter="changePassword(password2, newPassword)"
          :append-icon="showPassword2 ? 'mdi-eye' : 'mdi-eye-off'"
          :type="showPassword2 ? 'text' : 'password'"
          @click:append="showPassword2 = !showPassword2"
          required
        />
        <v-btn
          :disabled="!validPassword"
          @click="changePassword(password2, newPassword)"
          color="primary"
          >Change password</v-btn
        >
        <v-btn @click="previousPage">Go back</v-btn>
      </v-form>
      <v-divider class="my-5"></v-divider>

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
      <h2>Others</h2>
      <v-dialog v-model="dialog" persistent max-width="600px">
        <template v-slot:activator="{ on, attrs }">
          <v-btn class="ma-6" color="error" dark v-bind="attrs" v-on="on">
            Delete account
          </v-btn>
        </template>
        <v-form v-model="canDeleteAccount">
          <v-card>
            <span class="headline p a-5">Delete this account</span>
            <v-card-text
              >This action is not reversible. Type your password to delete your
              account definitely</v-card-text
            >
            <v-text-field
              v-model="password3"
              :rules="deletePasswordRules"
              class="pa-6"
              label="Password"
              :append-icon="showPassword3 ? 'mdi-eye' : 'mdi-eye-off'"
              :type="showPassword3 ? 'text' : 'password'"
              required
              @click:append="showPassword3 = !showPassword3"
            ></v-text-field>
            <v-card-actions>
              <v-btn
                color="error"
                @click="deleteAccount(password3)"
                :disabled="!canDeleteAccount"
                >Delete account</v-btn
              >
              <v-btn @click="dialog = false">Go back</v-btn>
            </v-card-actions>
          </v-card>
        </v-form>
      </v-dialog>
      <v-snackbar v-model="snackbar" bottom :color="snackBarColor">
        {{ snackbarMsg }}
        <v-btn color="white" text @click="snackbar = false"> Close </v-btn>
      </v-snackbar>
    </div>
  </div>
</template>
<script>
import { mapGetters } from "vuex";
import QuizzProfileItem from "../components/QuizzProfileItem.vue";

export default {
  layout: "default",
  data() {
    return {
      // Mock user profile
      user: null,
      dialog: false,
      dialogDelete: false,
      snackbarMsg: "",
      snackbar: false,
      snackBarColor: "error",
      newUsername: "",
      password: "",
      password2: "",
      password3: "",
      showPassword: false,
      showPassword2: false,
      showPassword3: false,
      validUsername: false,
      validPassword: false,
      canDeleteAccount: false,
      newPassword: "",
      quizzes: "",
      selectedQuizId: "",
      passwordRulesUsername: [
        (password) => !!password || "A password is required",
        (password) =>
          (password && password.trim() !== "") ||
          "A password cannot have only whitespaces",
      ],
      pseudoRules: [
        (newUsername) => !!newUsername || "A username is required",
        (newUsername) =>
          (newUsername && newUsername.trim() !== "") ||
          "A username cannot have only whitespaces",
      ],
      passwordRules: [
        (password) => !!password || "A password is required",
        (password) =>
          (password && password.trim() !== "") ||
          "A password cannot have only whitespaces",
      ],
      newPasswordRules: [
        (password) => !!password || "A password is required",
        (password) =>
          (password && password.trim() !== "") ||
          "A password cannot have only whitespaces",
      ],
      deletePasswordRules: [
        (password) => !!password || "A password is required",
        (password) =>
          (password && password.trim() !== "") ||
          "A password cannot have only whitespaces",
      ],
    };
  },
  computed: {
    ...mapGetters({
      us: "users/user",
    }),
  },
  methods: {
    showDeleteDialog(id) {
      console.log("Selected : ", id);
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
        .then((response) => {
          console.log(response);
          this.dialogDelete = false;
          this.selectedQuizId = "";
          this.quizzes = this.quizzes.filter((quizz) => quizz.id_quiz !== id);
          this.showSnackbar("Quiz deleted...", "primary");
        })
        .catch((error) => {
          this.showSnackbar("Error while deleting your quiz", "error");
          console.log(error);
        });
    },
    showSnackbar(msg, color, show = true) {
      this.snackbarMsg = msg;
      this.snackBarColor = color;
      this.snackbar = show;
    },
    async changeUsername(changePassword) {
      const password = changePassword.trim();
      await this.$axios.get("/api/users/" + this.us.id).then((res) => {
        if (res.data.username === this.newUsername) {
          this.showSnackbar("You are already using this username", "error");
        } else {
          this.$axios
            .put("/api/users/" + this.us.id + "/" + this.newUsername, {
              password: password,
            })
            .then((response) => {
              this.$store.commit("users/connect", {
                id: this.us.id,
                username: this.newUsername,
              });
              this.showSnackbar("Username changed", "primary");
              this.$refs.changeUsernameForm.reset();
            })
            .catch((error) => {
              this.showSnackbar("Error while changing username", "error");
              console.log(error);
            });
        }
      });
    },
    async changePassword(password, newPassword) {
      password = password.trim();
      newPassword = newPassword.trim();
      await this.$axios
        .put("/api/users/" + this.us.id, {
          currentPassword: password, // The current password for the user
          newPassword: this.newPassword, // Entered password
        })
        .then((response) => {
          this.showSnackbar("Password changed", "primary");
          this.$refs.changePasswordForm.reset();
        })
        .catch((error) => {
          this.showSnackbar("Incorrect credentials", "error");
          console.log(error);
        });
    },
    async deleteAccount(changePassword) {
      // We can't use $axios.delete, this method is broken at the moment
      await this.$axios
        .request({
          method: "delete",
          url: "/api/users/" + this.us.id,
          data: { password: changePassword },
        })
        .then((response) => {
          this.password3 = "";
          this.canDeleteAccount = false;
          this.$store.commit("users/disconnect");
          this.showSnackbar(
            "Account deleted, redirecting to login...",
            "primary"
          );
          setTimeout(() => {
            this.$router.push("/");
          }, 2000);
        })
        .catch((error) => {
          this.dialog = false;
          this.showSnackbar("Error while deleting your account", "error");
          console.log(error);
        });
    },
    previousPage() {
      this.$router.back();
    },
  },
  async mounted() {
    // Load all quizzes
    await this.$axios
      .get("/api/users/" + this.us.id + "/quizzes")
      .then((res) => {
        console.log("QUIZZES", res.data);
        this.quizzes = res.data;
      });
  },
  middleware: "auth",
};
</script>
