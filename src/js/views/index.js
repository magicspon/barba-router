import { Page1 } from './Page1'
import { Page2 } from './Page2'
import { Page3 } from './Page3'
import { Home } from './Home'
import { Blog } from './Blog'
import { Post } from './Post'
import { Fallback } from './Fallback'

export default [
	{
		path: '/',
		view: Home,
		name: 'home'
	},
	{
		path: '/page-1',
		view: Page1,
		query: {
			name: 'test'
		}
	},
	{
		path: '/blog/',
		view: Blog,
		children: {
			path: ':id',
			view: Post
		}
	},
	{
		path: '/test',
		view: Blog,
		children: [
			{
				path: '/a',
				view: Page1
			},
			{
				path: '/b',
				view: Page1
			},
			{
				path: '/list',
				view: Page3,
				children: {
					path: ':id',
					view: Page2
				}
			}
		]
	},
	{
		path: '*',
		view: Fallback,
		name: 'fallback'
	}
]
