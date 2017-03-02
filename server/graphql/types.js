const {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLID,
  GraphQLInterfaceType,
  GraphQLInt,
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

const {Proposition, User} = require('../models');
const {resolveWithUser} = require('./resolvers');


const knexToConnection = async(baseQuery, {first, after, last, before}) => {
  let query = baseQuery.clone();

  const offset = parseInt(after, 10) || 0;
  if (first) {
    query = query.clone().limit(first).offset(offset);
  } else if (last) {
    // TODO
  }

  const [
    nodes,
    [totalCountRow],
    [countRow]
  ] = await Promise.all([
    query.clone(),
    baseQuery.clone().count(),
    query.clone().count()
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
      return Proposition.forUser(user).where({id}).first();
    }

    return {};
  }),
  (obj) => {
    if (obj.id) return PropositionGQL;
    else return ViewerGQL;
  }
);

const UserGQL = new GraphQLObjectType({
  name: 'User',
  fields: {
    id: globalIdField(),
    name: {type: new GraphQLNonNull(GraphQLString)},
    can_vote: {type: new GraphQLNonNull(GraphQLBoolean)},
    can_publish: {type: new GraphQLNonNull(GraphQLBoolean)}
  }
});

const PropositionsParentGQL = new GraphQLInterfaceType({
  name: 'PropositionsParent',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID)},
    propositions: {
      type: PropositionConnection,
      args: connectionArgs
    }
  }),
  resolveType: ({id}) => id == 'Viewer' ? ViewerGQL : PropositionGQL
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
    text: {type: new GraphQLNonNull(GraphQLString)},
    source_url: {type: GraphQLString},
    votes: {type: new GraphQLNonNull(GraphQLInt)},
    propositions: {
      type: PropositionConnection,
      args: connectionArgs,
      resolve: resolveWithUser((user, {id}, args) => (
        knexToConnection(Proposition.forUser(user).where('parent_id', id), args)
      ))
    },
    published: {type: new GraphQLNonNull(GraphQLBoolean)},
    propositions_count: {
      type: new GraphQLNonNull(GraphQLInt),
      resolve: async({id, child_count}) => child_count || (
        (await Proposition({parent_id: id}).count().first()).count
      )
    },
    type: {type: PropositionTypeGQL},
    parent: {
      type: PropositionGQL,
      resolve: ({parent_id}) => parent_id ? Proposition({id: parent_id}).first() : null
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
      args: connectionArgs,
      resolve: resolveWithUser((user, viewer, args) => (
        knexToConnection(Proposition.forUser(user).where('parent_id', null), args)
      ))
    }
  },
  interfaces: [nodeInterface, PropositionsParentGQL]
});


module.exports = {nodeField, PropositionEdge, PropositionGQL, PropositionTypeGQL, ViewerGQL};