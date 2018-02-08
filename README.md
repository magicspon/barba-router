http://sharp-booth-fc3141.netlify.com/

```
const example = {
	onEnter({ from, to, next }) {
		console.info('onEnter')
		console.table({ from, to })
		body.style.background = to.name

		next()
	},

	onLeave({ from, to, next }) {
		console.info('onLeave')
		console.table({ from, to })
		next()
	}
}

const routes = [
	{
		path: '/',
		view: example,
		name: '#f39c97'
	},
	{
		path: '/blog',
		view: example,
		name: '#aac8dc',
		children: {
			path: ':id',
			name: '#aac8dc',
			view: example
		}
	},
	{
		path: '/test',
		name: '#c0bfd7',
		view: example,
		children: [
			{
				path: '/page-1',
				view: example,
				children: {
					path: ':id',
					name: '#aac8dc',
					view: example
				}
			},
			{
				path: '/page-2',
				view: example
			}
		]
	},
	{
		path: '*',
		name: '#ffc7ad',
		view: example
	}
]

new Router({
	routes,
	transitionOnLoad: true,
	onChange: [
		({ from, to }) => {
			// console.log('onChange')
			$debug.innerHTML = JSON.stringify({ from, to }, null, 2)
		}
	],
	onReady: [
		({ from, to }) => {
			// console.log('onReady')
		}
	],
	onComplete: [
		({ from, to }) => {
			// console.log('onComplete')
		}
	],
	navigation: ['header > ul'],
	currentClass: 'active',
	currentParentClass: 'pappa-active'
}).start()
```
