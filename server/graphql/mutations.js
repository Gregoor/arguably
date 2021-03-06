const bcrypt = require('bcrypt')
const {
  GraphQLID,
  GraphQLBoolean,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLString
} = require('graphql')
const {fromGlobalId, mutationWithClientMutationId} = require('graphql-relay')
const _ = require('lodash')
const {JSONError, jwt} = require('../helpers')
const {Proposition, Vote, User} = require('../entities')
const {resolveWithRequiredUser} = require('./resolvers')
const {
  PropositionEdge,
  PropositionGQL,
  PropositionsParentGQL,
  PropositionTypeGQL,
  ViewerGQL
} = require('./types')

const SALT_ROUNDS = 10

const localizeID = (globalId) => fromGlobalId(globalId).id
const localizeIDs = (data, ...ids) => _.mapValues(data, (value, key) => (
  ids.includes(key) ? localizeID(value) : value
))

const processPropositionInput = (input, user) => _.omit(
  localizeIDs(input, 'parent_id', 'language_id'),
  'id',
  !user.can_publish && 'published'
)

const PropositionInputGQL = new GraphQLInputObjectType({
  name: 'PropositionInput',
  fields: {
    id: {type: GraphQLID},
    name: {type: GraphQLString},
    text: {type: GraphQLString},
    parent_id: {type: GraphQLID},
    type: {type: PropositionTypeGQL},
    source_url: {type: GraphQLString},
    published: {type: GraphQLBoolean},
    language_id: {type: new GraphQLNonNull(GraphQLID)}
  }
})

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
      parent: {type: PropositionsParentGQL}
    },
    mutateAndGetPayload: resolveWithRequiredUser(async(user, {proposition: propositionData}) => {
      const [id] = await Proposition()
        .insert(Object.assign(processPropositionInput(propositionData, user), {user_id: user.id}))
        .returning('id')

      const proposition = Proposition({id})
      return {
        proposition: proposition.first(),
        parent: proposition.parent()
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
    mutateAndGetPayload: resolveWithRequiredUser(async(user, {proposition: propositionData}) => {
      const id = localizeID(propositionData.id)

      await Proposition
        .forUserChange(user, {id})
        .update(processPropositionInput(propositionData, user))

      return {proposition: Proposition({id}).first()}
    })
  }),

  deleteProposition: mutationWithClientMutationId({
    name: 'DeleteProposition',
    inputFields: {
      id: {type: new GraphQLNonNull(GraphQLID)}
    },
    outputFields: {
      id: {type: new GraphQLNonNull(GraphQLID)},
      parent: {type: new GraphQLNonNull(PropositionsParentGQL)}
    },
    mutateAndGetPayload: resolveWithRequiredUser(async(user, {id}) => {
      const proposition = Proposition.forUserChange(user, {id: localizeID(id)})
      const parent = await proposition.parent()
      await proposition.del()

      return {
        id,
        parent: parent || {id: 'viewer'}
      }
    })
  }),

  vote: mutationWithClientMutationId({
    name: 'Vote',
    inputFields: {
      proposition_id: {type: new GraphQLNonNull(GraphQLID)}
    },
    outputFields: {
      proposition: {type: new GraphQLNonNull(PropositionGQL)}
    },
    mutateAndGetPayload: resolveWithRequiredUser(async(user, {proposition_id: id}) => {
      id = localizeID(id)
      const voteFields = {proposition_id: id, user_id: user.id}
      if (await Vote(voteFields).first()) {
        throw JSONError({proposition_id: ['already_voted']})
      }
      await Vote().insert(voteFields)
      return {proposition: Proposition({id}).first()}
    })
  }),

  unvote: mutationWithClientMutationId({
    name: 'Unvote',
    inputFields: {
      proposition_id: {type: new GraphQLNonNull(GraphQLID)}
    },
    outputFields: {
      proposition: {type: new GraphQLNonNull(PropositionGQL)}
    },
    mutateAndGetPayload: resolveWithRequiredUser(async(user, {proposition_id: id}) => {
      id = localizeID(id)
      const voteFields = {proposition_id: id, user_id: user.id}
      if (!(await Vote(voteFields).first())) {
        throw JSONError({proposition_id: ['not_voted']})
      }
      await Vote().where(voteFields).del()
      return {proposition: Proposition({id}).first()}
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
        throw JSONError({password: ['too_short']})
      }
      if (await User.firstByName(name)) {
        throw JSONError({name: ['exists']})
      }
      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
      const [id] = await User().insert({name: name.trim(), password_hash: passwordHash}, 'id')
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
      const user = await User.firstByName(name)
      if (!user) {
        throw JSONError({name: ['not_found']})
      }
      if (!await bcrypt.compare(password, user.password_hash)) {
        throw JSONError({password: ['invalid']})
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
      delete req.user_id
      return {viewer: {}}
    }
  })

}
