const path = require('path');

const { VueLoaderPlugin } = require('vue-loader')

module.exports = {
	entry: {
		files_advancedsearch: path.join(__dirname, 'src/index.js')
	},
	output: {
		path: path.resolve(__dirname, 'js')
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				loader: 'babel-loader'
			},
			{
				test: /\.css$/,
				loader: ['style-loader', 'css-loader']
			},
			{
				test: /\.vue$/,
				loader: 'vue-loader'
			},
		]
	},
	plugins: [
		new VueLoaderPlugin()
	]
}
