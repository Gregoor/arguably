const t = require('tcomb')
const createEventLog = require('./event-log')

const createEntity = createEventLog()

const languages = {
  1: 'english',
  2: 'german'
}

const user = createEntity('user', {
  name: t.String,
  passwordHash: t.String,
  canVote: t.Boolean,
  canPublish: t.Boolean
})

const proposition = createEntity('proposition',
  {
    name: t.String,
    isGeneral: t.Boolean,
    languageId: t.enums.of(Object.keys(languages), 'Language'),
    published: t.Boolean,
    sourceURL: t.maybe(t.String),
    text: {type: t.String, default: ''}
  },
  {
    userId: t.String
  }
)

const propositionRelation = createEntity('propositionRelation',
  {
    parentPropositionId: t.String,
    childPropositionId: t.String,
    type: t.enums.of(['pro', 'contra'], 'PropositionType')
  },
  {
    userId: t.String
  }
)

const vote = createEntity('vote', {
  userId: t.String,
  propositionRelationId: t.String
})

module.exports = {
  languages, proposition, propositionRelation, user, vote
}
