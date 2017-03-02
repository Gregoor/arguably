const _ = require('lodash');

const {User} = require('../models');


const resolvers = {
  resolveWithUser: (resolver) => async(...args) => {
    const id = args[2].user_id || args[1].user_id;
    const user = id ? await User().where({id}).first() : null;
    return resolver(user, ...args)
  }
};

module.exports = resolvers;