const _ = require('lodash');

const knex = require('./knex');

/* [[ HELLO I'M A LIBRARY ]] */
const assignProperties = (Entity, properties) => Object.assign(
  Entity,
  _(properties).toPairs().map(([key, fn]) => [
    key,
    function(...args) {
      return assignProperties(fn(this.where ? this : this(), ...args), properties);
    }
  ]).fromPairs().value(),
  {properties: Object.keys(properties)}
);

const {BELONGS_TO} = {BELONGS_TO: 0};

const assignRelations = (query, relations) => Object.assign(query, _.mapValues(relations,
  ([relationType, ForeignEntity, foreignKey], name) => () => {
    if (relationType == BELONGS_TO) {
      return ForeignEntity()
        .whereRaw(`id = (${query.clone().first(foreignKey || name + '_id')})`)
        .first();
    } else {
      throw new Error(`Unexpected relation type: ${relationType}`);
    }
  }
));

const ER = {

  createEntity(tableName, properties = {}) {
    const Entity = (fields = {}) => knex(tableName).where(fields);
    return assignProperties(Entity, properties);
  },

  createRelations: (Entity, relations) => Object.assign(
    (...args) => assignRelations(Entity(...args), relations),
    _.fromPairs(Entity.properties.map((key) => [
      key, (...args) => assignRelations(Entity[key](...args), relations)
    ]))
  )

};
/* [[ LIBRARY OUT ]] */

const User = ER.createEntity('users', {
  firstByName: (qb, name) => (
    qb.where(knex.raw('lower(name)'), name.trim().toLowerCase()).first()
  )
});

let Proposition = ER.createEntity('propositions', {
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

Proposition = ER.createRelations(Proposition, {
  parent: [BELONGS_TO, Proposition],
  user: [BELONGS_TO, User]
});

module.exports = {Proposition, User};