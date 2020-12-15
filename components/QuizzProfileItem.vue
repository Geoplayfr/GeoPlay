<template>
  <div>
    <v-card fluid>
      <v-row>
        <v-col cols="10">
          <v-row>
            <v-col>
              <v-text-field
                v-model="title"
                class="ma-4"
              />
            </v-col>
            <v-col>
              <v-tooltip
                v-if="toSave"
                right
              >
                Save new name
                <template #activator="{ on }">
                  <v-icon
                    class="mt-9"
                    color="primary"
                    v-on="on"
                    @click="renameAction"
                  >
                    mdi-check-bold
                  </v-icon>
                </template>
              </v-tooltip>
            </v-col>
          </v-row>
          <v-card-text
            class="pt-0 pb-0"
          >
            Description: {{ quizz.description }}
          </v-card-text>
          <v-row>
            <v-col>
              <v-card-text
                class="pb-0"
              >
                Difficulty: {{ quizz.difficulty }}
              </v-card-text>
            </v-col>
            <v-col>
              <v-card-text
                class="pb-0"
              >
                Duration : {{ quizz.duration }} sec
              </v-card-text>
            </v-col>

            <v-col>
              <v-card-text
                class="pb-0"
              >
                {{ quizz.nb_questions }} questions
              </v-card-text>
            </v-col>
          </v-row>
        </v-col>
        <v-col class="d-flex align-end flex-column">
          <v-btn
            class="ma-2"
            @click="deleteAction"
          >
            <v-icon
              color="primary"
              class="mr-3"
              @click="deleteAction"
            >
              mdi-delete
            </v-icon>
            Delete
          </v-btn>
        </v-col>
      </v-row>
    </v-card>
  </div>
</template>
<script>
export default {
  props: {
    quizz: {
      required: true,
      type: Object
    }
  },
  data () {
    return {
      title: this.quizz.name,
      toSave: false
    }
  },
  watch: {
    title: function (val) {
      this.toSave = true
    }
  },
  methods: {
    renameAction () {
      this.$emit('qpi-rename-action', {
        newText: this.title,
        id_quiz: this.quizz.id_quiz
      })
      this.toSave = false
    },
    deleteAction () {
      this.$emit('qpi-delete-action', this.quizz.id_quiz)
    }
  }
}

</script>
