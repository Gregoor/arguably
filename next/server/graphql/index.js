const {GraphQLObjectType, GraphQLSchema} = require('graphql')

const {ViewerGQL} = require('./types')

module.exports = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      // node: nodeField,
      viewer: {type: ViewerGQL, resolve: () => ({})}
    }
  })
  // mutation: new GraphQLObjectType({
  //   name: 'Mutation',
  //   // fields: require('./mutations')
  //   fields: {}
  // })
})
