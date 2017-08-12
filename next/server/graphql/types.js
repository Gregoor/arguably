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
const {languages, proposition, user} = require('../entities')
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

const {nodeInterface, nodeField} = nodeDefinitions(
  resolveWithUser((user, globalId) => {
    // const {id, type} = fromGlobalId(globalId)
    const {type} = fromGlobalId(globalId)

    if (type === 'Proposition') {
      // return Proposition.forUserView(user, {id}).first()
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
  isGeneral: {type: GraphQLBoolean},
  languages: {type: new GraphQLList(GraphQLID)},
  order: {type: new GraphQLInputObjectType({
    name: 'PropositionOrder',
    fields: {
      by: {type: new GraphQLNonNull(new GraphQLEnumType({
        name: 'PropositionOrderBy',
        values: {
          CREATED_AT: {value: 'createdAt'},
          VOTES: {value: 'votes_count'}
        }
      }))},
      desc: {type: GraphQLBoolean}
    }
  })},
  query: {type: GraphQLString}
}, connectionArgs)

const UserGQL = new GraphQLObjectType({
  name: 'User',
  fields: fieldsFor(user, ['name', 'canPublish', 'canVote'])
  // fields: () => ({
  //   propositions: {
  //     type: PropositionConnection,
  //     args: propositionsArgs,
  //     resolve: ({id}, args) => knexToConnection(User({id}).propositions(), args)
  //   }
  // })
})
//
const PropositionsParentGQL = new GraphQLInterfaceType({
  name: 'PropositionsParent',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID)},
    propositions: {
      type: PropositionConnection,
      args: propositionsArgs
    },
    propositionsCount: {type: new GraphQLNonNull(GraphQLInt)}
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

let PropositionConnection

const PropositionGQL = new GraphQLObjectType({
  name: 'Proposition',
  fields: () => Object.assign(
    fieldsFor(proposition, ['name', 'isGeneral', 'published', 'sourceURL', 'text']),
    {
      language: {
        type: LanguageGQL,
        resolve: ({languageId}) => ({id: languageId, name: languages[languageId]})
      },
      propositions: {
        type: PropositionConnection,
        args: propositionsArgs,
        resolve: resolveWithUser((user, {id}, args) => (
          []
        ))
      },
      propositionsCount: {
        type: new GraphQLNonNull(GraphQLInt),
        resolve: () => 23
      }
    }
  ),
  // fields: fieldsFor(proposition, ({relationField}) => ({
  // child_relations: relationField({
  //   type: new GraphQLNonNull(new GraphQLList(PropositionRelationGQL))
  // }),
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
  interfaces: [nodeInterface, PropositionsParentGQL]
})

// const PropositionRelationGQL = new GraphQLObjectType({
//   name: 'PropositionRelation',
//   fields: fieldsFor(PropositionRelation, ({relationField}) => ({
//     id: globalIdField(),
//     parent: relationField({type: new GraphQLNonNull(PropositionGQL)}),
//     child: relationField({type: new GraphQLNonNull(PropositionGQL)}),
//     type: {type: new GraphQLNonNull(PropositionTypeGQL)}
//   }))
// })

const propositionConnectionDefinition = connectionDefinitions({nodeType: PropositionGQL})

const PropositionEdge = propositionConnectionDefinition.edgeType
PropositionConnection = propositionConnectionDefinition.connectionType

function viewableBy(propositions, user) {
  return propositions.filter((proposition) => (
    proposition.published || (user && (user.canPublish || proposition.userId === user.id))
  ))
}

async function findGeneralPropositions(user) {
  return viewableBy(await proposition.findAll({isGeneral: true}), user)
}

const ViewerGQL = new GraphQLObjectType({
  name: 'Viewer',
  fields: {
    id: {type: new GraphQLNonNull(GraphQLID), resolve: () => 'viewer'},
    user: {
      type: UserGQL,
      resolve: (viewer, args, {user_id: id}) => (
        viewer.user || (id && user.find({id}))
      )
    },
    propositions: {
      type: PropositionConnection,
      args: propositionsArgs,
      resolve: resolveWithUser(async (user, viewer, args) => (
        connectionFromArray(findGeneralPropositions(user), args)
      ))
      // .sort((e1, e2) => order.desc ^ (e1[order.by] > e2[order.by]))
      // oldResolve: resolveWithUser((user, viewer, args) => {
      //   const query = Proposition.forUserView(user)
      //     .search(args.query)
      //   return knexToConnection(query, args)
      // })
    },
    propositionsCount: {
      type: new GraphQLNonNull(GraphQLInt),
      resolve: resolveWithUser(async (user) => findGeneralPropositions(user).length)
    },
    languages: {
      type: new GraphQLNonNull(new GraphQLList(LanguageGQL)),
      resolve: (() => {
        const languagesAsArray = Object.entries(languages).map(([id, name]) => ({id, name}))
        return () => languagesAsArray
      })()
    }
  },
  interfaces: [nodeInterface, PropositionsParentGQL]
})

module.exports = {
  nodeField,
  PropositionEdge,
  PropositionGQL,
  PropositionsParentGQL,
  PropositionTypeGQL,
  ViewerGQL
}
