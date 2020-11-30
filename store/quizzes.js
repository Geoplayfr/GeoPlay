const state = () => ({
    quizzes: [],
    quiz: undefined, 
    id: 0
  })
  
  const getters = {
  }
  
  const mutations = {
      addQuizzes (state, quiz) {
          const curr = state.quizzes.find(q => q.id_quiz === quiz.id_quiz)
          if (!curr) {
              state.quizzes.push(quiz)
          } else {
                curr.quiz_name = quiz.quiz_name
                curr.description = quiz.description
                curr.map_id = quiz.map_id
                curr.difficulty = quiz.difficulty
                curr.duration = quiz.duration
                curr.id_user = quiz.id_user
                curr.nb_questions = quiz.nb_questions
            }
        },
        addQuiz(state, q) {
            state.quiz = q
        }
    }
  const actions = {
      async fetchAllQuizzes () {
          const quizzes = await this.$axios.$get('/api/quizzes/all')
          quizzes.forEach(q => mutations.addQuizzes(this.state.quizzes, q))
      },
      async fetchQuiz ({}, { id }) {
        const quiz = await this.$axios.$get('/api/quizzes/' + id)
        mutations.addQuiz(this.state.quizzes, quiz)
      }
  }
  
  export default {
    state,
    getters,
    mutations,
    actions
  }