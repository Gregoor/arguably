const fs = require('fs');
const path = require('path');

const {graphql}  = require('graphql');
const {introspectionQuery, printSchema} = require('graphql/utilities');

const schema = require('../server/graphql');


const schemaPath = path.join(__dirname, '..', 'data');

if (!fs.statSync(schemaPath)) fs.mkdirSync(schemaPath);

const schemaFilePath = path.join(schemaPath, 'schema');

fs.writeFileSync(
  `${schemaFilePath}.graphql`,
  printSchema(schema)
);

graphql(schema, introspectionQuery).then((result) => {
  fs.writeFileSync(
    `${schemaFilePath}.json`,
    JSON.stringify(result, null, 2)
  );
  process.exit();
});
