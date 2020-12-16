<template>
  <v-row
    justify="center"
    align="center"
  >
    <v-col
      cols="12"
      sm="10"
      md="10"
    >
      <div
        v-if="quizzLoaded && playerList"
        class="text-left"
      >
        Welcome {{ $store.getters["users/user"].username }}
      </div>
      <div
        v-if="quizzLoaded"
        class="text-right"
      >
        <div>Loaded quizz : {{ quiz.name }}</div>
        <div v-if="state === 'PLAYING'">
          <v-icon>mdi-timer </v-icon> Timer {{ timeRemaining }}
        </div>
        <div v-else-if="state === 'CORRECTING'">
          <v-icon>mdi-timer </v-icon> Next question in {{ timeRemaining }}
        </div>
      </div>
      <div class="text-center">
        <v-progress-circular
          v-if="!quizzLoaded"
          indeterminate
          :color="circularColor"
          :size="120"
        >
          {{ loadText }}
        </v-progress-circular>
        <v-row>
          <v-col xs="12">
            <v-card
              v-if="quizzLoaded"
              class="pa-4"
              elevation="10"
            >
              <div class="my-2">
                Q{{ questionIndex + 1 }}
              </div>
              <div
                v-if="currentQuestion"
                class="my-2"
              >
                {{ currentQuestion.question_tag }}
              </div>
              <!--
              <v-btn
                v-show="nextButtonVisible"
                :disabled="!nextButtonVisible"
                color="accent"
                @click="askNextQuestion()"
              >
                {{ nextButtonText }}
              </v-btn>
              -->
              <v-spacer />
              <!-- For aligning the score the to right -->
              <div class="mt-5">
                Current score {{ score }} / {{ maxScore }}
              </div>
            </v-card>
            <player-list :player-list="playerList" />
          </v-col>
          <v-col
            :cols="mapSize"
            xs="12"
          >
            <radio-svg-map
              v-if="quizzLoaded"
              id="map"
              v-model="selectedLocation"
              :location-class="mapStyle"
              :map="quizzMap"
              @click="onMapRegionClicked"
            />
          </v-col>
        </v-row>
      </div>
    </v-col>
  </v-row>
</template>

<script>
import { RadioSvgMap } from 'vue-svg-map'
import FranceRegions from '@svg-maps/france.regions'
import World from '@svg-maps/world'
import FranceDep from '@svg-maps/france.departments'
import PlayerList from '../components/PlayerList.vue'
import socket from '~/plugins/socket.io.js'

export default {
  name: 'Game',
  // middleware: "game",
  components: {
    RadioSvgMap
  },
  layout: 'game',
  middleware: 'auth',
  data () {
    // eslint-disable-next-line no-unused-expressions
    PlayerList
    return {
      FranceRegions,
      World,
      loadText: 'Loading Quizz',
      quizzMap: null,
      quizz: null,
      question: null,
      selectedLocation: null,
      quizzLoaded: false,
      circularColor: 'teal',
      questionIndex: 0,
      timerId: undefined,
      score: 0,
      state: 'WAITING',
      room: 0,
      maxScore: 999,
      timeRemaining: -1,
      mapStyle: '',
      mapSize: 8,
      currentQuestion: null,
      greenMapStyle:
        'green green-svg-map__location green-svg-map__location:focus green-svg-map__location:hover green-svg-map__location[aria-checked="true"]',
      redMapStyle:
        'red red-svg-map__location red-svg-map__location:focus red-svg-map__location:hover red-svg-map__location[aria-checked="true"]',
      playerList: [],
      highlightedRegions: [],
      cacheRegionClassList: null,
      nextButtonVisible: false,
      nextButtonText: 'Next question',
      goToResultPageText: 'Finish',
      zoomEnabled: false,
      settings: {
        noHoverAfterQuestion: true,
        noClickAfterQuestion: false
      }
    }
  },
  head () {
    return {
      script: [{ src: '/svg-pan-zoom.min.js' }]
    }
  },
  async mounted () {
    this.room = 0 // Is pushed to the server
    this.highlightedRegions = []
    this.cacheRegionClassList = []
    await this.$axios
      .request({
        method: 'get',
        url: '/api/quizzes/' + this.$route.params.id_quiz
      })
      .then((response) => {
        this.quiz = response.data
        this.loadQuizz(this.quiz)
        if (this.zoomEnabled) {
          setTimeout(() => {
            // eslint-disable-next-line no-undef
            svgPanZoom('#map')
            document.getElementById('map').style = 'height:700px;width:100%'
          }, 1000)
        }
      })
      .catch((error) => {
        console.log('Error while downloading quiz')
        this.circularColor = 'red'
        if (error.response && error.response.status === 404) {
          this.loadText = 'Quiz was not found in the database'
        } else {
          this.loadText = error
        }
      })
  },
  methods: {
    /**
     * Get the player list from the route, if no players were detected, the current player is a guest
     * @return {Array<String>} the player list
     */
    getPlayerList () {
      console.log(this.$route.params.playerList)
      if (this.$route.params && this.$route.params.playerList) {
        return this.$route.params.playerList
      } else {
        return [
          { username: 'Guest', score: 0, id: 0 },
          { username: 'François', score: 0, id: 1 },
          { username: 'Marine', score: 1, id: 2 },
          { username: 'Guest', score: 0, id: 3 },
          { username: 'François', score: 0, id: 4 },
          { username: 'Marine', score: 8, id: 5 }
        ]
      }
    },
    /**
     * Set if the mouse pointer is detected on the current map, useful for disabling the focus and hover effects
     * @param {boolean} enabled  Enable / disable hovering the current map areas
     */
    setMapHoverEffect (enabled) {
      if (document.getElementById('map') !== null) {
        var regions = document.getElementById('map').children

        for (let i = 0; i < regions.length; i++) {
          if (enabled) {
            regions[i].style['pointer-events'] = 'auto'
          } else {
            regions[i].style['pointer-events'] = 'none'
          }
        }
      }
      console.warn('Map not loaded yet (hover effect')
    },
    /***
     * Remove all the region highlighted from the map and apply the style present before the highlight
     */
    removeHighlighting () {
      for (let i = 0; i < this.highlightedRegions.length; i++) {
        this.highlightedRegions[i].classList.remove(
          ...this.highlightedRegions[i].classList
        )
        this.highlightedRegions[i].classList.add(...this.cacheRegionClassList)
      }
      this.highlightedRegions = []
    },
    /**
     * Highlight a region for the given map, any highlighted
     *  @param map {SVG} the svg of the map
     *  @param regionId {String} the identifier of the region
     *  @param color {String} the theme to apply, possible values : 'green' | 'red'
     */
    highlightMapRegion (map, regionId, color) {
      if (regionId === undefined || regionId === null) {
        return
      }
      const mapHtml = document.getElementById('map')
      let regionToColor = null
      // Loading with the svg-pan plugin see https://github.com/ariutta/svg-pan-zoom
      if (
        mapHtml.children.length === 1 &&
        mapHtml.children[0].className.baseVal === 'svg-pan-zoom_viewport'
      ) {
        regionToColor = mapHtml.children[0].children.namedItem(regionId)
      } else {
        regionToColor = mapHtml.children.namedItem(regionId)
      }
      this.cacheRegionClassList = [...regionToColor.classList]
      regionToColor.classList.remove(...regionToColor.classList) // Remove all classes from regionToColor
      regionToColor.blur() // Stop the focus

      switch (color) {
        case 'green':
          regionToColor.classList.add(...this.greenMapStyle.split(' '))
          break
        case 'red':
          regionToColor.classList.add(...this.redMapStyle.split(' '))
          break
        default:
          break
      }
      if (!this.highlightedRegions) {
        this.highlightedRegions = []
      }
      this.highlightedRegions.push(regionToColor)
    },
    /**
     * Highlight the map for a few seconds
     * @param {String} style  the style for highlighting, possible values : 'green' or 'red'
     * @param {Number} durationSeconds the number of seconds
     */
    highlightMap (style, durationSeconds) {
      const oldStyle = this.mapStyle
      this.mapStyle = style
      setTimeout(() => {
        this.selectedLocation = null
        this.mapStyle = oldStyle
      }, durationSeconds * 1000)
    },
    /**
     * Event listener for when an area of the map is clicked
     */
    onMapRegionClicked () {
      // Disable svg selection when the current question is finished
      if (this.nextButtonVisible) {
        this.selectedLocation = null
      }
    },
    /**
     * get a vue-svg-map object if found
     * @param {String} name the map name
     * @return {Object} the map if found
     */
    getMapByName (name) {
      if (name) {
        switch (name) {
          case 'Map of France regions':
            this.mapSize = 6
            return FranceRegions
          case 'Map of World':
            this.mapSize = 10 // World map is extremely big, we can make it take more screen space
            this.zoomEnabled = true
            return World
          case 'Map of France departments':
            this.mapSize = 6
            return FranceDep
          default:
            throw new Error('Map not found')
        }
      }
      throw new Error('Map name not defined')
    },
    /**
     * Local timer, that displays the time you have to answer the question, the server will by itself send the correction
     */
    enableRemainingSecondsTimer (timeInSeconds) {
      clearInterval(this.timerId)
      this.timeRemaining = timeInSeconds
      this.timerId = setInterval(() => {
        if (this.timeRemaining > 0) {
          this.timeRemaining--
        } else {
          if (this.timerId !== undefined) {
            clearInterval(this.timerId)
          }
        }
      }, 1000)
    },
    askNextQuestion () {
      // Do nothing, feature not implemented yet
      console.log('Not implemented yet')
    },
    /**
     * Authorize the player to play the current question
     * */
    showCurQuestionMenu (serverData) {
      this.loadQuizz = false
      this.nextButtonVisible = false
      this.selectedLocation = null
      this.questionIndex = serverData.questionIndex
      if (this.quiz.questions < this.quiz.nb_questions) {
        this.nextButtonText = this.goToResultPageText
      }
      this.removeHighlighting()
      if (this.settings.noHoverAfterQuestion) {
        this.setMapHoverEffect(true)
      }
      this.enableRemainingSecondsTimer(serverData.remainingSeconds)
    },
    /**
     * serverData : response_location_id + score
     * @param {JSON} serverData The data from the server
     */
    async showEndQuestionMenu (serverData) {
      this.timeRemaining = serverData.correction_duration
      if (this.selectedLocation !== serverData.response_location_id) {
        // Show the location you selected
        this.highlightMapRegion(this.quizzMap, this.selectedLocation, 'red')
        // Show on the map the correct location
        this.highlightMapRegion(
          this.quizzMap,
          serverData.response_location_id,
          'green'
        )
      } else {
        this.highlightMapRegion(
          this.quizzMap,
          serverData.response_location_id,
          'green'
        )
        // Increment score if user choice is valid
        this.score = serverData.score
      }
      this.selectedLocation = null
      if (this.settings.noHoverAfterQuestion) {
        this.setMapHoverEffect(false)
      }
      // Show the button "Next question"
      this.nextButtonVisible = true
    },
    setupSocketIO () {
      socket.on('RequestQuestionResult', (data) => {
        const result = {
          id: this.$store.getters['users/user'].id,
          response_location_id: this.selectedLocation
        }
        console.log(
          'Requesting results, sending them...',
          this.selectedLocation
        )
        socket.emit('QuestionResult', result)
      })

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
      socket.on('GameStateReceived', (serverData) => {
        console.log(
          'GameStateReceived Received message from server : ',
          serverData
        )
        const state = c(serverData).status
        this.state = state
        switch (state) {
          case 'STOPPED':
            this.removeHighlighting()
            this.cacheRegionClassList = []
            // Quizz finished (arrived too late / bug)
            this.$router.push({
              name: 'result_multi',
              params: {
                game: serverData.stopped_data.game
              }
            })
            break
          case 'WAITING':
            this.quizzLoaded = false
            this.loadQuizz = true
            this.loadText = 'Waiting for players'
            break
          case 'PLAYING':
            this.quizzLoaded = true
            this.loadQuizz = false
            this.questionIndex = serverData.playing_data.questionIndex
            this.currentQuestion = c(serverData.playing_data.question)
            this.showCurQuestionMenu(c(serverData.playing_data))
            break
          case 'CORRECTING':
            this.showEndQuestionMenu(c(serverData.correcting_data))
            break
          default:
            throw new Error('Unknown game state ' + state)
        }
      })

      // Can be updated dynamically (the results can appear as the you are watching the correction)
      socket.on('CurQuestionResultsReceived', (data) => {
        console.log(
          'CurQuestionResultsReceived Received message from server : ',
          data
        )
        this.showCurQuestionResults(c(data))
      })

      socket.on('CurQuestionReceived', (data) => {
        console.log(
          'CurQuestionReceived Received message from server : ',
          data
        )
        this.currentQuestion = c(data)
      })

      socket.on('UpdatePlayers', (data) => {
        console.log('UpdatePlayers Received message from server : ', data)
        this.playerList = data
      })
    },
    /**
     * Load the input quizz json & start the game
     * @param {JSON} quiz The quizz to be loaded
     */
    loadQuizz (quiz) {
      try {
        this.loadText = 'Loading Map'
        this.playerList = this.getPlayerList()
        this.quizzMap = this.getMapByName(quiz.mapid)
        this.maxScore = quiz.questions.length
        this.score = 0
        this.questionIndex = 0
        this.setupSocketIO()
        this.quizzLoaded = true
        socket.emit('RequestGameState', {
          username: this.$store.getters['users/user'].username,
          id: this.$store.getters['users/user'].id,
          id_quiz: this.$route.params.id_quiz,
          room: this.$route.params.room
        })
      } catch (e) {
        this.loadText = e.message
        this.circularColor = 'red'
      }
    }
  }
}
</script>
<style src="./css/mapStyles.css"></style>
