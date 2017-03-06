const {createEntity} = require('./er');
const knex = require('../knex');


const Proposition = createEntity('propositions', {
  forUserView: (qb, user, fields = {}) => (
    qb.where(fields).where((qb) => {
      if (user) {
        if (user.can_publish) return;
        qb.where('user_id', user.id);
      }
      qb.orWhere('published', true)
    })
  ),
  forUserChange: (qb, user, fields = {}) => (
    qb.where(fields).where((qb) => {
      if (user.can_publish) return;
      qb.where({published: false, user_id: user.id});
    })
  ),
  search: (qb, query) => {
    if (query) qb.whereRaw(
      "to_tsvector(name || ' ' || text) @@ to_tsquery(?)",
      [query.trim().split(' ').map((str) => str + ':*').join(' & ')]
    );
    return qb;
  }
});

const User = createEntity('users', {
  firstByName: (qb, name) => (
    qb.where(knex.raw('lower(name)'), name.trim().toLowerCase()).first()
  )
});

const Vote = createEntity('votes');


module.exports = {Proposition, User, Vote};