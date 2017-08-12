import React from 'react'
import Document, {Head, Main, NextScript} from 'next/document'
import {injectGlobal, ServerStyleSheet} from 'styled-components'

injectGlobal`
  html > body {
    font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif !important;
    background-color: #FAFAFA;
    width: 100%;
    min-height: 100%;
    margin: 0;
  }
  html, body, input, textarea, button  {
    font-family: 'Helvetica', 'Arial', sans-serif;
    font-size: 16px;
    font-weight: 400;
    line-height: 20px;
  }
  
  a:-webkit-any-link {
    color: #1976D2;
  }
`

export default class MyDocument extends Document {

  render() {
    const sheet = new ServerStyleSheet()
    const main = sheet.collectStyles(<Main/>)
    const styleTags = sheet.getStyleElement()
    return (
      <html lang="en">
        <Head>
          {styleTags}
        </Head>
        <body>
          <div className='root'>
            {main}
          </div>
          <NextScript/>
        </body>
      </html>
    )
  }

}
