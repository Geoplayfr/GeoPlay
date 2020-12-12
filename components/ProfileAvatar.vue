<template>
  <div v-if="user">
    <v-container fluid>
      <v-menu bottom min-width="200px" rounded offset-y>
        <template v-slot:activator="{ on }">
          <v-btn icon x-large v-on="on">
            <v-avatar color="brown" size="48">
              <span class="white--text headline">{{usernameInitials}}</span>
            </v-avatar>
          </v-btn>
        </template>
        <v-card>
          <v-list-item-content class="justify-center pa-2">
            <div class="mx-auto text-center">
              <v-avatar color="brown">
                <span class="white--text headline">{{usernameInitials}}</span>
              </v-avatar>
              <h3 class="mt-1">{{user.username }}</h3>
              <p class="caption mt-1">Account active</p>
              <v-divider class="my-3"></v-divider>
              <v-btn depressed rounded text to="/profile"> Edit Account </v-btn>
              <v-divider class="my-3"></v-divider>
              <v-btn depressed rounded text @click="disconnect"> Disconnect </v-btn>
            </div>
          </v-list-item-content>
        </v-card>
      </v-menu>
    </v-container>
  </div>
</template>
<script>
export default {
  props: {
    user: {
      required: true,
    },
  },
  computed: {
    usernameInitials() {
      if(this.user.username.length >=2 ) {
        return this.user.username.toUpperCase().substring(0,2)
      }
      return this.user.username.toUpperCase()
    }
  },
  methods: {
    disconnect(){
      this.$store.commit('users/disconnect')
      this.$router.push('/')
    }
  }
};
</script>