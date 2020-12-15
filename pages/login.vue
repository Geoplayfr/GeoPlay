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
      {{errorMsg}}
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
                    label="Your username"
                    v-model="username"
                    :rules="pseudoRules"
                    @keyup.enter="login"
                    type="text"
                    required
                  />
                  <v-text-field
                    label="Your password"
                    v-model="password"
                    :rules="passwordRules"
                    @keyup.enter="login"
                    :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                    :type="show1 ? 'text' : 'password'"
                    @click:append="show1 = !show1"
                    required
                  />
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer />
                <v-row align="center">
                  <v-btn
                  color="primary"
                  :disabled="!valid"
                  @click="login">Login</v-btn>
                </v-row>
              </v-card-actions>
              <v-card-actions>
                <v-spacer />
                <v-row align="center">
                  <div style="color:gray">Not registered yet ?
                  <NuxtLink to="/register">
                  click here</NuxtLink>
                  </div>
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
      show1: false,
      valid: false,
      pseudoRules: [
        (username) => !!username || 'A username is required',
        (username) => username.trim() !== '' || 'A username cannot have only whitespaces'
      ],
      passwordRules: [
        (password) => !!password || 'A password is required',
        (password) => password.trim() !== '' || 'A password cannot have only whitespaces'
      ]
    }
  },
  methods: {
    async login () {
      this.username = this.username.trim()
      this.password = this.password.trim()
      await this.$axios.post('/api/users/check', {
        username: this.username,
        password: this.password
      }).then(response => {
        this.errorMsg = 'Welcome Back'
        this.snackbar = true
        this.$store.commit('users/connect', { id: response.data.id_user, username: response.data.username })
        this.$router.push('/homepage')
      })
        .catch(error => {
          this.errorMsg = 'Incorrect credentials'
          this.snackbar = true
          console.log(error)
        })
    }
  }
}
</script>
