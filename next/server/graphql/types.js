const {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLInterfaceType,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} = require('graphql')
const {
  connectionArgs,
  connectionDefinitions,
  connectionFromArray,
  fromGlobalId,
  globalIdField,
  nodeDefinitions
} = require('graphql-relay')
// const {map} = require('lodash')
const {languages, Proposition, PropositionRelation, User} = require('../entities')
const {resolveWithUser} = require('./resolvers')

function fieldsFor(entity, fieldNames) {
  return Object.entries(entity.fields)
    .filter(([field]) => fieldNames.includes(field))
    .map(([field, def]) => {
      const meta = def.meta || def.type.meta
      const gqlType = {
        'String': GraphQLString,
        'Boolean': GraphQLBoolean,
        'Integer': GraphQLInt
      }[meta.kind === 'irreducible' ? meta.name : meta.type.meta.name] || GraphQLString
      return [field, {type: meta.kind === 'maybe' ? gqlType : new GraphQLNonNull(gqlType)}]
    })
    .concat([['id', globalIdField()]])
    .reduce((obj, [k, v]) => (obj[k] = v) && obj, {})
}

async function viewableBy(propositions, user) {
  return propositions
  // function testProposition(proposition) {
  //   return proposition.published || (user && (user.canPublish || proposition.userId === user.id))
  // }
  //
  // propositions = await Promise.resolve(propositions)
  // return Array.isArray(propositions)
  //   ? propositions.filter(testProposition)
  //   : testProposition(propositions) ? propositions : null
}

async function findGeneralPropositionRelations(user) {
  return viewableBy(await PropositionRelation.findAll({parentId: null}), user)
}

const {nodeInterface, nodeField} = nodeDefinitions(
  resolveWithUser((user, globalId) => {
    const {id, type} = fromGlobalId(globalId)

    if (type === 'Proposition') {
      return viewableBy(Proposition.find({id}), user)
    }

    return {}
  }),
  (obj) => {
    if (obj.id) return PropositionGQL
    else return ViewerGQL
  }
)

const LanguageGQL = new GraphQLObjectType({
  name: 'Language',
  fields: {
    id: globalIdField(),
    name: {type: new GraphQLNonNull(GraphQLString)}
  }
})

const propositionsArgs = Object.assign({
  languages: {type: new GraphQLList(GraphQLID)},
  order: {
    type: new GraphQLInputObjectType({
      name: 'PropositionOrder',
      fields: {
        by: {
          type: new GraphQLNonNull(new GraphQLEnumType({
            name: 'PropositionOrderBy',
            values: {
              CREATED_AT: {value: 'createdAt'},
              VOTES: {value: 'votes_count'}
            }
          }))
        },
        desc: {type: GraphQLBoolean}
      }
    })
  },
  query: {type: GraphQLString}
}, connectionArgs)

const UserGQL = new GraphQLObjectType({
  name: 'User',
  fields: fieldsFor(User, ['name', 'canPublish', 'canVote'])
  // fields: () => ({
  //   propositions: {
  //     type: PropositionConnection,
  //     args: propositionsArgs,
  //     resolve: ({id}, args) => knexToConnection(User({id}).propositions(), args)
  //   }
  // })
})
//
const PropositionRelationsParentGQL = new GraphQLInterfaceType({
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

const PropositionTypeGQL = new GraphQLEnumType({
  name: 'PropositionType',
  values: {
    PRO: {value: 'pro'},
    CONTRA: {value: 'contra'}
  }
})

let PropositionRelationConnection

const PropositionGQL = new GraphQLObjectType({
  name: 'Proposition',
  fields: () => Object.assign(
    fieldsFor(Proposition, ['name', 'published', 'sourceURL', 'text']),
    {
      // childCount: {
      //   type: new GraphQLNonNull(GraphQLInt)
      // },
      // children: {
      //   type: PropositionRelationConnection,
      //   args: propositionsArgs,
      //   resolve: resolveWithUser(async (user, {id}, args) => connectionFromArray(
      //     [] ||
      //     await PropositionRelation.findAll({
      //       parentId: map(
      //         await PropositionRelation.findAll({propositionId: id, parentId: null}),
      //         'id'
      //       )
      //     }),
      //     args
      //   ))
      // },
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
    }
  ),
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
  interfaces: [nodeInterface]//, PropositionRelationsParentGQL]
})

const PropositionRelationGQL = new GraphQLObjectType({
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
  interfaces: [nodeInterface, PropositionRelationsParentGQL]
})

const propositionRelationConnectionDefinition = connectionDefinitions({
  nodeType: PropositionRelationGQL
})
const PropositionRelationEdge = propositionRelationConnectionDefinition.edgeType
PropositionRelationConnection = propositionRelationConnectionDefinition.connectionType

const ViewerGQL = new GraphQLObjectType({
  name: 'Viewer',
  fields: {
    id: {type: new GraphQLNonNull(GraphQLID), resolve: () => 'viewer'},
    user: {
      type: UserGQL,
      resolve: (viewer, args, {user_id: id}) => (
        viewer.User || (id && User.find({id}))
      )
    },
    childCount: {
      type: new GraphQLNonNull(GraphQLInt),
      resolve: resolveWithUser(async (user) => (await findGeneralPropositionRelations(user)).length)
    },
    children: {
      type: PropositionRelationConnection,
      args: propositionsArgs,
      resolve: resolveWithUser(async (user, viewer, args) => (
        connectionFromArray(await findGeneralPropositionRelations(user), args)
      ))
      // .sort((e1, e2) => order.desc ^ (e1[order.by] > e2[order.by]))
      // oldResolve: resolveWithUser((user, viewer, args) => {
      //   const query = Proposition.forUserView(user)
      //     .search(args.query)
      //   return knexToConnection(query, args)
      // })
    },
    languages: {
      type: new GraphQLNonNull(new GraphQLList(LanguageGQL)),
      resolve: (() => {
        const languagesAsArray = Object.entries(languages).map(([id, name]) => ({id, name}))
        return () => languagesAsArray
      })()
    }
  },
  interfaces: [nodeInterface, PropositionRelationsParentGQL]
})

module.exports = {
  nodeField,
  PropositionGQL,
  PropositionRelationsParentGQL,
  PropositionRelationEdge,
  PropositionRelationGQL,
  PropositionTypeGQL,
  ViewerGQL
}
