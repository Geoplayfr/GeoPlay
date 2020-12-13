<template>
  <v-row justify="center" align="center">
    <v-col cols="12" sm="10" md="10">
      <div v-if="quizzLoaded && playerList" class="text-left">
        Welcome {{ $store.getters["users/user"].username }}
      </div>
      <div v-if="quizzLoaded" class="text-right">
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
          {{ loadText }}</v-progress-circular
        >
        <v-row>
          <v-col xs="12">
            <v-card class="pa-4" v-if="quizzLoaded" elevation="10">
              <div class="my-2">Q{{ questionIndex + 1 }}</div>
              <div class="my-2">{{ currentQuestion.question_tag }}</div>
              <v-btn to="/homepage">Quit</v-btn>
              <v-btn
                v-show="nextButtonVisible"
                :disabled="!nextButtonVisible"
                color="accent"
                @click="askNextQuestion()"
                >{{ this.nextButtonText }}</v-btn
              >
              <v-spacer></v-spacer>
              <!-- For aligning the score the to right -->
              <div class="mt-5">Current score {{ score }} / {{ maxScore }}</div>
            </v-card>
            <player-list :playerList="playerList" />
          </v-col>
          <v-col :cols="mapSize" xs="12">
            <radio-svg-map
              id="map"
              :location-class="mapStyle"
              v-if="quizzLoaded"
              :map="quizzMap"
              v-model="selectedLocation"
              @click="onMapRegionClicked"
            />
          </v-col>
        </v-row>
      </div>
    </v-col>
  </v-row>
</template>
<script>
import { RadioSvgMap } from "vue-svg-map";
import FranceRegions from "@svg-maps/france.regions";
import World from "@svg-maps/world";
import FranceDep from "@svg-maps/france.departments";
import PlayerList from "../components/PlayerList.vue";
import socket from "~/plugins/socket.io.js";
export default {
  head() {
    return {
      script: [{ src: "/svg-pan-zoom.min.js" }],
    };
  },
  layout: "game",
  name: "game",
  middleware: "auth",
  // middleware: "game",
  components: {
    RadioSvgMap,
  },
  data() {
    PlayerList;
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
      room: 0,
      maxScore: 999,
      timeRemaining: -1,
      mapStyle: "",
      mapSize: 8,
      currentQuestion: null,
      greenMapStyle:
        'green green-svg-map__location green-svg-map__location:focus green-svg-map__location:hover green-svg-map__location[aria-checked="true"]',
      redMapStyle:
        'red red-svg-map__location red-svg-map__location:focus red-svg-map__location:hover red-svg-map__location[aria-checked="true"]',
      playerList: [],
      highlightedRegions: null,
      cacheRegionClassList: null,
      nextButtonVisible: false,
      nextButtonText: "Next question",
      goToResultPageText: "Finish",
      zoomEnabled: false,
      settings: {
        noHoverAfterQuestion: true,
        noClickAfterQuestion: false,
      },
    };
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
        return [
          { username: "Guest", score: 0, id: 0 },
          { username: "François", score: 0, id: 1 },
          { username: "Marine", score: 1, id: 2 },
          { username: "Guest", score: 0, id: 3 },
          { username: "François", score: 0, id: 4 },
          { username: "Marine", score: 8, id: 5 },
        ];
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
      let mapHtml = document.getElementById("map");
      let regionToColor = null;
      // Loading with the svg-pan plugin see https://github.com/ariutta/svg-pan-zoom
      if (
        mapHtml.children.length == 1 &&
        mapHtml.children[0].className.baseVal === "svg-pan-zoom_viewport"
      ) {
        regionToColor = mapHtml.children[0].children.namedItem(regionId);
      } else {
        regionToColor = mapHtml.children.namedItem(regionId);
      }
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
            this.mapSize = 6;
            return FranceRegions;
          case "Map of World":
            this.mapSize = 10; // World map is extremely big, we can make it take more screen space
            this.zoomEnabled = true;
            return World;
          case "Map of France departments":
            this.mapSize = 6;
            return FranceDep;
          default:
            throw new Error("Map not found");
        }
      }
      throw new Error("Map name not defined");
    },
    /**
     * Local timer, that displays the time you have to answer the question, the server will by itself send the correction
     */
    enableRemainingSecondsTimer(timeInSeconds) {
      this.timeRemaining = timeInSeconds;
      var timerId = setTimeout(() => {
        if (this.timeRemaining > 0) {
          this.timeRemaining--;
        } else {
          clearInterval(timerId);
        }
      }, 1000);
    },
    askNextQuestion() {
      // Do nothing, feature not implemented yet
      console.log("Not implemented yet");
    },
    /**
     * Authorize the player to play the current question
     * */
    showCurQuestionMenu(serverData) {
      this.loadQuizz = false;
      this.nextButtonVisible = false;
      this.selectedLocation = null;
      this.questionIndex = serverData.questionIndex;
      if (this.quiz.questions < this.quiz.nb_questions) {
        this.nextButtonText = this.goToResultPageText;
      }
      this.removeHighlighting();
      if (this.settings.noHoverAfterQuestion) {
        this.setMapHoverEffect(true);
      }
      this.enableRemainingSecondsTimer(serverData.remainingSeconds);

      // TO MOVE TO SERVER
      //this.enableTimer(this.quiz.questions[this.questionIndex].duration);
    },
    /**
     * serverData : response_location_id + score
     * @param {JSON} serverData The data from the server
     */
    async showEndQuestionMenu(serverData) {
      /*
      await this.$axios
        .request({
          method: "get",
          url: "/api/questions/response/" + question_id,
        })
        .then((response) => {
          this.question = response.data;
        })
        .catch((error) => {
          console.log("Error while downloading response", "error");
          console.log(error);
        });
        */
      // Show on the map the correct location
      if (this.selectedLocation !== serverData.response_location_id) {
        this.highlightMapRegion(
          this.quizzMap,
          serverData.response_location_id,
          "red"
        );
      } else {
        this.highlightMapRegion(
          this.quizzMap,
          serverData.response_location_id,
          "green"
        );
        // Increment score if user choice is valid
        this.score = serverData.score;
      }
      this.selectedLocation = null;
      if (this.settings.noHoverAfterQuestion) {
        this.setMapHoverEffect(false);
      }
      // Show the button "Next question"
      this.nextButtonVisible = true;
    },
    setupSocketIO() {
      console.log("Loading socket io");

      /**
       * Check data before using it in the handlers
       */
      function c(data) {
        if (typeof data !== "object")
          throw new TypeError(
            "Every data exchanged for the geoplay game session should be in JSON, data obtained is " +
              data
          );
        else return data;
      }

      socket.on("GameStateReceived", (serverData) => {
        // OK ?
        console.log("GameStateReceived Received message from server : ", data);
        const state = c(data).state;
        switch (state) {
          case "STOPPED": // OK
            // Quizz finished (arrived too late / bug)
            this.$router.push({
              name: "result",
              params: {
                score: serverData.score,
                maxScore: serverData.maxScore,
                quizId: this.$route.params.id_quiz,
              },
            });
            break;
          case "WAITING": // OK
            this.quizzLoaded = false;
            this.loadQuizz = true;
            this.loadText = "Waiting for players";
            const playerInfo = this.$store.getters["users/user"]; // Contains id_user && username
            socket.emit(
              "CanStartGame",
              {
                player: playerInfo,
              },
              // Execute callback for indicating if registration is successful
              (data) => {
                if (typeof data === "string") {
                  console.error(data);
                  throw new Error(data);
                }
              }
            );
            // TO DO LATER
            break;
          case "PLAYING": // OK
            this.showCurQuestionMenu(c(data.playing_data));
            break;
          case "CORRECTING": // OK
            const playerAnswer = {
              player: playerInfo,
              answer: this.selectedLocation,
            };
            if (this.selectedLocation !== null) {
              socket.emit(playerAnswer);
            }
            this.showEndQuestionMenu(c(data.correcting_data));
            break;
          default:
            throw new Error("Unknown game state" + state);
        }
      });

      // Future update Ping system
      // socket.on("PingReceived", (data) => socket.emit('PlayerStillConnected', $store.getters["users/user"].id))

      // Can be updated dynamically (the results can appear as the you are watching the correction)
      socket.on("CurQuestionResultsReceived", (data) => {
        // OK
        console.log(
          "CurQuestionResultsReceived Received message from server : ",
          data
        );
        this.showCurQuestionResults(c(data));
      });

      socket.on("CurQuestionReceived", (data) => {
        // OK
        console.log(
          "CurQuestionReceived Received message from server : ",
          data
        );
        this.currentQuestion = c(data);
      });

      socket.on("UpdatePlayers", (data) => {
        //OK
        console.log("UpdatePlayers Received message from server : ", data);
        this.playerList = c(data);
        console.log("updated players");
      });
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
        this.setupSocketIO();
        this.quizzLoaded = true;
        console.log("Requesting game state...")
        // Entry point for network game
        socket.emit("RequestGameState", {
          username: this.$store.getters["users/user"].username,
          id: this.$store.getters["users/user"].id,
          id_quiz: this.$route.params.id_quiz,
          room: this.room,
        });
      } catch (e) {
        this.loadText = e.message;
        this.circularColor = "red";
      }
    },
  },
  async mounted() {
    this.$route.params.id_quiz = 8;
    this.room = 0; // Is pushed to the server
    await this.$axios
      .request({
        method: "get",
        url: "/api/quizzes/" + this.$route.params.id_quiz,
      })
      .then((response) => {
        this.quiz = response.data;
        this.loadQuizz(this.quiz);
        if (this.zoomEnabled) {
          setTimeout(() => {
            let zoomPlugin = svgPanZoom("#map");
            document.getElementById("map").style = "height:700px;width:100%";
          }, 1000);
        }
      })
      .catch((error) => {
        console.log("Error while downloading quiz");
        this.circularColor = "red";
        if (error.response && error.response.status === 404) {
          this.loadText = "Quiz was not found in the database";
        } else {
          this.loadText = error;
        }
      });
  },
};
</script>
<style src="./css/mapStyles.css"></style>