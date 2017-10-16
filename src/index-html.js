export default ({css, js}, markup, styleTags) => `
  <!doctype html>
  <html lang="">
    <head>
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <meta charSet='utf-8' />
      <title>Arguably</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      ${css ? `<link rel="stylesheet" href="${css}">` : ''}
      <script src="${js}" defer ${process.env.NODE_ENV === 'development' ? 'crossorigin' : ''}></script>
      {styleTags}
    </head>
    <body>
      <div id="root">${markup}</div>
    </body>
  </html>
`
