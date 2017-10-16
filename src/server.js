import express from 'express'
import graphqlHTTP from 'express-graphql'
// import React from 'react'
// import {StaticRouter} from 'react-router-dom'
// import {renderToString} from 'react-dom/server'
// import {ServerStyleSheet} from 'styled-components'
// import App from './client/components/App'
import schema from './server/graphql'
// import indexHTML from './index-html'

// const assets = require(process.env.RAZZLE_ASSETS_MANIFEST)

const dev = process.env.NODE_ENV === 'development'

export default express()
  .disable('x-powered-by')
  .use(express.static(process.env.RAZZLE_PUBLIC_DIR))
  .use('/graphql', graphqlHTTP({
    schema,
    graphiql: true,
    formatError(error) {
      console.error(error)
      if (dev) return error
    }
  }))
  // .get('/*', (req, res) => {
  //   const context = {}
  //   let app = (
  //     <StaticRouter context={context} location={req.url}>
  //       <App/>
  //     </StaticRouter>
  //   )
  //   renderToString(app)
  //
  //   if (context.url) {
  //     res.redirect(context.url)
  //   } else {
  //     const sheet = new ServerStyleSheet()
  //     app = sheet.collectStyles(app)
  //     const styleTags = sheet.getStyleElement()
  //     res.status(200).send(indexHTML(assets.client, renderToString(app), styleTags))
  //   }
  // })
