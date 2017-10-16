import {User} from '../entities'

function JSONError(obj) {
  return new Error(JSON.stringify(obj))
}

export const resolveWithUser = (resolver) => async (...args) => {
  const id = args[2].userId || args[1].userId
  const user = id ? await User.find({id}) : null
  return resolver(user, ...args)
}

export const resolveWithRequiredUser = (resolver) => resolveWithUser((user, ...args) => {
  if (!user) {
    throw JSONError({jwt: ['required']})
  }
  return resolver(user, ...args)
})
