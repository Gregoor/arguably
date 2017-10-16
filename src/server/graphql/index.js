import {GraphQLObjectType, GraphQLSchema} from 'graphql'
import ViewerGQL from './types/viewer'

export default new GraphQLSchema({
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
