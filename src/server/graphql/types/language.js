import {GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import {globalIdField} from 'graphql-relay'

export default new GraphQLObjectType({
  name: 'Language',
  fields: {
    id: globalIdField(),
    name: {type: new GraphQLNonNull(GraphQLString)}
  }
})
