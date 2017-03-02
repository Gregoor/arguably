const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const {graphql}  = require('graphql');
const {introspectionQuery, printSchema} = require('graphql/utilities');

const schema = require('../server/graphql');


console.log('Rebuilding...');
const schemaPath = path.join(__dirname, '..', 'data');

if (!fs.existsSync(schemaPath)) fs.mkdirSync(schemaPath);

const schemaFilePath = path.join(schemaPath, 'schema');

fs.writeFileSync(
  `${schemaFilePath}.graphql`,
  printSchema(schema)
);

graphql(schema, introspectionQuery).then((result) => {
  const filePath = `${schemaFilePath}.json`;
  const json = JSON.stringify(result, null, 2);

  if (fs.statSync(filePath) && fs.readFileSync(filePath, 'utf-8') != json) {
    console.log(chalk.yellow('Schema changed. You should restart the client process!'));
  } else {
    console.log(chalk.green('Done'));
  }

  fs.writeFileSync(filePath, json);
  process.exit();
});
