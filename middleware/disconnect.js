export default function (ctx) {
	ctx.app.store.commit('users/disconnect')
}