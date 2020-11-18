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
                    @keyup.enter="submitUnique"
                    type="text"
                    required
                  />
                  <v-text-field
                    label="Your password"
                    v-model="password"
                    :rules="passwordRules"
                    @keyup.enter="submitUnique"
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
                  @click="submitUnique">Sign in</v-btn>
                </v-row>
              </v-card-actions>
              <v-card-actions>
                <v-spacer />
                <v-row align="center">
                  <a href="/register">Not subscribed yet click here</a>
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
  data () {
    return {
      errorMsg:"",
      snackbar: false,
      username:"",
      password:"",
      show1: false,
      valid: false,
      pseudoRules: [
      (username) => !!username || 'A username is required',
      (username) => username.trim() !== '' || 'A username cannot have only whitespaces'
      ],
      passwordRules: [
        (password) => !!password || 'A password is required',
        (password) => password.trim() !== '' || 'A password cannot have only whitespaces',
      ],
    }
  },
  methods: {
    submitUnique() {

    }
  }
}
</script>