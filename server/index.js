require('dotenv').config();

const {createServer} = require('http');
const url = require('url');
const graphqlHTTP = require('express-graphql');
const _ = require('lodash');
const next = require('next');

const schema = require('./graphql');


const start = async () => {
  const app = next({dev: process.env.NODE_ENV == 'development'});
  const nextHandle = app.getRequestHandler();

  app.prepare();
  createServer((req, res) => {
    const {pathname} = url.parse(req.url, true);

    res.setHeader('Access-Control-Allow-Headers', req.headers.host);

    if (['GET', 'POST'].includes(req.method) && pathname === '/graphql') {
      graphqlHTTP({
        schema,
        graphiql: true,
        formatError: (error) => console.error(error) || (DEV_MODE
          ? _.pick(error, 'message', 'locations', 'stack')
          : {message: 'No can do'}
        )
      })(req,  res);
    } else {
      nextHandle(req, res);
    }
  })
    .listen(3000, (err) => {
      if (err) throw err;
      console.log('> Ready on http://localhost:3000');
    });
};

start().catch((e) => {
  console.error(e);
});