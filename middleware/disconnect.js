// Any page with this middleware will automatically disconnect users
export default function (ctx) {
	ctx.app.store.commit('users/disconnect')
}