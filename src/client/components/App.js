import React from 'react'
import {Route} from 'react-router-dom'
import {injectGlobal} from 'styled-components'
import IndexPage from './pages/IndexPage'

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

export default () => (
  <div>
    <Route exact path="/" component={IndexPage}/>
  </div>
)
