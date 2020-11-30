<template>
  <div id="app">
    <v-list-item-content v-for="quizz in quizzes" :key="quizz.id">
      <quizz-item
        v-if="quizz.questions.length >= 5"
        :quizz="quizz"
      />
    </v-list-item-content>
  </div>
</template>
<script>
import QuizzItem from "../components/QuizzItem.vue";
import { mapState, mapActions } from 'vuex'
export default {
  layout: "default",
  middleware: "auth",
  components: {
    QuizzItem,
  },
  data() {
    return {
      }
  },
  computed: {
    ...mapState('quizzes', ['quizzes'])
  },
  async created () {
    await this.fetchAllQuizzes()
  },
  methods: {
    ...mapActions('quizzes', ['fetchAllQuizzes'])
  }
}
</script>