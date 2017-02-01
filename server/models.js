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
  orderByChildCount() {
    return knex.with('propositions', (qb) => (
      qb
        .select('propositions.*').count('children.id AS child_count')
        .from('propositions')
        .leftJoin('propositions AS children', 'children.parent_id', 'propositions.id')
        .orderBy('child_count', 'DESC').groupBy('propositions.id')
    )).from('propositions');
  }
});

Proposition = ER.createRelations(Proposition, {
  parent: [BELONGS_TO, Proposition]
});

module.exports = {Proposition};