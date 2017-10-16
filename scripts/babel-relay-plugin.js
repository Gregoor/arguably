const getBabelRelayPlugin = require('babel-relay-plugin')

const schemaData = require('../src/data/schema.json')

module.exports = getBabelRelayPlugin(schemaData.data)
