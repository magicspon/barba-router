import '@/plugins/logger'
import Router from '@/core/Router'
import routes from '@/views'

if (module.hot) {
	module.hot.accept()
}

new Router({
	routes,
	onChange: [],
	onReady: [],
	onComplete: [],
	navigation: ['header > ul', 'footer > ul'],
	activeClass: 'is-current',
	activeParentClass: 'is-current-child'
}).start()
