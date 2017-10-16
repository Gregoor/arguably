const fs = require('fs')
const {pick} = require('lodash')
const uuid = require('uuid/v4')

const newEvents = []
const proprels = new Map()

const events = fs.readFileSync('./events.jsons', 'utf-8').split('\n').map((line) => line && JSON.parse(line))

for (const event of events) {
  switch (event.entityName) {
    // case 'proposition':
    //   if (event.data.isGeneral) {
    //     const id = uuid()
    //     proprels.set(event.data.id, id)
    //     newEvents.push({
    //       'entityName': 'propositionRelation',
    //       'type': 'CREATED',
    //       'data': {
    //         id,
    //         'childPropositionId': event.data.id
    //       },
    //       'meta': pick(event.meta, 'at', 'userId'),
    //       'eventId': uuid()
    //     })
    //   }
    //   delete event.data.isGeneral
    //   continue

    case 'PropositionRelation':
      proprels.set(event.data.childPropositionId, event.data.id)
      // console.log(idMap.has(event.data.parentPropositionId))
      // delete event.data.parentPropositionId
      continue

    default:
      newEvents.push(event)
  }
}

for (const event of events) {
  switch (event.entityName) {

    case 'Proposition':
      if (event.data.isGeneral) {
        const id = uuid()
        proprels.set(event.data.id, id)
        newEvents.push({
          'entityName': 'PropositionRelation',
          'type': 'CREATED',
          'data': {
            id,
            'childPropositionId': event.data.id
          },
          'meta': pick(event.meta, 'at', 'userId'),
          'eventId': uuid()
        })
      } else if (!proprels.has(event.data.id)) continue
      delete event.data.isGeneral
      newEvents.push(event)
      continue

    case 'PropositionRelation':
      if (!proprels.has(event.data.parentPropositionId)) continue
      event.data.parentPropositionRelationId = proprels.get(event.data.parentPropositionId)
      delete event.data.parentPropositionId
      newEvents.push(event)
      continue

    default:
      newEvents.push(event)

  }
}

console.log(events.length - newEvents.length)

fs.writeFileSync('./events2.jsons', newEvents.map((e) => JSON.stringify(e)).join('\n'), 'utf-8')
