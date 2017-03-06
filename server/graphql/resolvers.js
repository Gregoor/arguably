const _ = require('lodash');

const {JSONError} = require('../helpers');
const {User} = require('../entities');


const resolvers = {

  resolveWithUser: (resolver) => async(...args) => {
    const id = args[2].user_id || args[1].user_id;
    const user = id ? await User().where({id}).first() : null;
    return resolver(user, ...args)
  },

  resolveWithRequiredUser: (resolver) => resolvers.resolveWithUser((user, ...args) => {
    if (!user) {
      throw JSONError({jwt: ['required']});
    }
    return resolver(user, ...args);
  })

};

module.exports = resolvers;