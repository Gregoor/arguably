const _ = require('lodash');

const knex = require('./knex');

/* [[ HELLO I'M A LIBRARY ]] */
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
    return Object.assign(Entity, properties, {properties: Object.keys(properties)});
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
  firstByName: (name) => (
    knex('users').where(knex.raw('lower(name)'), name.trim().toLowerCase()).first()
  )
});

let Proposition = ER.createEntity('propositions', {
  forUserView: (user, fields = {}) => (
    knex('propositions').where(fields).where((query) => {
      if (user) {
        if (user.can_publish) return;
        query.where('user_id', user.id);
      }
      query.orWhere('published', true)
    })
  ),
  forUserChange: (user, fields = {}) => (
    knex('propositions').where(fields).where((query) => {
      if (user.can_publish) return;
      query.where({published: false, user_id: user.id});
    })
  )
});

Proposition = ER.createRelations(Proposition, {
  parent: [BELONGS_TO, Proposition],
  user: [BELONGS_TO, User]
});

module.exports = {Proposition, User};