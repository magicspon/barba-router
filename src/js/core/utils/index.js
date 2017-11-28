import pathToRegexp from 'path-to-regexp'

const noop = () => {}

export const isFn = fn => typeof fn === 'function'

export const tryFn = fn => {
	if (!isFn(fn)) {
		return noop
	}

	return o => fn(o)
}

export const diff = (prev, next) => {
	const output = {}
	Object.keys(prev).reduce((acc, curr) => {
		if (prev[curr] !== next[curr]) {
			output[curr] = curr
		}

		return acc
	}, {})

	return output
}

export class MixinBuilder {
	constructor(superclass) {
		this.superclass = superclass
	}

	with(...mixins) {
		return mixins.reduce((c, mixin) => mixin(c), this.superclass)
	}
}

function pathx(options) {
	options = options || {}

	return function(path) {
		let keys = []
		let re = pathToRegexp(path, keys, options)

		return function(pathname, params) {
			let m = re.exec(pathname)
			if (!m) return false

			params = params || {}

			let key, param
			for (let i = 0; i < keys.length; i += 1) {
				key = keys[i]
				param = m[i + 1]
				if (!param) continue
				params[key.name] = decodeParam(param)
				if (key.repeat) params[key.name] = params[key.name].split(key.delimiter)
			}

			return params
		}
	}
}

function decodeParam(param) {
	try {
		return decodeURIComponent(param)
	} catch (_) {
		log('decodeParam error')
	}
}

export const routePattern = pathx({
	// path-to-regexp options
	sensitive: false,
	strict: false,
	end: false
})

export const parseQuery = input => {
	const queryString = input.split('?')[1]
	const query = {}
	const pairs = queryString.split('&')
	for (let i = 0; i < pairs.length; i += 1) {
		let pair = pairs[i].split('=')
		query[decodeParam(pair[0])] = decodeParam(pair[1] || '')
	}
	return query
}

export const flattenRoutes = routes =>
	routes.reduce((acc, { path, view, children, name }) => {
		let base = path
		const tmp = []

		tmp.push({ path: path, view: view, name })

		if (children) {
			if (base[base.length - 1] !== '/') {
				base += '/'
			}
			if (children.toString() === '[object Object]') {
				const path = `${base}${children.path}`
				tmp.push({
					...children,
					path
				})
			} else {
				tmp.push(
					...flattenRoutes(children).map(item => {
						return {
							...item,
							path: (base + item.path).replace('//', '/')
						}
					})
				)
			}
		}

		acc.push(...tmp)

		return acc
	}, [])

export const explodeSegments = pathname => {
	const o = []
	pathname
		.split('/')
		.filter(segment => segment !== '')
		.map(segment => `/${segment}`)
		.reduce((acc, curr) => {
			const x = acc + curr
			o.push(x)
			return x
		}, '')

	return o
}

export const numSegments = str => str.split('/').length

export const getSegment = (str, segment) => {
	return str.split('/').filter(url => url !== '')[segment]
}

export const getNodeFromResp = (input, target) => {
	const wrapper = document.createElement('div')
	wrapper.innerHTML = input
	return wrapper.querySelector(target)
}

export const searchToObject = (search) => {
  var pairs = search.substring(1).split("&"),
    obj = {},
    pair,
    i;

  for ( i in pairs ) {
    if ( pairs[i] === "" ) continue;

    pair = pairs[i].split("=");
    obj[ decodeURIComponent( pair[0] ) ] = decodeURIComponent( pair[1] );
  }

  return obj;
}
