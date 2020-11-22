export default function (ctx) {
	updateData(ctx.app)
	if(!isAuth(ctx.app)) {
		ctx.redirect('/login')
	}
}

function isAuth(app) {
	return JSON.parse(sessionStorage.getItem('authenticated'))
}

function updateData(app){
	if(isAuth(app)){
		app.store.commit('users/connect', JSON.parse(sessionStorage.getItem('user')))
	}
}