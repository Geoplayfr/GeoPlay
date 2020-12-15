<template fluid>
  <v-list>
    <div v-if="playerList.length > 0">
      <v-badge
        v-for="p in sortedPlayers"
        :key="p.id"
        color="error"
        :content="p.score"
        :value="p.score"
        overlap
        offset-x="30"
        offset-y="20"
      >
        <v-list-item-avatar color="success">
          <v-tooltip bottom>
            <template #activator="{ on }">
              <span
                class="white--text headline"
                v-on="on"
              >{{
                showInitials(p.username)
              }}</span>
            </template>
            <span>{{ p.username }}</span>
          </v-tooltip>
        </v-list-item-avatar>
      </v-badge>
    </div>
    <div v-else>
      No players were detected
    </div>
  </v-list>
</template>
<script>
export default {
  props: {
    // eslint-disable-next-line vue/require-prop-types
    playerList: {
      required: true
    },
    // eslint-disable-next-line vue/require-prop-type-constructor
    autoSort: true
  },
  data () {
    return {}
  },
  computed: {
    sortedPlayers () {
      if (this.playerList.length > 0) {
        return this.playerList.sort((a, b) => b.score - a.score)
      }
      return this.playerList
    }
  },
  mounted () {
  },
  methods: {
    showInitials (originalName) {
      if (originalName.length >= 2) {
        return originalName.substring(0, 2).toUpperCase()
      }
      return originalName.toUpperCase()
    }
  }
}
</script>
