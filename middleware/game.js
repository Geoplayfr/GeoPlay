import socket from '~/plugins/socket.io.js'
export default function (ctx) {
  updateData(ctx.app)
  if (!isAuth()) {
    ctx.redirect('/login')
  } else {
    // Auto quit current online game
    if (ctx.route.previous === 'game_multi') {
      socket.emit('QuitGame', ctx.app.store.getters['users/user'])
    }
    // Only load the game pages if the passed params are recognized
    switch (ctx.route.name) {
      case 'game':
        if (!canLoadQuiz(ctx)) {
          ctx.redirect('/homepage')
        }
        break
      case 'result':
        if (!canLoadResults(ctx)) {
          ctx.redirect('/homepage')
        }
        break
    }
  }
}

function canLoadQuiz (ctx) {
  return ctx.route.params.hasOwnProperty('id_quiz') && typeof ctx.route.params.id_quiz === 'number'
}

function canLoadResults (ctx) {
  return ctx.route.params.hasOwnProperty('score') && typeof ctx.route.params.score === 'number' && ctx.route.params.hasOwnProperty('maxScore') && typeof ctx.route.params.maxScore === 'number'
}

function canLoadResultsMulti (ctx) {
  return ctx.route.params.hasOwnProperty('game')
}

function isAuth () {
  return JSON.parse(sessionStorage.getItem('authenticated'))
}

function updateData (app) {
  if (isAuth(app)) {
    app.store.commit('users/connect', JSON.parse(sessionStorage.getItem('user')))
  }
}
