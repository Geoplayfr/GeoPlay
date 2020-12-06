<template>
  <v-list>
    <v-list-item-avatar class="mx-3">
      <v-icon dark>mdi-account-circle</v-icon>
    </v-list-item-avatar>
    <v-list-item-avatar v-for="p in playerList" :key="p.username">
      <v-icon dark>mdi-account-circle</v-icon>
    </v-list-item-avatar>
  </v-list>
</template>
<script>
export default {
  props: {
    playerList: {
      required: true,
    },
  },
  data() {
    return {};
  },
  mounted() {
  }
};
</script>