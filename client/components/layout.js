import React from 'react';
import {Provider} from 'react-redux';
import Relay from 'react-relay';
import {Link} from 'react-router';
import styled from 'styled-components';

import logout from '../logout'
import store from '../store';

const PageContainer = styled.div`
  margin: 0 auto;
  padding-top: 16px;
  max-width: 700px;
`;

const Header = styled.div`
  margin-bottom: 16px;
  padding: 8px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const AppTitle = styled.h1`
  margin: 0;
  position: absolute;
  font-variant: small-caps;
  left: 50%;
  transform: translate(-50%, 0);
`;

export default Relay.createContainer(
  ({children, viewer: {user}}) => (
    <Provider store={store}><PageContainer>
      <Header>
        <Link to="/">View all Propositions</Link>
        <AppTitle>Arguably</AppTitle>
        {user
          ? <div>Logged in as <b>{user.name}</b> (<a href="#" onClick={logout}>Logout</a>)</div>
          : <Link href="/auth">Login/Register</Link>
        }
      </Header>
      {children}
    </PageContainer></Provider>
  ),
  {fragments: {viewer: () => Relay.QL`
    fragment on Viewer {
      user {
        name
      }
    }
  `}}
);