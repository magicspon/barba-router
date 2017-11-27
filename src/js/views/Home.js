export const Home = {
	onEnter({ from, to, next }) {
		document.body.style.backgroundColor = '#4ae'
		log('onEnter:homePage')
		next()
	},

	onAfterEnter({ from, to }) {
		// log('onAfterEnter:homePage')
	},

	onLeave({ from, to, next }) {
		// log('onLeave:homePage')
		next()
	},

	onAfterLeave({ from, to }) {
		// log('onAfterLeave:homePage')
	}
}
