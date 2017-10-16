const fs = require('fs')

const events = fs.readFileSync('./events.jsons', 'utf-8').split('\n').map((line) => line && JSON.parse(line))
const newEvents = []
const eventIds = new Set()
for (const event of events) {
  const {eventId} = event
  if (!eventIds.has(eventId)) {
    eventIds.add(eventId)
    newEvents.push(event)
  }
}

console.log(events.length - newEvents.length)

fs.writeFileSync('./events2.jsons', newEvents.map((e) => JSON.stringify(e)).join('\n'), 'utf-8')
