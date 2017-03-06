const _ = require('lodash');

const knex = require('../knex');


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

const relationTypes = _(['BELONGS_TO', 'HAS_MANY']).map((key) => [key, key]).fromPairs().value();

const assignRelations = (qb, relations) => Object.assign(qb, _.mapValues(relations,
  ([relationType, ForeignEntity, foreignKey], relationName) => () => {
    switch (relationType) {

      case relationTypes.BELONGS_TO:
        return ForeignEntity()
          .whereRaw(`id = (${qb.clone().first(foreignKey || relationName + '_id')})`)
          .first();

      case relationTypes.HAS_MANY:
        return ForeignEntity().whereIn(foreignKey, knex.raw(qb.clone().first('id')));

      default:
        throw new Error(`Unexpected relation type: ${relationType}`);

    }
  }
));

module.exports = {

  createEntity(tableName, properties = {}) {
    const Entity = (fields = {}) => knex(tableName).where(fields);
    return assignProperties(Entity, properties);
  },

  createRelations: (Entity, relations) => Object.assign(
    (...args) => assignRelations(Entity(...args), relations),
    _.fromPairs(Entity.properties.map((key) => [
      key, (...args) => assignRelations(Entity[key](...args), relations)
    ]))
  ),

  relationTypes

};