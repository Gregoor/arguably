const _ = require('lodash');

const knex = require('./knex');

/* [[ HELLO I'M A LIBRARY ]] */
const {BELONGS_TO} = {BELONGS_TO: 0};

const ER = {

  createEntity(tableName, properties = {}) {
    const Entity = (fields = {}) => knex(tableName).where(fields);
    return Object.assign(Entity, properties);
  },

  createRelations: (Entity, relations) => Object.assign((...args) => {
    const entityQuery = Entity(...args);
    return Object.assign(entityQuery, _.mapValues(relations,
      ([relationType, ForeignEntity, foreignKey], name) => () => {
        if (relationType == BELONGS_TO) {
          return ForeignEntity()
            .whereRaw(`id = (${entityQuery.clone().first(foreignKey || name + '_id')})`)
            .first();
        } else {
          throw new Error('Unexpected relation type');
        }
      }
    ));
  }, Entity)

};
/* [[ LIBRARY OUT ]] */

let Proposition = ER.createEntity('propositions', {
  forUser: (user) => (
    knex('propositions').where(function() {
      if (user) {
        if (user.can_publish) return;
        this.where('user_id', user.id);
      }
      this.orWhere('published', true)
    })
  )
});

Proposition = ER.createRelations(Proposition, {
  parent: [BELONGS_TO, Proposition]
});

const User = ER.createEntity('users', {
  firstByName: (name) => (
    knex('users').where(knex.raw('lower(name)'), name.trim().toLowerCase()).first()
  )
});

module.exports = {Proposition, User};