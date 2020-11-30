export default function (ctx) {
	updateData(ctx.app)
	if(!isAuth()) {
		ctx.redirect('/login')
	}
}

function isAuth() {
	return JSON.parse(sessionStorage.getItem('authenticated'))
}

function updateData(app){
	if(isAuth(app)){
		app.store.commit('users/connect', JSON.parse(sessionStorage.getItem('user')))
	}
}