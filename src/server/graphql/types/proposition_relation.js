import {GraphQLEnumType, GraphQLID, GraphQLInt, GraphQLInterfaceType, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {connectionDefinitions, connectionFromArray, globalIdField} from 'graphql-relay'
import {Proposition, PropositionRelation} from '../../entities'
import {resolveWithUser} from '../resolvers'
import {propositionsArgs, viewableBy} from './helpers'
import PropositionGQL from './proposition'
import ViewerGQL from './viewer'

export let PropositionRelationConnection

export const PropositionTypeGQL = new GraphQLEnumType({
  name: 'PropositionType',
  values: {
    PRO: {value: 'pro'},
    CONTRA: {value: 'contra'}
  }
})

export const PropositionRelationsParentGQL = new GraphQLInterfaceType({
  name: 'PropositionRelationsParent',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID)},
    childCount: {type: new GraphQLNonNull(GraphQLInt)},
    children: {
      type: PropositionRelationConnection,
      args: propositionsArgs
    }
  }),
  resolveType: ({id}) => id === 'viewer' ? ViewerGQL : PropositionGQL
})

export const PropositionRelationGQL = new GraphQLObjectType({
  name: 'PropositionRelation',
  fields: () => ({
    id: globalIdField(),
    childCount: {
      type: new GraphQLNonNull(GraphQLInt),
      resolve: () => 23
    },
    children: {
      type: PropositionRelationConnection,
      args: propositionsArgs,
      resolve: resolveWithUser(async (user, {id}, args) => connectionFromArray(
        await viewableBy(PropositionRelation.findAll({parentId: id}), user),
        args
      ))
    },
    parent: {type: new GraphQLNonNull(PropositionGQL)},
    proposition: {
      type: new GraphQLNonNull(PropositionGQL),
      resolve: resolveWithUser(
        (user, {propositionId: id}) => viewableBy(Proposition.find({id}), user)
      )
    },
    type: {type: PropositionTypeGQL}
  }),
  interfaces: () => [require('./node').default.interface, PropositionRelationsParentGQL]
})

const connectionDefinition = connectionDefinitions({nodeType: PropositionRelationGQL})
export const PropositionRelationEdge = connectionDefinition.edgeType
PropositionRelationConnection = connectionDefinition.connectionType
