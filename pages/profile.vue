<template>
  <div>
    <!-- User card (profile info) -->
    <v-card  v-if="us">
      <v-card-title>
        Profile settings | {{ us.username }}
      </v-card-title>
    </v-card>

    <div class="ma-5">
      <!-- User profile edition -->
      <!--    Username edition-->
      <v-form v-model="validUsername">
        <h2>Change your username</h2>
        <v-text-field
          v-model="newUsername"
          :rules="pseudoRules"
          label="New username"
          required
        ></v-text-field>
        <v-form v-model="validPassword">
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
        </v-form>
        <v-btn
          @click="changeUsername(password)"
          :disabled="!validUsername"
          color="primary"
          >Change username</v-btn
        >
        <v-divider class="my-5"></v-divider>
      </v-form>
      <!--    Password edition-->
      <v-form v-model="validPassword">
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
      <h2>Others</h2>
      <v-dialog v-model="dialog" persistent max-width="600px">
        <template v-slot:activator="{ on, attrs }">
          <v-btn color="error" dark v-bind="attrs" v-on="on">
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
      <v-snackbar v-model="snackbar" bottom color="error">
        {{ snackbarMsg }}
        <v-btn color="white" text @click="snackbar = false"> Close </v-btn>
      </v-snackbar>
    </div>
  </div>
</template>
<script>
import { mapGetters } from "vuex";
export default {
  layout: "default",
  data() {
    return {
      // Mock user profile
      user: null,
      dialog: false,
      snackbarMsg: "",
      snackbar: false,
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
      passwordRulesUsername: [
        (password) => !!password || "A password is required",
        (password) =>
          password.trim() !== "" || "A password cannot have only whitespaces",
      ],
      pseudoRules: [
        (username) => !!username || "A username is required",
        (username) =>
          username.trim() !== "" || "A username cannot have only whitespaces",
      ],
      passwordRules: [
        (password) => !!password || "A password is required",
        (password) =>
          password.trim() !== "" || "A password cannot have only whitespaces",
      ],
      newPasswordRules: [
        (password) => !!password || "A password is required",
        (password) =>
          password.trim() !== "" || "A password cannot have only whitespaces",
      ],
      deletePasswordRules: [
        (password) => !!password || "A password is required",
        (password) =>
          password.trim() !== "" || "A password cannot have only whitespaces",
      ],
    };
  },
  computed: {
    ...mapGetters({
      us: "users/user",
    }),
  },
  methods: {
    async changeUsername(changePassword) {
      const password = changePassword.trim();
      await this.$axios.get("/api/users/" + this.us.id).then((res) => {
        console.log(res.data.username, this.newUsername);
        if (res.data.username === this.newUsername) {
          this.snackbarMsg = "You are already using this username";
          this.snackbar = true;
        } else {
          this.$axios
            .put("/api/users/" + this.us.id + "/" + this.newUsername, {
              password: password,
            })
            .then((response) => {
              this.password = "";
              this.$store.commit("users/connect", {
                id: this.us.id,
                username: this.newUsername,
              });
              this.snackbarMsg = "Username changed";
              this.snackbar = true;
            })
            .catch((error) => {
              this.snackbarMsg = "Error while changing username";
              this.snackbar = true;
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
          this.snackbarMsg = "Password changed";
          this.snackbar = true;
          this.newPassword = "";
          this.password2 = "";
        })
        .catch((error) => {
          this.snackbarMsg = "Incorrect credentials";
          this.snackbar = true;
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
          this.snackbarMsg = "Account deleted, redirecting to login...";
          this.snackbar = true;
          setTimeout(() => {
            this.$router.push("/");
          }, 2000);
        })
        .catch((error) => {
          this.dialog = false;
          this.snackbarMsg = "Error while deleting your account";
          this.snackbar = true;
          console.log(error);
        });
    },
    previousPage() {
      this.$router.back();
    },
  },
  middleware: "auth",
  mounted() {
    console.log("STORE", this.$store.getters);
  },
};
</script>
