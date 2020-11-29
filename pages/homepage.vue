<template>
  <div id="app">
    <v-list-item-content v-for="quizz in quizzes" :key="quizz.id">
      <quizz-item
        :quizz="quizz"
      />
    </v-list-item-content>
  </div>
</template>
<script>
import QuizzItem from "../components/QuizzItem.vue";
export default {
  layout: "default",
  components: {
    QuizzItem,
  },
  data() {
    return {
      errorMsg: "",
      snackbar: false,
      username: "",
      password: "",
      show1: false,
      valid: false,
      title: "Hello word!",
      quizzes: [
        {
          id: 1,
          name: "This is a tittle",
          mapid: 1,
          description: "This is an exemple of a short description",
          difficulty: "easy",
          duration: 10,
          creator: "Franck94",
          nbQuestion: 3,
        },  
        {
          id: 2,
          name: "This is a tittle",
          mapid: 1,
          description: "This is an exemple of a long long description, just to test how much pqzipegêqoirgn$aeriongôzerign^zseiorgnôrinegmirengmseijrgnerjm",
          difficulty: "easy",
          duration: 10,
          creator: "Franck94",
          nbQuestion: 3,
        },
         {
          id: 1,
          name: "This is a tittle",
          mapid: 1,
          difficulty: "easy",
          duration: 10,
          creator: "Franck94",
          nbQuestion: 3,
        },  
        {
          id: 2,
          name: "This is a tittle",
          mapid: 1,
          difficulty: "easy",
          duration: 10,
          creator: "Franck94",
          nbQuestion: 3,
        },
         {
          id: 1,
          name: "This is a tittle",
          mapid: 1,
          difficulty: "easy",
          duration: 10,
          creator: "Franck94",
          nbQuestion: 3,
        },  
        {
          id: 2,
          name: "This is a tittle",
          mapid: 1,
          difficulty: "easy",
          duration: 10,
          creator: "Franck94",
          nbQuestion: 3,
        }
      ],
    };
  },
};
</script>