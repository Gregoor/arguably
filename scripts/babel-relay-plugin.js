const getBabelRelayPlugin = require('babel-relay-plugin');
const {graphql}  = require('graphql');
const {introspectionQuery} = require('graphql/utilities');

const schema = require('../server/graphql');


module.exports = (...babelArgs) => graphql(schema, introspectionQuery)
  .then((result) => getBabelRelayPlugin(result.data));
