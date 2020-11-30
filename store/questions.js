const state = () => ({
    question: undefined, 
  })
  
  const getters = {
  }
  
  const mutations = {
        addQuestion(state, q) {
            state.question = q
        }
    }
  const actions = {
      async fetchResponse ({}, { id }) {
        const question = await this.$axios.$get('/api/questions/response/' + id)
        mutations.addQuestion(this.state.questions, question)
      }
  }
  
  export default {
    state,
    getters,
    mutations,
    actions
  }