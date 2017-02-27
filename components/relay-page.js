import Relay from 'react-relay';
import _ from 'lodash';
import Router from 'next/router';

import {PageContainer} from './ui';

Relay.injectNetworkLayer(
  new Relay.DefaultNetworkLayer(process.env.GRAPHQL_ENDPOINT)
);

export default (Component, queries = ['viewer']) => (
  <PageContainer>
    <Relay.RootContainer
      route={{
        name: 'ViewerRoute',
        queries: _.pick({
          viewer: () => Relay.QL`query { viewer }`,
          node:   () => Relay.QL`query { node(id: $nodeID) }`
        }, queries),
        params: {
          nodeID: (Router.router && Router.router.query.id) || ''
        }
      }}
      Component={Component}/>
  </PageContainer>
);