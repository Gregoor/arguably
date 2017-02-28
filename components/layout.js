import _ from 'lodash';
import Link from 'next/link';
import Router from 'next/router';
import {Provider} from 'react-redux';
import Relay from 'react-relay';
import {RelayNetworkLayer, urlMiddleware, authMiddleware} from 'react-relay-network-layer';

import store from '../client/store';
import {PageContainer} from './ui';


Relay.injectNetworkLayer(new RelayNetworkLayer([
  urlMiddleware({url: process.env.GRAPHQL_ENDPOINT}),
  authMiddleware({
    allowEmptyToken: true,
    token: () => store.getState().state.jwt
  })
], { disableBatchQuery: true }));

const logout = () => store.dispatch({type: 'LOGOUT'});

const Header = Relay.createContainer(
  ({viewer: {user}}) => (
    <div style={{
      marginBottom: 8, padding: 8,
      display: 'flex', flexDirection: 'row', justifyContent: 'space-between'
    }}>
      <Link href="/"><a>View all Propositions</a></Link>
      {user
        ? <div>Logged in as <b>{user.name}</b> (<a href="/" onClick={logout}>Logout</a>)</div>
        : <Link href="/auth"><a>Login/Register</a></Link>
      }
    </div>
  ),
  {fragments: {viewer: () => Relay.QL`
    fragment on Viewer {
      user {
        name
      }
    }
  `}}
);

export default (Component, queries = ['viewer']) => (
  <PageContainer>
    <Provider store={store}>
      <Relay.RootContainer
        route={{
          name: 'ViewerRoute',
          queries: _.pick({
            node:   () => Relay.QL`query { node(id: $nodeID) }`,
            viewer: () => Relay.QL`query { viewer }`
          }, queries),
          params: {
            nodeID: (Router.router && Router.router.query.id) || ''
          }
        }}
        Component={Relay.createContainer(
          (props) => <div><Header {...props}/><Component {...props}/></div>,
          {fragments: _.pick({
            node: () => Relay.QL`
              fragment on Node {
                ${Component.getFragment('node')}
              }
            `,
            viewer: () => Relay.QL`
              fragment on Viewer {
                ${Component.getFragment('viewer')}
                ${Header.getFragment('viewer')}
              }
            `
          }, queries.concat('viewer'))}
        )}/>
    </Provider>
  </PageContainer>
);