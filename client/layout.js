import React from 'react';
import {Provider} from 'react-redux';
import Relay from 'react-relay';
import {Link} from 'react-router';
import styled from 'styled-components';

import LogoutMutaiton from './mutations/logout';
import store from './store';


const PageContainer = styled.div`
  margin: 0 auto;
  padding-top: 16px;
  max-width: 700px;
`;

const logout = () => {
  store.dispatch({type: 'LOGOUT'});
  Relay.Store.commitUpdate(new LogoutMutaiton());
};

export default Relay.createContainer(
  ({children, viewer: {user}}) => (
    <Provider store={store}><PageContainer>
      <div style={{
        marginBottom: 8, padding: 8,
        display: 'flex', flexDirection: 'row', justifyContent: 'space-between'
      }}>
        <Link to="/">View all Propositions</Link>
        <h1 style={{margin: 0, fontVariant: 'small-caps'}}>Arguably</h1>
        {user
          ? <div>Logged in as <b>{user.name}</b> (<a href="#" onClick={logout}>Logout</a>)</div>
          : <Link href="/auth">Login/Register</Link>
        }
      </div>
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