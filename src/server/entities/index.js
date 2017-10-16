import t from 'tcomb'
import createEventLog from './event-log'

const createEntity = createEventLog()

export const languages = {
  1: 'english',
  2: 'german'
}

export const User = createEntity('user', {
  name: t.String,
  passwordHash: t.String,
  canVote: t.Boolean,
  canPublish: t.Boolean
})

export const Proposition = createEntity('proposition',
  {
    name: t.String,
    languageId: t.enums.of(Object.keys(languages), 'Language'),
    published: t.Boolean,
    sourceURL: t.maybe(t.String),
    text: {type: t.String, default: ''}
  },
  {
    userId: t.String
  }
)

export const PropositionRelation = createEntity('propositionRelation',
  {
    parentId: t.maybe(t.String),
    propositionId: t.String,
    type: t.maybe(t.enums.of(['pro', 'contra'], 'PropositionType'))
  },
  {
    userId: t.String
  }
)

export const Vote = createEntity('vote', {
  userId: t.String,
  propositionRelationId: t.String
})
