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
  (globalId) => {
    const {id, type} = fromGlobalId(globalId);

    if (type == 'Proposition') {
      return Proposition().where({id}).first();
    }

    return {};
  },
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
      resolve: ({id}, args) => (
        knexToConnection(Proposition.orderByChildCount().where('parent_id', id), args)
      )
    },
    child_count: {
      type: new GraphQLNonNull(GraphQLInt),
      args: {
        type: {type: PropositionTypeGQL}
      },
      resolve: async({id, child_count}, args) => (!args.type && child_count) || (
        (await Proposition(Object.assign({parent_id: id}, _.pick(args, 'type'))).count().first()).count
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
      type: PropositionConnection,
      args: connectionArgs,
      resolve: (viewer, args) => (
        knexToConnection(Proposition.orderByChildCount().where('parent_id', null), args)
      )
    }
  },
  interfaces: [nodeInterface, PropositionsParentGQL]
});


module.exports = {nodeField, PropositionEdge, PropositionGQL, PropositionTypeGQL, ViewerGQL};