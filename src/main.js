import { flattenRoutes, findRoute, navLinks } from './utils/router.utils'
import Barba from 'barba.js'

export { Barba, Pjax }

const { Pjax, Dispatcher, BaseTransition, Prefetch } = Barba

export const Route = superclass =>
	class extends superclass {
		history() {
			Dispatcher.on('initStateChange', this.onChange)
			Dispatcher.on('newPageReady', this.onReady)
			Dispatcher.on('transitionCompleted', this.onComplete)

			this.startingRoute = parseUrl(window.location.href)
		}

		clearHistory() {
			Dispatcher.off('initStateChange', this.onChange)
			Dispatcher.off('newPageReady', this.onReady)
			Dispatcher.off('transitionCompleted', this.onComplete)
		}

		onChange = () => {}
		onReady = () => {}
		onComplete = () => {}
	}

export default class Router {
	constructor({
		routes,
		onChange = [],
		onReady = [],
		onComplete = [],
		navigation = ['body'],
		transitionOnLoad = true,
		currentClass,
		currentParentClass
	}) {
		this.routes = flattenRoutes(routes)
		this.findRoute = findRoute(this.routes)
		this.navLinks = navLinks(navigation, { currentClass, currentParentClass })

		this.playOnLoad = transitionOnLoad
		this.onChange = onChange
		this.onReady = onReady
		this.onComplete = onComplete
		this.$wrapper = document.getElementById('barba-wrapper')
	}

	syncEvents = () => {
		Dispatcher.on('linkClicked', this.routeRequest)
		Dispatcher.on('initStateChange', this.routeChange)
		Dispatcher.on('newPageReady', this.routeReady)
		Dispatcher.on('transitionCompleted', this.routeComplete)
	}

	linkClicked = true

	matchRoute = href => {
		this.history.previous = this.history.current
		this.history.current = this.findRoute(href)
	}

	history = {
		previous: null,
		current: null
	}

	routeRequest = el => {
		const { href } = el
		this.linkClicked = true
		this.matchRoute(href)
	}

	getData = () => {
		const { current: { data, route } } = this.history

		const from = this.history.previous
			? {
				...this.history.previous.data,
				name: this.history.previous.route.name
			}
			: null

		return { from, to: { ...data, name: route.name } }
	}

	routeChange = () => {
		if (!this.linkClicked) {
			this.matchRoute(window.location.href)
		}
		const { from, to } = this.getData()

		if (this.playOnLoad) {
			this.playOnLoad = false
			const { route: { view } } = this.history.current
			view.onEnter({
				from: null,
				to: {
					...to,
					container: Pjax.Dom.getContainer()
				},
				wrapper: this.$wrapper,
				next: () => {}
			})
		}

		this.onChange.forEach(fn => fn({ from, to }))
	}

	routeReady = (
		currentStatus,
		prevStatus,
		HTMLElementContainer,
		newPageRawHTML
	) => {
		const { from, to } = this.getData()

		this.onReady.forEach(fn =>
			fn({
				from,
				to,
				currentStatus,
				prevStatus,
				HTMLElementContainer,
				newPageRawHTML
			})
		)
	}

	routeComplete = () => {
		this.linkClicked = false

		const { from, to } = this.getData()

		this.navLinks(to.source)

		this.onComplete.forEach(fn =>
			fn({
				from,
				to
			})
		)
	}

	transitionManager = () => {
		const _this = this

		Pjax.getTransition = function() {
			return BaseTransition.extend({
				start() {
					Promise.all([this.newContainerLoading, this.pageExit()]).then(
						this.pageEnter.bind(this)
					)
				},

				pageExit() {
					return new Promise(resolve => {
						const { route: { view } } = _this.history.previous
						const { from, to } = _this.getData()
						view.onLeave({
							from: { ...from, container: this.oldContainer },
							to: { ...to, container: this.newContainer },
							wrapper: _this.$wrapper,
							next: resolve
						})
					})
				},

				pageEnter() {
					const { route: { view } } = _this.history.current
					const { from, to } = _this.getData()
					view.onEnter({
						from: { ...from, container: this.oldContainer },
						to: { ...to, container: this.newContainer },
						wrapper: _this.$wrapper,
						next: this.done.bind(this)
					})
				},

				done(cb) {
					this.oldContainer.parentNode.removeChild(this.oldContainer)
					this.newContainer.style.visibility = 'visible'

					Promise.resolve(this.deferred.resolve()).then(cb)
				}
			})
		}
	}

	start = () => {
		this.history.current = this.findRoute(window.location.href)

		this.transitionManager()
		this.syncEvents()

		Pjax.start()
		Prefetch.init()
	}
}
