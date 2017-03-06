const entities = require('./entities')
const {createRelations, relationTypes} = require('./er')

const User = createRelations(entities.User, {
  propositions: [relationTypes.HAS_MANY, entities.Proposition, 'user_id'],
  votes: [relationTypes.HAS_MANY, entities.Vote, 'user_id']
})

const Proposition = createRelations(entities.Proposition, {
  language: [relationTypes.BELONGS_TO, entities.Language],
  user: [relationTypes.BELONGS_TO, entities.User],
  parent: [relationTypes.BELONGS_TO, entities.Proposition],
  votes: [relationTypes.HAS_MANY, entities.Vote, 'proposition_id']
})

const Vote = createRelations(entities.Vote, {
  proposition: [relationTypes.BELONGS_TO, entities.Proposition],
  user: [relationTypes.BELONGS_TO, entities.User]
})

module.exports = Object.assign({}, entities, {Proposition, User, Vote})
