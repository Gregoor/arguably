const bcrypt = require('bcrypt');
const {
  GraphQLID,
  GraphQLBoolean,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLString
} = require('graphql');
const {fromGlobalId, mutationWithClientMutationId} = require('graphql-relay');
const _ = require('lodash');

const {JSONError, jwt} = require('../helpers');
const {Proposition, User} = require('../models');
const {PropositionEdge, PropositionGQL, PropositionTypeGQL, ViewerGQL} = require('./types');

const SALT_ROUNDS = 10;


const localizeID = (globalId) => fromGlobalId(globalId).id;
const localizeIDs = (data, ...ids) => _.mapValues(data, (value, key) => (
  ids.includes(key) ? localizeID(value) : value
));

const processPropositionInput = (input) => _.omit(localizeIDs(input, 'parent_id'), 'id');

const PropositionInputGQL = new GraphQLInputObjectType({
  name: 'PropositionInput',
  fields: {
    id: {type: GraphQLID},
    name: {type: GraphQLString},
    text: {type: GraphQLString},
    parent_id: {type: GraphQLID},
    type: {type: PropositionTypeGQL},
    source_url: {type: GraphQLString},
    published: {type: GraphQLBoolean}
  }
});

const authify = (resolver) => (input, req, ...args) => {
  const id = req.user_id;
  if (!id) {
    throw JSONError({jwt: ['missing']});
  }
  return User().where({id}).first()
    .then((user) => {
      if (user.can_publish) return resolver(user, input, req, ...args);
      throw JSONError({jwt: ['unauthorized']});
    });
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
    mutateAndGetPayload: authify(async(user, {proposition: propositionData}) => {
      const [id] = await Proposition()
        .insert(Object.assign(processPropositionInput(propositionData), {user_id: user.id}))
        .returning('id');

      const proposition = Proposition({id});
      return {
        proposition: proposition.first(),
        parent_proposition: proposition.parent()
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
    mutateAndGetPayload: authify(async(user, {proposition: propositionData}, req) => {
      const id = localizeID(propositionData.id);

      await Proposition({id}).update(processPropositionInput((propositionData)));

      return {proposition: Proposition({id}).first()};
    })
  }),

  deleteProposition: mutationWithClientMutationId({
    name: 'DeleteProposition',
    inputFields: {
      id: {type: new GraphQLNonNull(GraphQLID)}
    },
    outputFields: {
      id: {type: new GraphQLNonNull(GraphQLID)},
      parent_proposition: {type: new GraphQLNonNull(PropositionGQL)}
    },
    mutateAndGetPayload: authify(async(user, {id}) => {
      const localID = localizeID(id);

      const proposition = Proposition({id: localID});
      const parent = await proposition.parent();
      await proposition.del();

      return {
        id,
        parent_proposition: parent
      }
    })
  }),

  register: mutationWithClientMutationId({
    name: 'Register',
    inputFields: {
      name: {type: new GraphQLNonNull(GraphQLString)},
      password: {type: new GraphQLNonNull(GraphQLString)}
    },
    outputFields: {
      jwt: {type: new GraphQLNonNull(GraphQLString)},
      viewer: {type: new GraphQLNonNull(ViewerGQL)}
    },
    mutateAndGetPayload: async({name, password}) => {
      if (password.length < 8) {
        throw JSONError({password: ['too_short']});
      }
      if (await User.firstByName(name)) {
        throw JSONError({name: ['exists']});
      }
      const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
      const [id] = await User().insert({name: name.trim(), password_hash}, 'id');
      return {
        jwt: jwt.sign({user_id: id}),
        viewer: {
          user: User().where({id}).first()
        }
      }
    }
  }),

  login: mutationWithClientMutationId({
    name: 'Login',
    inputFields: {
      name: {type: new GraphQLNonNull(GraphQLString)},
      password: {type: new GraphQLNonNull(GraphQLString)}
    },
    outputFields: {
      jwt: {type: new GraphQLNonNull(GraphQLString)},
      viewer: {type: new GraphQLNonNull(ViewerGQL)}
    },
    mutateAndGetPayload: async({name, password}) => {
      const user = await User.firstByName(name);
      if (!user) {
        throw JSONError({name: ['not_found']});
      }
      if (!await bcrypt.compare(password, user.password_hash)) {
        throw JSONError({password: ['invalid']});
      }
      return {
        jwt: jwt.sign({user_id: user.id}),
        viewer: {
          user
        }
      }
    }
  }),

  logout: mutationWithClientMutationId({
    name: 'Logout',
    outputFields: {
      viewer: {type: new GraphQLNonNull(ViewerGQL)}
    },
    mutateAndGetPayload: (input, req) => {
      delete req.user_id;
      return {viewer: {}};
    }
  })

};