const {GraphQLID, GraphQLInputObjectType, GraphQLNonNull, GraphQLString} = require('graphql');
const {fromGlobalId, mutationWithClientMutationId} = require('graphql-relay');
const _ = require('lodash');

const {isAuthorized} = require('./helpers');
const {Proposition} = require('../models');
const {PropositionEdge, PropositionGQL, PropositionTypeGQL} = require('./types');


const localizeID = (globalId) => fromGlobalId(globalId).id;
const localizeIDs = (data, ...ids) => _.mapValues(data, (value, key) => (
  ids.includes(key) ? localizeID(value) : value
));

const processPropositionInput = (input) => _.omit(localizeIDs(input, 'parent_id'), 'id');

const PropositionInputGQL = new GraphQLInputObjectType({
  name: 'PropositionInput',
  fields: {
    id:         {type: GraphQLID},
    name:       {type: GraphQLString},
    text:       {type: GraphQLString},
    parent_id:  {type: GraphQLID},
    type:       {type: PropositionTypeGQL},
    source_url: {type: GraphQLString}
  }
});

const authify = (resolver) => (input, req, ...args) => {
  if (isAuthorized(req)) return resolver(input, req, ...args);
  throw 'unauthorized';
};

module.exports = {

  createProposition: mutationWithClientMutationId({
    name: 'CreateProposition',
    inputFields: {
      proposition: {type: PropositionInputGQL}
    },
    outputFields: {
      proposition_edge: {
        type: new GraphQLNonNull(PropositionEdge),
        resolve: ({proposition}) => ({
          cursor: '',
          node: proposition
        })
      },
      parent_proposition: {type: PropositionGQL}
    },
    mutateAndGetPayload: authify(async ({proposition: propositionData}) => {
      const [id] = await Proposition()
        .insert(processPropositionInput(propositionData))
        .returning('id');

      const proposition = Proposition({id});
      return {
        proposition: await proposition.first(),
        parent_proposition: await proposition.parent()
      }
    })
  }),

  updateProposition: mutationWithClientMutationId({
    name: 'UpdateProposition',
    inputFields: {
      proposition: {type: PropositionInputGQL}
    },
    outputFields: {
      proposition: {type: new GraphQLNonNull(PropositionGQL)}
    },
    mutateAndGetPayload: authify(async ({proposition: propositionData}, req) => {
      console.log(req);
      const id = localizeID(propositionData.id);

      await Proposition({id}).update(processPropositionInput((propositionData)));

      return {proposition: await Proposition({id}).first()};
    })
  }),

  deleteProposition: mutationWithClientMutationId({
    name: 'DeletePropositione',
    inputFields: {
      id: {type: new GraphQLNonNull(GraphQLID)}
    },
    outputFields: {
      id:                 {type: new GraphQLNonNull(GraphQLID)},
      parent_proposition: {type: new GraphQLNonNull(PropositionGQL)}
    },
    mutateAndGetPayload: authify(async ({id}) => {
      const localID = localizeID(id);

      const proposition = Proposition({id: localID});
      const parent = await proposition.parent();
      await proposition.del();

      return {
        id,
        parent_proposition: parent
      }
    })
  })

};