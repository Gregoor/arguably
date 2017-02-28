require('dotenv').config();

const {createServer} = require('http');
const url = require('url');
const graphqlHTTP = require('express-graphql');
const _ = require('lodash');
const next = require('next');

const schema = require('./graphql');
const {JSONError, jwt} = require('./helpers');


const PORT = process.env.PORT || 3000;

const start = async () => {
  const app = next({dev: process.env.NODE_ENV == 'development'});
  const nextHandle = app.getRequestHandler();

  app.prepare();
  createServer((req, res) => {
    const {pathname} = url.parse(req.url, true);

    res.setHeader('Access-Control-Allow-Headers', req.headers.host);

    if (['GET', 'POST'].includes(req.method) && pathname === '/graphql') {
      handleGraphQL(req, res);
    } else {
      nextHandle(req, res);
    }
  })
    .listen(PORT, (err) => {
      if (err) throw err;
      console.log('> Ready on', PORT);
    });
};

const handleGraphQL = (req, res) => {
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
    graphiql: process.env.NODE_ENV != 'production',
    formatError: (error) => {
      try {
        return {
          message: JSON.parse(error.message) && error.message,
          locations: error.locations
        };
      } catch (e) {
        console.error(error);
        return process.env.NODE_ENV == 'development'
          ? {
            message: error.message,
            locations: error.locations,
            stack: error.stack
          }
          : {message: 'no can do'};
      }
    }
  })(req, res);
};

start().catch((e) => {
  console.error(e);
});