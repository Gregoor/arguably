import {GraphQLID, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {connectionFromArray} from 'graphql-relay'
import {languages, PropositionRelation, User} from '../../entities'
import {resolveWithUser} from '../resolvers'
import {propositionsArgs, viewableBy} from './helpers'
import LanguageGQL from './language'
import UserGQL from './user'

async function findGeneralPropositionRelations(user) {
  return viewableBy(await PropositionRelation.findAll({parentId: null}), user)
}

export default new GraphQLObjectType({
  name: 'Viewer',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), resolve: () => 'viewer'},
    user: {
      type: UserGQL,
      resolve: (viewer, args, {user_id: id}) => viewer.user || (id && User.find({id}))
    },
    childCount: {
      type: new GraphQLNonNull(GraphQLInt),
      resolve: resolveWithUser(async (user) => (await findGeneralPropositionRelations(user)).length)
    },
    children: {
      type: require('./proposition_relation').PropositionRelationConnection,
      args: propositionsArgs,
      resolve: resolveWithUser(async (user, viewer, args) => (
        connectionFromArray(await findGeneralPropositionRelations(user), args)
      ))
      //   // .sort((e1, e2) => order.desc ^ (e1[order.by] > e2[order.by]))
      //   // oldResolve: resolveWithUser((user, viewer, args) => {
      //   //   const query = Proposition.forUserView(user)
      //   //     .search(args.query)
      //   //   return knexToConnection(query, args)
      //   // })
    },
    languages: {
      type: new GraphQLNonNull(new GraphQLList(LanguageGQL)),
      resolve: (() => {
        const languagesAsArray = Object.entries(languages).map(([id, name]) => ({id, name}))
        return () => languagesAsArray
      })()
    }
  }),
  interfaces: () => [
    require('./node').default.interface,
    require('./proposition_relation').PropositionRelationsParentGQL
  ]
})
