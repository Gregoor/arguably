import NProgress from 'nprogress';
import '../node_modules/nprogress/nprogress.css';
import React from 'react';
import ReactDOM from 'react-dom';
import Relay from 'react-relay';
import {RelayNetworkLayer, authMiddleware, loggerMiddleware} from 'react-relay-network-layer';
import {applyRouterMiddleware, browserHistory, IndexRoute, Router, Route} from 'react-router';
import useRelay from 'react-router-relay';
import {injectGlobal} from 'styled-components';

import store from './store';
import Layout from './components/layout';
import logout from './logout';

import AuthPage from './pages/auth';
import PropositionPage from './pages/proposition';
import IndexPage from './pages/index';


Relay.injectNetworkLayer(new RelayNetworkLayer([
  authMiddleware({
    allowEmptyToken: true,
    token: () => store.getState().state.jwt
  }),
  loggerMiddleware({
    logger: (text, {relayReqObj}) => {
      if (!relayReqObj) return;
      NProgress.start();
      relayReqObj.then(() => NProgress.done());
    }
  })
], {disableBatchQuery: true}));

const node = () => Relay.QL`query { node(id: $nodeID) }`;
const viewer = () => Relay.QL`query { viewer }`;

const logoutOnInvalidToken = ({error, props}) => {
  if (error && error.json) {
    for (const {message} of error.json.errors) {
      console.error(message);
      const parsedError = JSON.parse(message);

      if (parsedError.jwt) {
        logout();
        location.href = '/';
      }
    }
  }
  return props && <Layout {...props} />;
};

// eslint-disable-next-line
injectGlobal`
  html > body {
    font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif !important;
    background-color: #FAFAFA;
    width: 100%;
    min-height: 100%;
    margin: 0;
  }
  html, body, input, textarea {
    font-family: 'Helvetica', 'Arial', sans-serif;
    font-size: 16px;
    font-weight: 400;
    line-height: 20px;
  }
  
  a:-webkit-any-link {
    color: #1976D2;
  }
`;

ReactDOM.render(
  <Router
    history={browserHistory}
    render={applyRouterMiddleware(useRelay)}
    environment={Relay.Store}
  >
    <Route path="/" component={Layout} queries={{viewer}} render={logoutOnInvalidToken}>
      <IndexRoute component={IndexPage} queries={{viewer}}/>
      <Route path="auth" component={AuthPage}/>
      <Route path="proposition/:nodeID" component={PropositionPage} queries={{node, viewer}}/>
    </Route>
  </Router>,
  document.getElementById('root')
);