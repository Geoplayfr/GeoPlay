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
        <div><v-icon>mdi-timer </v-icon> Timer {{ timeRemaining }}</div>
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
              <div class="my-2">
                {{ currentQuestion.question_tag }}
              </div>
              <v-btn @click="stopTimerAndQuit()">
                Quit
              </v-btn>
              <v-btn
                v-show="nextButtonVisible"
                :disabled="!nextButtonVisible"
                color="accent"
                @click="nextQuestion()"
              >
                {{ nextButtonText }}
              </v-btn>
              <v-spacer />
              <!-- For aligning the score the to right -->
              <div class="mt-5">
                Current score {{ score }} / {{ maxScore }}
              </div>
            </v-card>
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
import socket from '~/plugins/socket.io.js'

export default {
  name: 'Game',
  components: {
    RadioSvgMap
  },
  layout: 'game',
  middleware: 'game',
  data () {
    return {
      FranceRegions,
      World,
      loadText: 'Loading Quizz',
      quizzMap: null,
      question: null,
      selectedLocation: null,
      borderEnabled: false,
      quizzLoaded: false,
      circularColor: 'teal',
      questionIndex: 0,
      score: 0,
      maxScore: 999,
      timeRemaining: -1,
      mapStyle: '',
      mapSize: 8,
      greenMapStyle:
        'green green-svg-map__location green-svg-map__location:focus green-svg-map__location:hover green-svg-map__location[aria-checked="true"]',
      redMapStyle:
        'red red-svg-map__location red-svg-map__location:focus red-svg-map__location:hover red-svg-map__location[aria-checked="true"]',
      playerList: ['Guest'],
      highlightedRegions: null,
      cacheRegionClassList: null,
      nextButtonVisible: false,
      nextButtonText: 'Next question',
      goToResultPageText: 'Finish',
      zoomEnabled: false,
      settings: {
        noHoverAfterQuestion: true,
        noClickAfterQuestion: false,
        forceBorder: false
      }
    }
  },
  head () {
    return {
      script: [{ src: '/svg-pan-zoom.min.js' }]
    }
  },
  computed: {
    currentQuestion () {
      return this.quiz.questions[this.questionIndex]
    }
  },
  async mounted () {
    socket.removeAllListeners('timerFinished')
    this.highlightedRegions = []
    this.cacheRegionClassList = []
    socket.emit('disableServerTimer', { player: this.$store.getters['users/user'] })
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
        this.loadText = 'No input Quizz'
        this.circularColor = 'red'
        console.log(error)
        console.log('Error when loading quizz (not found)')
      })
  },
  methods: {
    stopTimerAndQuit () {
      socket.emit('disableServerTimer', { player: this.$store.getters['users/user'] })
      this.$router.push('/homepage')
    },
    /***
     * Check if the border needs to be activated with the param this.borderEnabled
     */
    checkBorder () {
      const map = document.getElementById('map')
      if (this.borderEnabled === true || this.settings.forceBorder === true) {
        map.style.border = '0.25rem solid rgb(30, 30, 30)'
      } else {
        map.style.border = 'none'
      }
    },
    /**
     * Get the player list from the route, if no players were detected, the current player is a guest
     * @return {Array<String>} the player list
     */
    getPlayerList () {
      if (this.$route.params.quizz && this.$route.params.quizz.playerList) {
        return [this.$route.params.quizz.playerList]
      } else {
        return ['Guest']
      }
    },
    /**
     * Set if the mouse pointer is detected on the current map, useful for disabling the focus and hover effects
     * @param {boolean} enabled  Enable / disable hovering the current map areas
     */
    setMapHoverEffect (enabled) {
      if (document.getElementById('map')) {
        var regions = document.getElementById('map').children
        for (let i = 0; i < regions.length; i++) {
          if (enabled) {
            regions[i].style['pointer-events'] = 'auto'
          } else {
            regions[i].style['pointer-events'] = 'none'
          }
        }
      } else {
        console.warn('Could not set map hover effect')
      }
    },
    /***
     * Remove all the region highlighted from the map and apply the style present before the highlight
     */
    removeHighlighting () {
      console.log('rmvHighlight, regions :', this.highlightedRegions)
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
      console.log('highlight : ' + regionId + ' in : ' + color)
      if (regionId === undefined || regionId === null) {
        return
      }
      const mapHtml = document.getElementById('map')
      if (mapHtml) {
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
      }
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
        setTimeout(() => {
          this.checkBorder()
        }, 2000)
        switch (name) {
          case 'Map of France regions':
            this.mapSize = 6
            return FranceRegions
          case 'Map of World':
            this.mapSize = 10 // World map is extremely big, we can make it take more screen space
            this.zoomEnabled = true
            this.borderEnabled = true
            return World
          case 'Map of France departments':
            this.mapSize = 6
            return FranceDep
          default:
            throw new Error('Map not found : ' + name)
        }
      }
      throw new Error('Map name not defined')
    },
    /**
     * Enable a timer to end the current quizz question
     * at the end of this timer, the "correction menu" is shown
     */
    enableServerTimer (currentQuestion) {
      console.log('>>>Enabled server timer' + Date.now())
      this.timeRemaining = currentQuestion.duration
      socket.emit('enableServerTimer', { duration: currentQuestion.duration, id: this.$store.getters['users/user'].id }) // Sending the duration in seconds to the server
      socket.once('timerFinished', (data) => {
        console.log('timerFinished ' + Date.now())
        this.showEndQuestionMenu(currentQuestion.id_question)
      })

      // UI only timer
      if (this.timerId) {
        clearInterval(this.timerId)
      }
      this.timerId = setInterval(() => {
        if (this.timeRemaining > 0) {
          this.timeRemaining--
        } else {
          clearInterval(this.timerId)
        }
      }, 1000)
    },
    /**
     * Close the "correction menu" and start a new question
     * @param {boolean} autoFinish If set to true, automatically redirects the player to the scoreboard page if there are no questions left
     */
    nextQuestion (firstStart = false, autoFinish = true) {
      if (this.quizzLoaded) {
        if (this.questionIndex < this.quiz.questions.length - 1) {
          this.nextButtonVisible = false
          this.selectedLocation = null
          if (!firstStart) {
            this.questionIndex++
          }
          if (this.questionIndex === this.quiz.questions.length - 1) {
            this.nextButtonText = this.goToResultPageText
          }
          this.removeHighlighting()

          if (this.settings.noHoverAfterQuestion) {
            console.log('setting hover effect')
            this.setMapHoverEffect(true)
          }

          this.enableServerTimer(this.currentQuestion)
        } else if (autoFinish) {
          // Quizz finished (all questions are done)
          this.$router.push({
            name: 'result',
            params: {
              score: this.score,
              maxScore: this.maxScore,
              quizId: this.$route.params.id_quiz
            }
          })
        }
      }
    },
    /**
     * Load the input quizz json & start the game
     * @param {JSON} questionId The question to be evaluated, and corrected
     */
    async showEndQuestionMenu (questionId) {
      console.log('Showing end question menu for question :', questionId)
      this.timeRemaining = 0
      await this.$axios
        .request({
          method: 'get',
          url: '/api/questions/response/' + questionId
        })
        .then((response) => {
          this.question = response.data
        })
        .catch((error) => {
          console.log('Error while downloading response')
          console.log(error)
        })
      // Show on the map the correct location
      if (this.selectedLocation !== this.question[0].response_location_id) {
        this.highlightMapRegion(
          this.quizzMap,
          this.question[0].response_location_id,
          'green'
        )
        this.highlightMapRegion(this.quizzMap, this.selectedLocation, 'red')
      } else {
        this.highlightMapRegion(
          this.quizzMap,
          this.question[0].response_location_id,
          'green'
        )
        // Increment score if user choice is valid
        this.score++
      }
      this.selectedLocation = null
      if (this.settings.noHoverAfterQuestion) {
        this.setMapHoverEffect(false)
      }
      // Show the button "Next question"
      this.nextButtonVisible = true
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
        this.quizzLoaded = true
        this.nextQuestion(true)
      } catch (e) {
        this.loadText = e.message
        this.circularColor = 'red'
      }
    }
  }
}
</script>
<style src="./css/mapStyles.css"></style>
