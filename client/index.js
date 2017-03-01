import NProgress from 'nprogress';
import '../node_modules/nprogress/nprogress.css';
import React from 'react';
import ReactDOM from 'react-dom';
import Relay from 'react-relay';
import {RelayNetworkLayer, authMiddleware, loggerMiddleware} from 'react-relay-network-layer';
import {applyRouterMiddleware, browserHistory, IndexRoute, Router, Route} from 'react-router';
import useRelay from 'react-router-relay';

import store from './store';
import Layout from './layout';

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
      window.np = NProgress;
      NProgress.start();
      relayReqObj.then(() => NProgress.done());
    }
  })
], {disableBatchQuery: true}));

const node = () => Relay.QL`query { node(id: $nodeID) }`;
const viewer = () => Relay.QL`query { viewer }`;

ReactDOM.render(
  <Router
    history={browserHistory}
    render={applyRouterMiddleware(useRelay)}
    environment={Relay.Store}
  >
    <Route path="/" component={Layout} queries={{viewer}}>
      <IndexRoute component={IndexPage} queries={{viewer}}/>
      <Route path="auth" component={AuthPage}/>
      <Route path="proposition/:nodeID" component={PropositionPage} queries={{node, viewer}}/>
    </Route>
  </Router>,
  document.getElementById('root')
);