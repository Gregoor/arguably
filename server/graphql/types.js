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
} = require('graphql');
const {
  connectionArgs,
  connectionDefinitions,
  fromGlobalId,
  globalIdField,
  nodeDefinitions
} = require('graphql-relay');
const _ = require('lodash');

const knex = require('../knex');
const {Language, Proposition, Vote, User} = require('../entities');
const {resolveWithUser} = require('./resolvers');


const knexToConnection = async(baseQuery, {first, after, last, before, order}) => {
  let query = baseQuery.clone();

  const offset = parseInt(after, 10) || 0;
  if (first) {
    query = query.clone().limit(first).offset(offset);
  } else if (last) {
    // TODO
  }

  const countQuery = query.clone().count();
  const totalCountQuery = baseQuery.clone().count();

  if (order) {
    query.orderBy(order.by, order.desc ? 'DESC' : 'ASC');
  }

  const [
    nodes,
    [totalCountRow],
    [countRow]
  ] = await Promise.all([
    query.clone(),
    totalCountQuery,
    countQuery
  ]);

  const total = totalCountRow ? parseInt(totalCountRow.count, 10) : NaN;
  const isThisAll = total - (countRow ? parseInt(countRow.count, 10) : NaN) > 0;
  return {
    pageInfo: {
      hasNextPage: Boolean(!isThisAll && offset + (first || 0) < total),
      hasPreviousPage: Boolean(!isThisAll && offset > 0),
      startCursor: 0,
      endCursor: total
    },
    edges: nodes.map((node, i) => ({node, cursor: i}))
  };
};

const {nodeInterface, nodeField} = nodeDefinitions(
  resolveWithUser((user, globalId) => {
    const {id, type} = fromGlobalId(globalId);

    if (type == 'Proposition') {
      return Proposition.forUserView(user, {id}).first();
    }

    return {};
  }),
  (obj) => {
    if (obj.id) return PropositionGQL;
    else return ViewerGQL;
  }
);

const LanguageGQL = new GraphQLObjectType({
  name: 'Language',
  fields: {
    id: globalIdField(),
    name: {type: new GraphQLNonNull(GraphQLString)}
  }
});

const propositionsArgs = Object.assign({
  query: {type: GraphQLString},
  languages: {type: new GraphQLList(GraphQLID)},
  order: {type: new GraphQLInputObjectType({
    name: 'PropositionOrder',
    fields: {
      by: {type: new GraphQLNonNull(new GraphQLEnumType({
        name: 'PropositionOrderBy',
        values: {
          CREATED_AT: {value: 'created_at'},
          VOTES: {value: 'votes_count'}
        }
      }))},
      desc: {type: GraphQLBoolean}
    }
  })}
}, connectionArgs);

const UserGQL = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: globalIdField(),
    name: {type: new GraphQLNonNull(GraphQLString)},
    can_vote: {type: new GraphQLNonNull(GraphQLBoolean)},
    can_publish: {type: new GraphQLNonNull(GraphQLBoolean)},
    propositions: {
      type: PropositionConnection,
      args: propositionsArgs,
      resolve: ({id}, args) => knexToConnection(User({id}).propositions(), args)
    }
  })
});

const PropositionsParentGQL = new GraphQLInterfaceType({
  name: 'PropositionsParent',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID)},
    propositions: {
      type: PropositionConnection,
      args: propositionsArgs
    },
    propositions_count: {type: new GraphQLNonNull(GraphQLInt)}
  }),
  resolveType: ({id}) => id == 'viewer' ? ViewerGQL : PropositionGQL
});

const PropositionTypeGQL = new GraphQLEnumType({
  name: 'PropositionType',
  values: {
    PRO: {value: 'pro'},
    CONTRA: {value: 'contra'}
  }
});

const PropositionGQL = new GraphQLObjectType({
  name: 'Proposition',
  fields: () => ({
    id: globalIdField(),
    name: {type: new GraphQLNonNull(GraphQLString)},
    has_parent: {
      type: new GraphQLNonNull(GraphQLBoolean),
      resolve: (proposition) => Boolean(proposition.parent_id)
    },
    parent: {
      type: PropositionGQL,
      resolve: ({id}) => Proposition({id}).parent()
    },
    propositions: {
      type: PropositionConnection,
      args: propositionsArgs,
      resolve: resolveWithUser((user, {id}, args) => (
        knexToConnection(Proposition.forUserView(user, {parent_id: id}), args)
      ))
    },
    propositions_count: {
      type: new GraphQLNonNull(GraphQLInt),
      resolve: resolveWithUser(async(user, {id, child_count}) => child_count || (
        (await Proposition.forUserView(user, {parent_id: id}).count().first()).count
      ))
    },
    published: {type: new GraphQLNonNull(GraphQLBoolean)},
    source_url: {type: GraphQLString},
    text: {type: new GraphQLNonNull(GraphQLString)},
    type: {type: PropositionTypeGQL},
    user: {
      type: new GraphQLNonNull(UserGQL),
      resolve: ({id}) => Proposition({id}).user()
    },
    votes_count: {type: new GraphQLNonNull(GraphQLInt)},
    voted_by_user: {
      type: new GraphQLNonNull(GraphQLBoolean),
      resolve: resolveWithUser(async(user, {id}) => (
        Boolean(await Vote({proposition_id: id, user_id: user.id}).first())
      ))
    },
    language: {
      type: new GraphQLNonNull(LanguageGQL),
      resolve: ({id}) => Proposition({id}).language()
    }
  }),
  interfaces: [nodeInterface, PropositionsParentGQL]
});

const {
  connectionType: PropositionConnection,
  edgeType: PropositionEdge
} = connectionDefinitions({nodeType: PropositionGQL});

const ViewerGQL = new GraphQLObjectType({
  name: 'Viewer',
  fields: {
    id: {type: new GraphQLNonNull(GraphQLID), resolve: () => 'viewer'},
    user: {
      type: UserGQL,
      resolve: (viewer, {}, {user_id}) => (
        viewer.user || (user_id && User().where('id', user_id).first())
      )
    },
    propositions: {
      type: new GraphQLNonNull(PropositionConnection),
      args: propositionsArgs,
      resolve: resolveWithUser((user, viewer, args) => {
        const query = Proposition.forUserView(user)
          .search(args.query);
        return knexToConnection(query, args);
      })
    },
    propositions_count: {
      type: new GraphQLNonNull(GraphQLInt),
      resolve: resolveWithUser(async (user) => (
        (await Proposition.forUserView(user).where('parent_id', null).count().first()).count
      ))
    },
    languages: {
      type: new GraphQLNonNull(new GraphQLList(LanguageGQL)),
      resolve: () => Language()
    }
  },
  interfaces: [nodeInterface, PropositionsParentGQL]
});


module.exports = {
  nodeField,
  PropositionEdge,
  PropositionGQL,
  PropositionsParentGQL,
  PropositionTypeGQL,
  ViewerGQL
};