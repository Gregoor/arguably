const fs = require('fs')
const path = require('path')
const es = require('event-stream')
const t = require('tcomb')
const uuid = require('uuid/v4')

function validateFields(data, fields, {isCreate} = {isCreate: true}) {
  const errors = {}

  for (const [key, rule] of Object.entries(fields)) {
    const keyType = typeof rule === 'object' ? rule.type : rule
    if ((isCreate || key in data) && !keyType.is(data[key])) {
      errors[key] = 'expected' + keyType.displayName
    }
  }

  Object.keys(data).filter((key) => !Object.keys(fields).includes(key)).forEach((key) => {
    errors[key] = 'unknown'
  })

  return Object.keys(errors).length ? errors : null
}

class Entity {

  constructor(entities, fields, metaFields = {}, addEvent) {
    Object.assign(this, {
      entities,
      fields,
      addEvent,
      metaFields: Object.assign({}, metaFields, {
        at: t.maybe(t.Date)
      })
    })
  }

  find({id}) {
    return this.entities.then((entities) => Object.assign({}, entities.get(id)))
  }

  async findAll(args) {
    const entities = await this.entities
    return Array.from(entities.values())
      .filter((entity) => Object.entries(args).every(([key, value]) => entity[key] === value))
      .map((entity) => Object.assign({}, entity))
  }

  validate(data, meta = {}, opts) {
    const metaErrors = validateFields(meta, this.metaFields, opts)
    const errors = Object.assign(
      metaErrors ? {_meta: metaErrors} : {},
      validateFields(data, this.fields, opts)
    )
    return Object.keys(errors).length ? errors : null
  }

  create(data, meta) {
    const id = uuid()
    if (this.validate(data, meta)) {
      return null
    }
    this.addEvent('CREATED', Object.assign({id}, data), meta)
    return id
  }

  update(id, data = {}, meta) {
    if (this.validate(data, meta, {isCreate: false})) {
      return false
    }
    this.addEvent('UPDATED', Object.assign({id}, data))
    return true
  }

  delete(id) {
    this.addEvent('DELETED', {id})
  }

}

const EVENT_FILE_PATH = path.join(__dirname, 'events.jsons')

function rehydrate(store) {
  return new Promise((resolve) => {
    if (!fs.existsSync(EVENT_FILE_PATH)) return resolve()
    const rehydrateStream = fs.createReadStream(EVENT_FILE_PATH)
      .pipe(es.split())
      .pipe(es.mapSync((line) => {
        rehydrateStream.pause()

        if (line.length) store.mergeEvent(JSON.parse(line))

        rehydrateStream.resume()
      }))
      .on('end', () => resolve())
  })
}

module.exports = function createEventLog() {
  const store = {
    entities: {},
    getEntities(entityName) {
      return this.entities[entityName] = this.entities[entityName] || new Map()
    },
    mergeEvent({type, entityName, data}) {
      const entities = this.getEntities(entityName)
      const {id} = data
      switch (type) {

        case 'CREATED':
          entities.set(id, Object.assign({}, {id}, data))
          break

        case 'UPDATED':
          Object.assign(entities.get(id), data)
          break

        case 'DELETED':
          entities.delete(id)
          break

        default:
          throw new Error('Unknown event of type ' + type)
      }
    }
  }

  function addEvent(entityName, type, data, meta = {}) {
    const event = Object.assign({}, {
      entityName,
      type,
      data,
      meta: Object.assign({at: new Date()}, meta),
      eventId: uuid()
    })
    fs.appendFileSync(EVENT_FILE_PATH, JSON.stringify(event) + '\n')
    store.mergeEvent(event)
  }

  const rehydratePromise = rehydrate(store)
  return (entityName, rules, metaFields) => new Entity(
    rehydratePromise.then(() => store.getEntities(entityName)),
    rules,
    metaFields,
    (...args) => addEvent(entityName, ...args)
  )
}
