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
        Timer
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
                <v-spacer></v-spacer> <!-- For aligning the score the to right -->
                 <div>Current score {{score}} / {{maxScore}}</div>
               </v-card-actions>
             </v-card>
             <div class="text-left">
                <v-btn @click="changeZoom" id="levitation">Zoom!</v-btn>
             </div>
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
      mapStyle: '',
      playerList: ['François'],
		};
  },
  computed: {
    currentQuestion () {
      return this.quizz.questions[this.questionIndex]
    }
  },
  methods: {
    
    changeZoom() {

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
        if(this.questionIndex < this.quizz.questions.length-1) {
          if(this.selectedLocation === this.currentQuestion.answer) {
            this.score++
            this.highlightMap('green green-svg-map__location green-svg-map__location:focus green-svg-map__location:hover green-svg-map__location[aria-checked="true"]',3)
        } else {
          this.highlightMap('red red-svg-map__location red-svg-map__location:focus red-svg-map__location:hover red-svg-map__location[aria-checked="true"]',3)
        }
        this.questionIndex++
      } else {
        this.$router.push({
                            name:'result', 
                                          params:{
                                          score: this.score,
                                          maxScore: this.maxScore}
                          })
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
    loadQuizz(quizz){
      // TODO : validation of the quizz
      this.quizz = quizz
      try{
        this.loadText = "Loading Map"
        this.quizzMap = this.getMapByName(quizz.map)
        this.maxScore = quizz.questions.length
        this.curScore = 0
        this.questionIndex = 0
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
<style scoped>
#levitation {
  position: fixed;
  bottom: 0px;
  height: 70px;
}
</style>