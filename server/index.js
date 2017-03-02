require('dotenv').config();

const {createServer} = require('http');
const path = require('path');
const url = require('url');

const chalk = require('chalk');
const compression = require('compression');
const cors = require('cors');
const express = require('express');
const graphqlHTTP = require('express-graphql');
const _ = require('lodash');

const schema = require('./graphql');
const {JSONError, jwt} = require('./helpers');

const PORT = process.env.PORT || 4242;
const DEV_MODE = process.env.NODE_ENV == 'development';


const app = express();

app.use('/graphql', cors());
app.use('/graphql', graphqlHTTP((req) => {
  const authorization = req.headers['authorization'];
  if (authorization) {
    const [authType, token] = authorization.split(' ');
    if (authType == 'Bearer') {
      try {
        req.user_id = jwt.safeDecode(token).user_id;
      } catch (e) {
        const [messageStart, ...messageRest] = e.message.split(' ');
        throw JSONError({
          jwt: [(messageStart == 'jwt' ? messageRest : e.message.split(' ')).join('_')]
        });
      }
    }
  }
  return {
    schema,
    graphiql: DEV_MODE,
    formatError: (error) => {
      try {
        return {
          message: JSON.parse(error.message) && error.message,
          locations: error.locations
        };
      } catch (e) {
        console.error(error);
        return DEV_MODE
          ? {
            message: error.message,
            locations: error.locations,
            stack: error.stack
          }
          : {message: 'no can do'};
      }
    }
  };
}));

app.use(compression());
app.use(express.static('build'));
app.use((req, res) => res.sendFile(path.join(__dirname, '..', 'build', 'index.html')));

console.log(chalk.cyan('Starting...'));
createServer(app).listen(PORT, (err) => {
  if (err) throw err;
  console.log('  ' + chalk.cyan(`http://localhost:${PORT}`))
});