import babel from 'rollup-plugin-babel'
import pkg from './package.json'
import uglify from 'rollup-plugin-uglify'
import commonjs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'
import filesize from 'rollup-plugin-filesize'

export default [
	{
		entry: 'src/main.js',
		dest: pkg.main,
		format: 'umd',
		moduleName: 'barbaRouter',
		plugins: [
			filesize(),
			babel({
				exclude: ['node_modules/**']
			}),
			nodeResolve({
				jsnext: true,
				main: true
			}),
			commonjs(),
			uglify()
		]
	}
]
