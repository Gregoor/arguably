const {createServer} = require('http')
const {parse} = require('url')
const graphqlHTTP = require('express-graphql')
const next = require('next')
const schema = require('./graphql')

const dev = process.env.NODE_ENV !== 'production'
const app = next({dev})
const handle = app.getRequestHandler()

async function startServer() {
  await app.prepare()
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    const {pathname, query} = parsedUrl
    if (pathname === '/graphql') {
      graphqlHTTP({
        schema,
        graphiql: true,
        formatError(error) {
          console.error(error)
          if (dev) return error
        }
      })(req, res)
    } else if (pathname.startsWith('/search/')) {
      app.render(req, res, '/', query)
    } else {
      handle(req, res, parsedUrl)
    }
  })
    .listen(3000, (err) => {
      if (err) throw err
      console.log('> Ready on http://localhost:3000')
    })
}

startServer().catch((e) => console.error(e))
