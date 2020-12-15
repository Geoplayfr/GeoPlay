<template>
  <v-app color="primary" dark>
    <v-app-bar
      :clipped-left="clipped"
      fixed
      app
    >
      <v-toolbar-title v-text="title" />
      <v-spacer />
    </v-app-bar>
    <v-main>
      <v-container>
        <nuxt />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
export default {
  middleware: 'disconnect',
  data () {
    return {
      clipped: false,
      fixed: false,
      right: true,
      title: 'Welcome'
    }
  }
}
</script>
