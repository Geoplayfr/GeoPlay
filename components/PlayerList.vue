<template fluid>
  <v-list>
    <v-badge
      color="error"
      :content="p.score"
      :value="p.score"
      overlap
      v-for="p in sortedPlayers"
      offset-x="30"
      offset-y="20"
      :key="p.id"
    >
      <v-list-item-avatar color="success">
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <span v-on="on" class="white--text headline">{{
              showInitials(p.username)
            }}</span>
          </template>
          <span>{{p.username}}</span>
        </v-tooltip>
      </v-list-item-avatar>
    </v-badge>
  </v-list>
</template>
<script>
export default {
  props: {
    playerList: {
      required: true,
    },
    autoSort: true
  },
  methods: {
    showInitials(originalName) {
      if (originalName.length >= 2) {
        return originalName.substring(0, 2).toUpperCase();
      }
      return originalName.toUpperCase();
    }
  },
  computed: {
    sortedPlayers(){
       return this.playerList.sort( (a,b) => b.score - a.score)
     }
  },
  data() {
    return {};
  },
  mounted() {
    setTimeout(()=> {
      this.playerList[this.playerList.length-1].score+=200
    },
    2000)
  }
};
</script>