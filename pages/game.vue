<template>
<v-row justify="center" align="center">
    <v-col cols="12" sm="10" md="10">
      <div v-if="quizzLoaded && playerList" class="text-left">
        Welcome {{playerList[0]}}
      </div>  
      <div v-if="quizzLoaded" class="text-right">
        Loaded quizz {{quizz.name}}
      </div>
      <div v-if="quizzLoaded" class="text-right">
        <!-- Font awesome icon -->
        <fa :icon="['fas', 'stopwatch']" />
        Timer {{timeRemaining}}
        </div>
      <div class="text-center">
        <v-progress-circular
        v-if="!quizzLoaded"
         indeterminate
         :color="circularColor"
         :size="120"
      > {{ loadText }}</v-progress-circular>

        <radio-svg-map id="map" :location-class='mapStyle' v-if="quizzLoaded" :map="quizzMap"  v-model="selectedLocation" @click="onMapRegionClicked" />
             <v-card v-if="quizzLoaded">
               <div>Q{{questionIndex+1}}</div>
               <div>{{quizz.questions[questionIndex].question}}</div>
               <v-card-actions>
                 <v-btn to="/">Quit</v-btn>
                 <v-btn 
                 v-show="nextButtonVisible"
                 :disabled="!nextButtonVisible" 
                 color="accent"
                 @click="nextQuestion()"
                 >Next question</v-btn>
                <v-spacer></v-spacer> <!-- For aligning the score the to right -->
                 <div>Current score {{score}} / {{maxScore}}</div>
               </v-card-actions>
             </v-card>
      </div>
    </v-col>
  </v-row>
</template>
<script>
import { RadioSvgMap  } from "vue-svg-map";
import Taiwan from "@svg-maps/taiwan"
import World from "@svg-maps/world"
import France from "@svg-maps/france.departments"
export default {
  name: 'game',
   components: {
    RadioSvgMap
  },
  props: {
      props: ['quizz'],
  },
	data() {
    // TODO : extract into a separate component
		return {
      Taiwan,
      World,
      loadText: 'Loading Quizz',
      quizzMap: null,
      quizz: null,
      selectedLocation: null,
      quizzLoaded: false,
      circularColor: 'teal',
      questionIndex: 0,
      score: 0,
      maxScore: 999,
      timeRemaining: -1,
      mapStyle: '',
      greenMapStyle: 'green green-svg-map__location green-svg-map__location:focus green-svg-map__location:hover green-svg-map__location[aria-checked="true"]',
      redMapStyle : 'red red-svg-map__location red-svg-map__location:focus red-svg-map__location:hover red-svg-map__location[aria-checked="true"]',
      playerList: ['François'],
      highlightedRegions: null,
      cacheRegionClassList: null,
      nextButtonVisible: false
		};
  },
  computed: {
    currentQuestion () {
      return this.quizz.questions[this.questionIndex]
    }
  },
  methods: {

    highlightMapRegion(map,regionId,color) {
        var regions = map.locations
        var regionToColor = document.getElementById('map').children.namedItem(regionId)
        // console.log('highlight',regionToColor)
        console.log('fullobj color ', color, regionToColor)
        this.cacheRegionClassList = [...regionToColor.classList]
        regionToColor.classList.remove(...regionToColor.classList)
        regionToColor.blur() // Stop the focus
        switch (color) {
          case 'green':
            regionToColor.classList.add(...this.greenMapStyle.split(' '))
            break;
          case 'red':
            regionToColor.classList.add(...this.redMapStyle.split(' '))
          default:
            break;
        }
        if(!this.highlightedRegions) {
          this.highlightedRegions = []
        }
        this.highlightedRegions.push(regionToColor)
    },
    /**
     * Highlight the map for a few seconds
     */
    highlightMap(style, durationSeconds) {
      const oldStyle = this.mapStyle
      this.mapStyle = style
      setTimeout(()=>{
        this.selectedLocation = null
        this.mapStyle = oldStyle
      },durationSeconds*1000)
    },
    onMapRegionClicked() {
      // Disable svg selection when the current question is finished
      if(this.nextButtonVisible) {
        this.selectedLocation = null
      }
    },
    getMapByName(name) {
      if(name) {
        switch (name.toLowerCase()) {
          case 'taiwan':
            return Taiwan
          case 'world' :
            return World
          case 'france.departments' : 
          return France
          default:
            throw new Error('Map not found')
        }
      }
      throw new Error('Map name not defined')
    },
    enableTimer(time) {
      this.timeRemaining = time
 var timerId = setInterval(() => {
    if(this.timeRemaining > 0) {
            this.timeRemaining--
          } else {
            clearInterval(timerId)
            this.showEndQuestionMenu(this.currentQuestion)
          }
        }, 1000);
    },
    nextQuestion() {
      if(this.questionIndex <  this.quizz.questions.length - 1 ) {
        this.nextButtonVisible = false
        this.selectedLocation = null
        this.questionIndex++
        for(let i = 0 ; i < this.highlightedRegions.length ; i++) {
          this.highlightedRegions[i].classList.remove(...this.highlightedRegions[i].classList)
          console.log('cache', this.cacheRegionClassList)  
          this.highlightedRegions[i].classList.add(...this.cacheRegionClassList)
        }
        this.highlightedRegions = []
        this.enableTimer(this.quizz.timer)
      } else {
        // Quizz finished 
              this.$router.push({
              name:'result', 
                                          params:{
                                          score: this.score,
                                          maxScore: this.maxScore}
              })
      }

    },
    showEndQuestionMenu(question) {
      // Show on the map the correct location
      if(this.selectedLocation !== question.answer) {
        this.highlightMapRegion(this.quizzMap,question.answer,'red')
      } else {
        this.highlightMapRegion(this.quizzMap,question.answer,'green')
        // Increment score if user choice is valid
        this.score++
      }
      this.selectedLocation = null
      
      // Show the button "Next question"
      this.nextButtonVisible = true
    },
    loadQuizz(quizz){
      // TODO : validation of the quizz
      this.quizz = quizz
      try{
        this.loadText = "Loading Map"
        this.quizzMap = this.getMapByName(quizz.map)
        console.log(this.quizzMap)
        this.maxScore = quizz.questions.length
        this.score = 0
        this.questionIndex = 0
        // Timer
        this.enableTimer(quizz.timer)
       
        this.quizzLoaded = true
      } catch(e) {
         this.loadText = e.message
         this.circularColor = "red"
      }
    }
  },
  mounted() {
    if(this.$route.params.quizz) {
      this.loadQuizz(this.$route.params.quizz)
    } else {
      // TODO : change to a cleaner error
      console.error('Error when loading quizz (not found)')
      this.loadText = "No input Quizz"
      this.circularColor = "red"
    }
  }
}
</script>
<style src="./css/mapStyles.css"></style>