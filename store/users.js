export const state = () => ({
	authenticated: false,
	user: null
})
  
export const mutations = {
	connect (state, user) {
		state.authenticated = true
		state.user = user
		sessionStorage.setItem('user', JSON.stringify(state.user))
		sessionStorage.setItem('authenticated', JSON.stringify(state.authenticated))
	},
	disconnect (state) {
		state.authenticated = false
		state.user = null
		sessionStorage.setItem('user', JSON.stringify(state.user))
		sessionStorage.setItem('authenticated', JSON.stringify(state.authenticated))
	},
}

export const getters = {
	user: state => state.user,
	authenticated: state => state.authenticated
}