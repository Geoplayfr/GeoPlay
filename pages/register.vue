<template>
  <div class="parent">
    <v-container
      class="fill-height"
      fluid
    >
      <v-snackbar
        v-model="snackbar"
        bottom
        color="error"
      >
        {{ errorMsg }}
        <v-btn
          color="white"
          text
          @click="snackbar = false"
        >
          Close
        </v-btn>
      </v-snackbar>
      <v-row
        align="center"
        justify="center"
      >
        <v-col
          cols="12"
          sm="8"
          md="4"
        >
          <v-card class="elevation-12">
            <v-card-text>
              <v-form v-model="valid">
                <v-text-field
                  v-model="username"
                  label="Your username"
                  :rules="pseudoRules"
                  type="text"
                  required
                  @keyup.enter="submitUnique"
                />
                <v-text-field
                  v-model="password"
                  label="Enter your password"
                  :rules="passwordRules"
                  :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                  :type="show1 ? 'text' : 'password'"
                  required
                  @keyup.enter="submitUnique"
                  @click:append="show1 = !show1"
                />
                <v-text-field
                  v-model="passwordConfirm"
                  label="Confirm your password"
                  :rules="confirmPasswordRules"
                  :append-icon="show2 ? 'mdi-eye' : 'mdi-eye-off'"
                  :type="show2 ? 'text' : 'password'"
                  required
                  @keyup.enter="submitUnique"
                  @click:append="show2 = !show2"
                />
              </v-form>
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-row align="center">
                <v-btn
                  color="primary"
                  :disabled="!valid"
                  @click="submitUnique"
                >
                  Sign up
                </v-btn>
              </v-row>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
<script>
export default {
  layout: 'notAuthenticated',
  data () {
    return {
      errorMsg: '',
      snackbar: false,
      username: '',
      password: '',
      passwordConfirm: '',
      show1: false,
      show2: false,
      valid: false,
      pseudoRules: [
        (username) => !!username || 'A username is required',
        (username) => username.trim() !== '' || 'A username cannot have only whitespaces'
      ],
      passwordRules: [
        (password) => !!password || 'A password is required',
        (password) => password.trim() !== '' || 'A password cannot have only whitespaces'
      ],
      confirmPasswordRules: [
        (passwordConfirm) => !!passwordConfirm || 'Please confirm your password'
      ]
    }
  },
  methods: {
    async submitUnique () {
      if (this.password !== this.passwordConfirm) {
        this.errorMsg = 'The two passwords do not match'
        this.snackbar = true
      } else {
        await this.$axios.post('/api/users/add', {
          username: this.username,
          password: this.password
        }).then(response => {
          this.$store.commit('users/connect', { id: response.data.id_user, username: response.data.username })
          this.$router.push('/homepage')
        })
          .catch(error => {
            this.errorMsg = 'Incorrect credentials: ' + error.response.data.message
            this.snackbar = true
            console.log(error.response.data.message)
          })
      }
    }
  }
}
</script>
