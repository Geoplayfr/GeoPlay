<template>
  <v-container>
    <p>Share the id :  <span class="primary--text">{{ $route.query.room }}</span>  with your friends</p>
    <v-card>
      <v-card-title>
        {{ quiz.name }}
      </v-card-title>
      <v-card-text>
        <p>
          Description: {{ quiz.description }}
        </p>
        <p>
          {{ quiz.nb_questions }} questions on {{ quiz.mapid }}
        </p>
        <p>
          Duration: {{ quiz.duration }} sec
        </p>
      </v-card-text>
    </v-card>
    <br>
    <v-card>
      <v-card-title>
        Players List {{ playerList.length }} / {{ $route.params.nbPlayers }}
      </v-card-title>
      <v-list-item
        v-for="(player, p) in playerList"
        :key="p"
      >
        <v-list-item-content>
          <v-list-item-title v-text="player.username" />
        </v-list-item-content>
      </v-list-item>
    </v-card>
    <v-row>
      <v-col class="text-left">
        <v-btn @click="goBack()">
          Go back
        </v-btn>
      </v-col>
      <v-col class="text-right">
        <template v-if="isCreator">
          <v-btn
            color="primary"
            @click="launchMulti()"
          >
            Start
          </v-btn>
        </template>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import PlayerList from '../components/PlayerList.vue'
import socket from '~/plugins/socket.io.js'
export default {
  name: 'Lobby',
  components: {
    PlayerList
  },
  middleware: 'auth',
  data () {
    return {
      quiz: '',
      isCreator: false,
      playerList: []
    }
  },

  async mounted () {
    this.isCreator = (this.$store.getters['users/user'].username === this.$route.query.room.split('-')[0].replace(/[0-9]/g, ''))
    this.lobby()
    await this.$axios
      .get('/api/quizzes/' + this.$route.params.id_quiz)
      .then((res) => {
        this.quiz = res.data
      })
      .catch((error) => {
        console.log(error)
      })
  },

  methods: {
    lobby () {
      this.setupSocketIO()
      socket.emit('createLobby', {
        username: this.$store.getters['users/user'].username,
        id: this.$store.getters['users/user'].id,
        id_quiz: this.$route.params.id_quiz,
        room: this.$route.query.room,
        room_size: this.$route.params.nbPlayers
      })
    },
    setupSocketIO () {
      console.log('>>> Loading socket io')

      /**
       * Check data before using it in the handlers
       */
      function c (data) {
        if (typeof data !== 'object') {
          throw new TypeError(
            'Every data exchanged for the geoplay game session should be in JSON, data obtained is ' +
              data
          )
        } else return data
      }
      socket.on('addUser', (serverData) => {
        console.log(serverData)
        this.playerList = serverData
        console.log(this.playerList)
      })
      socket.on('playerLeave', (serverData) => {
        this.$router.push({ path: 'homepage' })
      })
      socket.on('startGame', (serverData) => {
        const players = []
        for (const p in this.playerList) {
          players.push({ username: this.playerList[p].username, id: this.playerList[p].id, score: 0, socketId: socket.id })
        }
        this.$router.push({ path: 'game_multi', name: 'game_multi', params: { playerList: players, id_quiz: this.$route.params.id_quiz } })
      })
    },
    goBack () {
      if (!this.isCreator) {
        socket.emit('leaveRoom', {
          id: this.$store.getters['users/user'].id,
          room: this.$route.query.room
        })
      } else {
        socket.emit('leaveRoomCreator', {
          room: this.$route.query.room
        })
      }
    },
    launchMulti () {
      socket.emit('launchGame', {
        room: this.$route.query.room
      })
    }
  }
}
</script>
