<template>
  <v-container>
    <div>
      <h1>Quizz finished</h1>
      <v-card max-width="500px">
        <v-row  class="d-flex align-end mb-6">
          <v-col align="center" class="ma-2">
            <v-card height="100px" color="blue darken-3">
              a
            </v-card>
          </v-col>
          <v-col align="center" class="ma-2">
            <v-card height="160px" color="blue darken-1" class="d-flex align-center">
              NOM SCORE
            </v-card>
          </v-col>
          <v-col align="center" class="ma-2">
            <v-card height="70px" color="blue darken-4">
              a
            </v-card>
          </v-col>
        </v-row>
      </v-card>
      <h2>Details</h2>
      <v-card max-width="500px">
        <!-- <template>
          <v-data-table
            :headers="headers"
            :items="desserts"
            :items-per-page="5"
            class="elevation-1" >
            
          </v-data-table>
        </template> -->
        <v-simple-table>
                  <thead>
                    <tr>
                      <th class="text-left">
                        Name
                      </th>
                      <th class="text-left">
                        Score
                      </th>
                      <th class="text-left">
                        %
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="score in scores" :key="score.id_score">
                      <td>
                        {{score.username}}
                      </td>
                      <td>
                        {{score.score_value}}
                      </td>
                      <td>
                        {{score.score_value/5*100}}
                      </td>
                    </tr>
                  </tbody>
      </v-simple-table>
      </v-card>
    </div>
  </v-container>
</template>
<script>
export default {
  middleware: "auth",
  data() {
    return {
      scores: undefined,
    };
  },
  async mounted() {
    await this.$axios.get("/api/quizzes/"+ 1 +"/scores").then((res) => {
      this.scores = res.data    
      console.log(this.scores) 
    })
  }
}
</script>