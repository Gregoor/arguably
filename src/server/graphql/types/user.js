const {GraphQLObjectType} = require('graphql')
const {User} = require('../../entities')
const {fieldsFor} = require('./helpers')

export default new GraphQLObjectType({
  name: 'User',
  fields: () => fieldsFor(User, ['name', 'canPublish', 'canVote'])
  // fields: () => ({
  //   propositions: {
  //     type: PropositionConnection,
  //     args: propositionsArgs,
  //     resolve: ({id}, args) => knexToConnection(User({id}).propositions(), args)
  //   }
  // })
})
