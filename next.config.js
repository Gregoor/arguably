const webpack = require('webpack');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

module.exports = {
  webpack: (config) => {
    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env.GRAPHQL_ENDPOINT': JSON.stringify(process.env.GRAPHQL_ENDPOINT)
      })
    );
    return config;
  },
};