const {user} = require('../entities')

function JSONError(obj) {
  return new Error(JSON.stringify(obj))
}

const resolvers = {

  resolveWithUser: (resolver) => async(...args) => {
    const id = args[2].userId || args[1].userId
    const currentUser = id ? await user.find({id}) : null
    return resolver(currentUser, ...args)
  },

  resolveWithRequiredUser: (resolver) => resolvers.resolveWithUser((user, ...args) => {
    if (!user) {
      throw JSONError({jwt: ['required']})
    }
    return resolver(user, ...args)
  })

}

module.exports = resolvers
