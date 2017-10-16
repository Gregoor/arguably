import {GraphQLInt, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {connectionFromArray} from 'graphql-relay'
import {map} from 'lodash'
import {languages, Proposition, PropositionRelation} from '../../entities'
import {resolveWithUser} from '../resolvers'
import {fieldsFor, propositionsArgs} from './helpers'
import LanguageGQL from './language'

export default new GraphQLObjectType({
  name: 'Proposition',
  fields: () => ({
    ...fieldsFor(Proposition, ['name', 'published', 'sourceURL', 'text']),
    childCount: {
      type: new GraphQLNonNull(GraphQLInt)
    },
    children: {
      type: require('./proposition_relation').PropositionRelationConnection,
      args: propositionsArgs,
      resolve: resolveWithUser(async (user, {id}, args) => connectionFromArray(
        [] ||
        await PropositionRelation.findAll({
          parentId: map(
            await PropositionRelation.findAll({propositionId: id, parentId: null}),
            'id'
          )
        }),
        args
      ))
    },
    language: {
      type: LanguageGQL,
      resolve: ({languageId}) => ({id: languageId, name: languages[languageId]})
    }// ,
    // parentCount: {
    //   type: new GraphQLNonNull(GraphQLInt)
    // },
    // parentRelations: {
    //   type: new GraphQLNonNull(new GraphQLList(PropositionRelationGQL))
    // }
  }),
  // fields: fieldsFor(proposition, ({relationField}) => ({
  // child_count: {
  //   type: new GraphQLNonNull(GraphQLInt),
  //   resolve: resolveWithUser(async(user, {id}) => (
  //     (await Proposition.forUserView(user, {parent_id: id}).count().first()).count
  //   ))
  // },
  // parent_relation: relationField({type: PropositionRelationGQL}),
  // parent_relations: relationField({
  //   type: new GraphQLNonNull(new GraphQLList(PropositionRelationGQL))
  // }),
  // user: relationField({type: new GraphQLNonNull(UserGQL)}),
  // votes_count: {type: new GraphQLNonNull(GraphQLInt)},
  // voted_by_user: {
  //   type: new GraphQLNonNull(GraphQLBoolean),
  //   resolve: resolveWithUser(async(user, {id}) => (
  //     Boolean(user && await Vote({proposition_id: id, user_id: user.id}).first())
  //   ))
  // }
  // })),
  interfaces: () => [
    require('./node').default.interface,
    require('./proposition_relation').PropositionRelationsParentGQL
  ]
})
