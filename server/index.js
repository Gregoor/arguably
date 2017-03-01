require('dotenv').config();

const {createServer} = require('http');
const url = require('url');

const connect = require('connect');
const cors = require('cors');
const gzip = require('connect-gzip');
const graphqlHTTP = require('express-graphql');
const _ = require('lodash');

const schema = require('./graphql');
const {JSONError, jwt} = require('./helpers');

const PORT = process.env.PORT || 4242;
const DEV_MODE = process.env.NODE_ENV == 'development';


const app = connect();

app.use('/graphql', cors());
app.use('/graphql', (req, res) => {
  const authorization = req.headers['authorization'];
  if (authorization) {
    const [authType, token] = authorization.split(' ');
    if (authType == 'Bearer') {
      try {
        req.user_id = jwt.safeDecode(token).user_id;
      } catch (e) {
        const [messageStart, ...messageRest] = e.message.split(' ');
        throw JSONError({jwt: [messageStart == 'jwt' ? messageRest.join(' ') : e.message]});
      }
    }
  }
  graphqlHTTP({
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
  })(req, res);
});

app.use(gzip.staticGzip('build'));

createServer(app).listen(PORT, (err) => {
  if (err) throw err;
  console.log('> Ready on', PORT);
});