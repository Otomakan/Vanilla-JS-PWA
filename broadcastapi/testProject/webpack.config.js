const path = require('path')

module.exports = {
  entry: './src/App.js',
  output: {
    path: path.join(__dirname, 'dist'), 
    filename: 'bundle.js'
  },
   module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  },
    devServer: {
    contentBase: path.join(__dirname, 'dist')
  }
}
