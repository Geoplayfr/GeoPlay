<template>
  <v-row justify="center" align="center">
    <v-col cols="12" sm="10" md="10">
      <div v-if="quizzLoaded && playerList" class="text-left">
        Welcome {{ $store.getters["users/user"].username }}
      </div>
      <div v-if="quizzLoaded" class="text-right">
        <div>Loaded quizz : {{ quiz.name }}</div>
        <div>
          Timer {{ timeRemaining }}
        </div>
      </div>
      <div class="text-center">
        <v-progress-circular
          v-if="!quizzLoaded"
          indeterminate
          :color="circularColor"
          :size="120"
        >
          {{ loadText }}</v-progress-circular
        >

        <radio-svg-map
          id="map"
          :location-class="mapStyle"
          v-if="quizzLoaded"
          :map="quizzMap"
          v-model="selectedLocation"
          @click="onMapRegionClicked"
        />
        <v-card v-if="quizzLoaded">
          <div>Q{{ questionIndex + 1 }}</div>
          <div>{{ currentQuestion.question_tag }}</div>
          <v-card-actions>
            <v-btn to="/">Quit</v-btn>
            <v-btn
              v-show="nextButtonVisible"
              :disabled="!nextButtonVisible"
              color="accent"
              @click="nextQuestion()"
              >{{this.nextButtonText}}</v-btn
            >
            <v-spacer></v-spacer>
            <!-- For aligning the score the to right -->
            <div>Current score {{ score }} / {{ maxScore }}</div>
          </v-card-actions>
        </v-card>
      </div>
    </v-col>
  </v-row>
</template>
<script>
import { RadioSvgMap } from "vue-svg-map";
import FranceRegions from "@svg-maps/france.regions";
import World from "@svg-maps/world";
import FranceDep from "@svg-maps/france.departments";


export default {
  name: "game",
  middleware: "auth",
  components: {
    RadioSvgMap,
  },
  data() {
    return {
      FranceRegions,
      World,
      loadText: "Loading Quizz",
      quizzMap: null,
      quizz: null,
      question: null,
      selectedLocation: null,
      quizzLoaded: false,
      circularColor: "teal",
      questionIndex: 0,
      score: 0,
      maxScore: 999,
      timeRemaining: -1,
      mapStyle: "",
      greenMapStyle:
        'green green-svg-map__location green-svg-map__location:focus green-svg-map__location:hover green-svg-map__location[aria-checked="true"]',
      redMapStyle:
        'red red-svg-map__location red-svg-map__location:focus red-svg-map__location:hover red-svg-map__location[aria-checked="true"]',
      playerList: ["Guest"],
      highlightedRegions: null,
      cacheRegionClassList: null,
      nextButtonVisible: false,
      nextButtonText: 'Next question',
      settings: {
        noHoverAfterQuestion: true,
        noClickAfterQuestion: false,
      },
    };
  },
  computed: {
    currentQuestion() {
      return this.quiz.questions[this.questionIndex];
    },
  },
  methods: {
    /**
     * Get the player list from the route, if no players were detected, the current player is a guest
     * @return {Array<String>} the player list
     */
    getPlayerList() {
      if (this.$route.params.quizz && this.$route.params.quizz.playerList) {
        return this.$route.params.quizz.playerList;
      } else {
        return ["Guest"];
      }
    },
    /**
     * Set if the mouse pointer is detected on the current map, useful for disabling the focus and hover effects
     * @param {boolean} enabled  Enable / disable hovering the current map areas
     */
    setMapHoverEffect(enabled) {
      var regions = document.getElementById("map").children;

      for (let i = 0; i < regions.length; i++) {
        if (enabled) {
          regions[i].style["pointer-events"] = "auto";
        } else {
          regions[i].style["pointer-events"] = "none";
        }
      }
    },
    /***
     * Remove all the region highlighted from the map and apply the style present before the highlight
     */
    removeHighlighting() {
      for (let i = 0; i < this.highlightedRegions.length; i++) {
        this.highlightedRegions[i].classList.remove(
          ...this.highlightedRegions[i].classList
        );
        this.highlightedRegions[i].classList.add(...this.cacheRegionClassList);
      }
      this.highlightedRegions = [];
    },
    /**
     * Highlight a region for the given map, any highlighted
     *  @param map {SVG} the svg of the map
     *  @param regionId {String} the identifier of the region
     *  @param color {String} the theme to apply, possible values : 'green' | 'red'
     */
    highlightMapRegion(map, regionId, color) {
      var regionToColor = document
        .getElementById("map")
        .children.namedItem(regionId);
      this.cacheRegionClassList = [...regionToColor.classList];
      regionToColor.classList.remove(...regionToColor.classList); // Remove all classes from regionToColor
      regionToColor.blur(); // Stop the focus

      switch (color) {
        case "green":
          regionToColor.classList.add(...this.greenMapStyle.split(" "));
          break;
        case "red":
          regionToColor.classList.add(...this.redMapStyle.split(" "));
          break;
        default:
          break;
      }
      if (!this.highlightedRegions) {
        this.highlightedRegions = [];
      }
      this.highlightedRegions.push(regionToColor);
    },
    /**
     * Highlight the map for a few seconds
     * @param {String} style  the style for highlighting, possible values : 'green' or 'red'
     * @param {Number} durationSeconds the number of seconds
     */
    highlightMap(style, durationSeconds) {
      const oldStyle = this.mapStyle;
      this.mapStyle = style;
      setTimeout(() => {
        this.selectedLocation = null;
        this.mapStyle = oldStyle;
      }, durationSeconds * 1000);
    },
    /**
     * Event listener for when an area of the map is clicked
     */
    onMapRegionClicked() {
      // Disable svg selection when the current question is finished
      if (this.nextButtonVisible) {
        this.selectedLocation = null;
      }
    },
    /**
     * get a vue-svg-map object if found
     * @param {String} name the map name
     * @return {Object} the map if found
     */
    getMapByName(name) {
      if (name) {
        switch (name) {
          case "Map of France regions":
            return FranceRegions;
          case "Map of World":
            return World;
          case "Map of France departments":
            return FranceDep;
          default:
            throw new Error("Map not found");
        }
      }
      throw new Error("Map name not defined");
    },
    /**
     * Enable a timer to end the current quizz question
     * at the end of this timer, the "correction menu" is shown
     * @param {Number} time the number of seconds to do the question
     */
    enableTimer(time) {
      this.timeRemaining = time;
      var timerId = setInterval(() => {
        if (this.timeRemaining > 0) {
          this.timeRemaining--;
        } else {
          clearInterval(timerId);
          this.showEndQuestionMenu(this.currentQuestion.id_question);
        }
      }, 1000);
    },
    /**
     * Close the "correction menu" and start a new question
     * @param {boolean} autoFinish If set to true, automatically redirects the player to the scoreboard page if there are no questions left
     */
    nextQuestion(autoFinish = true) {
      if (this.quizzLoaded) {
        if (this.questionIndex < this.quiz.questions.length - 1) {
          this.nextButtonVisible = false;
          this.selectedLocation = null;
          this.questionIndex++;
          if(this.questionIndex === this.quiz.questions.length - 1) {
            this.nextButtonText = "Finish"
          }
          this.removeHighlighting();
          if (this.settings.noHoverAfterQuestion) {
            this.setMapHoverEffect(true);
          }
          this.enableTimer(this.quiz.questions[this.questionIndex].duration);
        } else if(autoFinish){
          // Quizz finished
          this.$router.push({
            name: "result",
            params: {
              score: this.score,
              maxScore: this.maxScore,
            },
          });
        }
      }
    },
    /**
     * Load the input quizz json & start the game
     * @param {JSON} question_id The question to be evaluated, and corrected
     */
    async showEndQuestionMenu(question_id) {
      await this.$axios
        .request({
          method: "get",
          url: "/api/questions/response/" + question_id
        })
        .then((response) => {
          this.question = response.data
        })
        .catch((error) => {
          this.showSnackbar("Error while downloading response", "error");
          console.log(error);
        });
      // Show on the map the correct location
      if (this.selectedLocation !== this.question[0].response_location_id) {
        this.highlightMapRegion(this.quizzMap, this.question[0].response_location_id, "red");
      } else {
        this.highlightMapRegion(this.quizzMap, this.question[0].response_location_id, "green");
        // Increment score if user choice is valid
        this.score++;
      }
      this.selectedLocation = null;
      if (this.settings.noHoverAfterQuestion) {
        this.setMapHoverEffect(false);
      }
      // Show the button "Next question"
      this.nextButtonVisible = true;
    },
    /**
     * Load the input quizz json & start the game
     * @param {JSON} quiz The quizz to be loaded
     */
    loadQuizz(quiz) {
      try {
        this.loadText = "Loading Map";
        this.playerList = this.getPlayerList();
        this.quizzMap = this.getMapByName(quiz.mapid);
        this.maxScore = quiz.questions.length;
        this.score = 0;
        this.questionIndex = 0;
        this.enableTimer(quiz.questions[0].duration);
        this.quizzLoaded = true;
      } catch (e) {
        this.loadText = e.message;
        this.circularColor = "red";
      }
    },
  },
  async mounted () {
    if (this.$route.params.id_quiz) {
      await this.$axios
        .request({
          method: "get",
          url: "/api/quizzes/" + this.$route.params.id_quiz,
        })
        .then((response) => {
          this.quiz = response.data
          this.loadQuizz(this.quiz);
        })
        .catch((error) => {
          this.showSnackbar("Error while downloading quiz", "error");
          console.log(error);
        });
     
    } else {
      // Circular loading
      console.error("Error when loading quizz (not found)");
      this.loadText = "No input Quizz";
      this.circularColor = "red";
    }
  },
};
</script>
<style src="./css/mapStyles.css"></style>