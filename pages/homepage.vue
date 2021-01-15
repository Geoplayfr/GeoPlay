<template>
  <div id="app">
    <v-row>
      <v-col>
        <v-text-field
          v-model="roomId"
          label="Join a multiplayer lobby by entering an id"
        />
      </v-col>
      <v-col>
        <v-btn
          color="primary"
          @click="joinLobby(roomId)"
        >
          Join
        </v-btn>
      </v-col>
    </v-row>
    <v-list-item-content
      v-for="quizz in filteredQuizzes"
      :key="quizz.id"
    >
      <quizz-item :quizz="quizz" />
    </v-list-item-content>
    <v-card v-if="!quizzAvailable">
      <v-row
        align="center"
        justify="center"
      >
        <v-col cols="6">
          <v-card-title>Didn't find any quizzes yet</v-card-title>
          <v-card-text>
            You can access your profile to create new quizzes, or wait for some
            to be created by other players
          </v-card-text>
        </v-col>
        <v-col
          cols="6"
          class="text-right"
        >
          <v-btn
            to="/profile"
            class="mr-5"
            color="primary"
          >
            Go to Profile
          </v-btn>
        </v-col>
      </v-row>
    </v-card>
    <v-dialog
      v-model="dialogRoomError"
      width="500"
    >
      <v-card>
        <v-card-title class="headline">
          <v-icon class="mr-2">
            mdi-alert
          </v-icon>
          {{ dialogRoomMsg }}
        </v-card-title>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
import QuizzItem from '../components/QuizzItem.vue'
import socket from '~/plugins/socket.io.js'
export default {
  components: {
    QuizzItem
  },
  layout: 'default',
  middleware: 'auth',
  data () {
    return {
      quizzes: [],
      quizzAvailable: false,
      roomId: '',
      dialogRoomError: false,
      dialogRoomMsg: ''
    }
  },
  computed: {
    filteredQuizzes () {
      return this.quizzes.filter((q) => q.questions.length >= 5)
    }
  },
  async created () {
    socket.removeAllListeners('joinLobby')
    socket.removeAllListeners('validateJoin')
    socket.removeAllListeners('fullRoom')
    socket.removeAllListeners('lockedRoom')
    await this.$axios
      .request({
        method: 'get',
        url: '/api/quizzes/all'
      })
      .then((response) => {
        this.quizzes = response.data
        if (this.quizzes.length > 0) {
          this.quizzAvailable = true
        }
      })
      .catch((error) => {
        this.showSnackbar('Error while downloading quizzes', 'error')
        console.log(error)
      })
  },
  methods: {
    /**
     * Show a dialog for the room to join with the specified text message
     */
    showRoomDialog (msg) {
      if (msg !== undefined) {
        this.dialogRoomMsg = msg
      } else {
        this.dialogRoomMsg = 'Can\'t join this room (no message is specified)'
      }
      this.dialogRoomError = true
    },
    joinLobby (id) {
      id = id.trim()
      socket.emit('joinLobby', {
        username: this.$store.getters['users/user'].username,
        id: this.$store.getters['users/user'].id,
        room: id
      })
      socket.on('validateJoin', (serverData) => {
        this.$router.push({
          path: 'lobby',
          name: 'lobby',
          query: { room: id },
          params: {
            id_quiz: serverData.quiz_id,
            nbPlayers: serverData.nbPlayers
          }
        })
      })
      socket.on('fullRoom', (serverData) => {
        this.showRoomDialog(serverData.msg)
      })
      socket.on('lockedRoom', (serverData) => {
        this.showRoomDialog(serverData.msg)
      })
    }
  }
}
</script>
