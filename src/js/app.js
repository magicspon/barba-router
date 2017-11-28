import '@/plugins/logger'
import Router from '@/core/Router'
import routes from '@/views'

if (module.hot) {
	module.hot.accept()
}

const $debug = document.getElementById('debug')

new Router({
	routes,
	triggerOnLoad: true,
	onChange: [
		({ from, to }) => {
			$debug.innerHTML = JSON.stringify({ from, to }, null, 2)
		}
	],
	onReady: [],
	onComplete: [],
	navigation: ['header > ul', 'footer > ul'],
	activeClass: 'is-current',
	activeParentClass: 'is-current-child'
}).start()
