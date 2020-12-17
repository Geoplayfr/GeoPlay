<template>
  <v-container>
    <p>
      Share the id :
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            v-bind="attrs"
            height="25px"
            v-on="on"
            @click="copyRoom()"
          >
            <span class="primary--text">{{ $route.query.room }}</span>
          </v-btn>
        </template>
        Copy to clipboard
      </v-tooltip>
      with your friends
    </p>
    <v-scroll-y-transition>
      <v-alert v-show="showCopied">
        Copied to clipboard
      </v-alert>
    </v-scroll-y-transition>
    <v-card>
      <v-card-title>
        {{ quiz.name }}
      </v-card-title>
      <v-card-text>
        <p>Lobby access : {{ roomStatus.lobbyOpen }}</p>
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
          <v-col cols="1">
            <v-list-item-title v-text="player.username" />
          </v-col>
          <v-col cols="10" />
          <v-col cols="1  ">
            <v-btn
              v-if="!isCreator"
              @click="requestKick(player.id)"
            >
              Kick
            </v-btn>
          </v-col>
        </v-list-item-content>
      </v-list-item>
    </v-card>
    <v-row>
      <v-col class="text-left">
        <v-row
          class="mx-1"
        >
          <v-btn @click="goBack()">
            Go back
          </v-btn>
          <div v-if="isCreator">
            <v-btn
              v-if="isOpen"
              color="error"
              class="mx-2"
              @click="toggleLobbyLock()"
            >
              <v-icon class="mr-1">
                mdi-lock
              </v-icon>
              Lock lobby
            </v-btn>
            <v-btn
              v-else
              color="success"
              class="mx-2"
              @click="toggleLobbyLock()"
            >
              <v-icon class="mr-1">
                mdi-lock-open-variant
              </v-icon>
              Open lobby
            </v-btn>
          </div>
        </v-row>
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
import socket from '~/plugins/socket.io.js'
export default {
  name: 'Lobby',
  components: {
  },
  middleware: 'auth',
  data () {
    return {
      showCopied: false,
      quiz: '',
      isOpen: true,
      isCreator: false,
      roomStatus: { lobbyOpen: true },
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
      socket.removeAllListeners('addUser')
      socket.removeAllListeners('playerLeave')
      socket.removeAllListeners('setRoomAccessInfo')
      socket.removeAllListeners('startGame')

      socket.on('addUser', (serverData) => {
        this.playerList = serverData
        console.log(this.playerList)
      })
      socket.on('playerLeave', (serverData) => {
        this.$router.push({ path: 'homepage' })
      })
      socket.on('setRoomInfo', (serverData) => {
        this.roomStatus = serverData
      })
      socket.on('startGame', (serverData) => {
        this.$router.push({
          path: 'game_multi',
          name: 'game_multi',
          params: {
            id_quiz: this.$route.params.id_quiz,
            room: this.$route.query.room
          }
        })
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
    toggleLobbyLock () {
      this.isOpen = !this.isOpen
      socket.emit('lobbyLock', {
        room: this.$route.query.room,
        lobbyOpen: this.isOpen
      })
    },
    launchMulti () {
      socket.emit('launchGame', {
        room: this.$route.query.room
      })
    },
    requestKick (playerid) {
      socket.emit('requestKick', {
        room: this.$route.query.room,
        id: playerid
      })
    },
    copyRoom () {
      console.log('copy room')
      this.showCopied = true
      const el = document.createElement('textarea')
      el.value = this.$route.query.room
      el.setAttribute('readonly', '')
      el.style.position = 'absolute'
      el.style.left = '-9999px'
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      setTimeout(() => {
        this.showCopied = false
      }, 2000)
    }
  }
}
</script>
