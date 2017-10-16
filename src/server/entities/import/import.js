// const {proposition, propositionRelation, user, vote} = require('../')
// const users = require('./users.json')
// const propositions = require('./propositions.json')
// const votes = require('./votes.json')
//
// const userIdRemap = new Map()
// for (const userData of users) {
//   const {
//     id: oldId,
//     name,
//     password_hash: passwordHash,
//     can_vote: canVote,
//     can_publish: canPublish
//   } = userData
//   const data = {name, passwordHash: passwordHash || '', canVote, canPublish}
//   const errors = user.validate(data)
//   if (errors) {
//     console.error(errors)
//     process.exit()
//   }
//   const newId = user.create(data)
//   userIdRemap.set(oldId, newId)
// }
//
// const relations = []
// const propositionIdRemap = new Map()
// for (const propositionData of propositions) {
//   const {
//     id: oldId,
//     name, text,
//     parent_id: parentId,
//     type,
//     source_url: sourceURL,
//     user_id: userId,
//     published,
//     created_at: createdAt
//     // votes_count: votesCount,
//     // language_id: languageId
//   } = propositionData
//   const data = {
//     name,
//     text,
//     sourceURL,
//     published,
//     languageId: 1,
//     isGeneral: !!parentId
//   }
//   const meta = {userId: userIdRemap.get(userId), at: new Date(createdAt)}
//   const errors = proposition.validate(data, meta)
//   if (errors) {
//     console.error(errors)
//     process.exit()
//   }
//   const newId = proposition.create(data, meta)
//   propositionIdRemap.set(oldId, newId)
//   if (parentId) {
//     relations.push({childPropositionId: oldId, parentPropositionId: parentId, type, userId})
//   }
// }
//
// const propositionChildRelationRemap = new Map()
// for (const {childPropositionId, parentPropositionId, type, userId} of relations) {
//   if (!propositionIdRemap.get(parentPropositionId)) {
//     continue
//   }
//   const data = {
//     childPropositionId: propositionIdRemap.get(childPropositionId),
//     parentPropositionId: propositionIdRemap.get(parentPropositionId),
//     type
//   }
//   const meta = {userId: userIdRemap.get(userId)}
//   const errors = propositionRelation.validate(data, meta)
//   if (errors) {
//     console.error(errors)
//     process.exit()
//   }
//   const newId = propositionRelation.create(data, meta)
//   propositionChildRelationRemap.set(childPropositionId, newId)
// }
//
// for (const voteData of votes) {
//   const {
//     user_id: userId,
//     proposition_id: propositionId,
//     created_at: createdAt
//   } = voteData
//   if (!propositionChildRelationRemap.get(propositionId)) continue
//   const data = {
//     userId: userIdRemap.get(userId),
//     propositionRelationId: propositionChildRelationRemap.get(propositionId)
//   }
//   const meta = {at: new Date(createdAt)}
//   const errors = vote.validate(data, meta)
//   if (errors) {
//     console.error(errors)
//     process.exit()
//   }
//   vote.create(data, meta)
// }
