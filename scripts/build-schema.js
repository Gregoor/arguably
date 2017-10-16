const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const {graphql} = require('graphql')
const {introspectionQuery, printSchema} = require('graphql/utilities')
const schema = require('../src/server/graphql')

console.log('Rebuilding...')
const schemaPath = path.join(__dirname, '..', 'data')

if (!fs.existsSync(schemaPath)) fs.mkdirSync(schemaPath)

const schemaFilePath = path.join(schemaPath, 'schema')

graphql(schema, introspectionQuery).then((result) => {
  const filePath = `${schemaFilePath}.json`
  const json = JSON.stringify(result, null, 2)

  if (fs.existsSync(filePath)) {
    if (fs.readFileSync(filePath, 'utf-8') !== json) {
      console.log(chalk.yellow('Schema changed. You should restart the client process!'))
    } else {
      process.exit()
    }
  } else {
    console.log(chalk.green('Nothing changed'))
  }

  fs.writeFileSync(filePath, json)
  fs.writeFileSync(
    `${schemaFilePath}.graphql`,
    printSchema(schema)
  )
  process.exit()
})
