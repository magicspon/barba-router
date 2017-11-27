import {
	flattenRoutes,
	routePattern,
	tryFn,
	explodeSegments,
	numSegments
} from './utils'
import { Pjax, Dispatcher, BaseTransition, Prefetch } from 'barba.js'

export default class Router {
	constructor({
		routes,
		navigation,
		activeClass = 'is-current',
		activeParentClass = 'is-current-parent',
		prefetch = true,
		onChange = [],
		onReady = [],
		triggerOnLoad = false,
		onComplete = []
	}) {
		this.routes = flattenRoutes(routes)
		this.onChangeEvents = onChange
		this.onReadyEvents = onReady
		this.triggerOnLoad = onReady
		this.onCompleteEvents = onComplete
		this.currentRoute = this._match(window.location.pathname)
		this.linkClicked = false
		this.navigation = navigation.reduce((acc, selector) => {
			return [...acc, ...document.querySelectorAll(`${selector} a`)]
		}, [])
		this.activeClass = activeClass
		this.activeParentClass = activeParentClass
		this.prefetch = prefetch
	}

	start = () => {
		const _this = this
		Dispatcher.on('linkClicked', this.barbaLinkClicked)
		Dispatcher.on('initStateChange', this.barbaStateChange)
		Dispatcher.on('newPageReady', this.barbaNewPageReady)
		Dispatcher.on('transitionCompleted', this.barbaTransitionCompleted)

		Pjax.getTransition = function() {
			return BaseTransition.extend({
				start() {
					Promise.all([this.newContainerLoading, this.pageExit()]).then(
						this.pageEnter.bind(this)
					)
				},

				params() {
					return {
						from: {
							path: _this.currentRoute.path,
							params: _this.currentRoute.matches,
							container: this.oldContainer
						},
						to: {
							path: _this.match.path,
							params: _this.match.params,
							container: this.newContainer
						}
					}
				},

				pageExit() {
					return new Promise(resolve => {
						const { from, to } = this.params()
						_this.currentRoute.view.onLeave({
							from,
							to,
							next: () => {
								Promise.resolve(resolve()).then(() => {
									tryFn(_this.currentRoute.view.onAfterLeave)({
										from,
										to
									})
								})
							}
						})
					})
				},

				pageEnter() {
					const { from, to } = this.params()
					_this.match.view.onEnter({
						from,
						to,
						next: cb => {
							this.done(cb)
						}
					})
				},

				done() {
					const { from, to } = this.params()
					_this.currentRoute = _this._match(window.location.pathname)
					_this.linkClicked = false
					this.oldContainer.parentNode.removeChild(this.oldContainer)
					this.newContainer.style.visibility = 'visible'

					Promise.resolve(this.deferred.resolve()).then(() => {
						tryFn(_this.match.view.onAfterEnter)({
							from,
							to
						})
					})
				}
			})
		}

		Pjax.start()
		this.prefetch && Prefetch.init()
	}

	_match = url => {
		let match = this.routes.filter(
			({ path }) =>
				routePattern(path)(url) && numSegments(url) === numSegments(path)
		)

		log(match)

		if (match.length) {
			match = match.reduce(
				(acc, curr) => (curr.path.length > acc.path.length ? curr : acc)
			)
		} else {
			match = this.routes.find(({ path }) => path === '*')
		}

		const { path } = match

		if (url !== '/' && path === '/') {
			match = this.routes.find(({ path }) => path === '*')
		}

		const params = routePattern(match.path)(url)
		return {
			...match,
			request: url,
			params
		}
	}

	barbaLinkClicked = el => {
		const url = el.pathname
		this.linkClicked = true
		this.match = this._match(url)
	}

	barbaStateChange = currentStatus => {
		if (!this.linkClicked) {
			this.match = this._match(window.location.pathname)
		}

		if (this.triggerOnLoad) {
			this.triggerOnLoad = false
			const { match, currentRoute } = this
			new Promise(resolve => {
				this.match.view
					.onEnter({
						from: currentRoute,
						to: match,
						next: resolve
					})
					.then(() => {
						tryFn(this.match.view.onAfterEnter)({
							from: currentRoute,
							to: match
						})
					})
			})
		}

		this.onChangeEvents.forEach(fn => {
			tryFn(fn)({
				currentStatus,
				from: this.currentRoute,
				to: this.match
			})
		})
	}

	barbaNewPageReady = (
		currentStatus,
		prevStatus,
		HTMLElementContainer,
		newPageRawHTML
	) => {
		const url = window.location.pathname
		const segments = explodeSegments(url)

		this.onReadyEvents.forEach(fn => {
			tryFn(fn)({
				currentStatus,
				prevStatus,
				HTMLElementContainer,
				newPageRawHTML,
				from: this.currentRoute,
				to: this.match
			})
		})

		this.navigation
			.filter($anchor => {
				let { pathname } = $anchor
				const length = pathname.length - 1
				if (pathname.length > 1 && pathname.charAt(length) === '/') {
					pathname = pathname.substring(0, length)
				}
				$anchor.classList.remove(this.activeClass, this.activeParentClass)
				return segments.find(segment => segment === pathname)
			})
			.map($anchor => {
				const className =
					$anchor.pathname === url ? this.activeClass : this.activeParentClass
				$anchor.classList.add(className)
			})
	}

	barbaTransitionCompleted = (currentStatus, prevStatus) => {
		this.onCompleteEvents.forEach(fn => {
			tryFn(fn)({
				currentStatus,
				prevStatus,
				from: this.currentRoute,
				to: this.match
			})
		})
	}
}