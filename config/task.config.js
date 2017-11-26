module.exports = {
	mode: 'html',

	html: {
		task: 'code',
		watch: true,
		extensions: ['twig', 'html', 'json'],
		excludeFolders: [
			'layout',
			'macros',
			'data',
			'partials',
			'modules',
			'wrapper',
			'includes'
		]
	},

	js: {
		entries: {
			app: ['./app.js']
		},
		hot: {
			enabled: true,
			reload: true,
			quiet: true,
			react: false
		},
		extensions: ['js', 'json'],
		extractSharedJs: false,
		filename: 'bundle' // no extension
	}
}
