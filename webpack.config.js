const path = require('path');

module.exports = {
  mode: 'development',
  entry: path.resolve(__dirname, './src/index.js'),
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            // pragma 影响函数名 , { pragma: 'MakeR.createElement' }
            plugins: [['@babel/plugin-transform-react-jsx']],
          },
        },
      },
    ],
  },
  // optimization: {
  //   minimize: false,
  // },
};
